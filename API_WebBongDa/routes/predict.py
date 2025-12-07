from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from bson import ObjectId
from schemas import EventCreate, MatchCreate, MatchDetailResponse, MatchInfoUpdate, MatchResponse, PredictionCreate, FavoriteTeamVote, MatchScoreUpdate
from database import match_collection, prediction_collection, vote_collection
from dependencies import get_current_user, RoleChecker
from socket_manager import manager

router = APIRouter()

# Hàm hỗ trợ tạo start_time từ chuỗi date + kickoff (để sắp xếp)
def create_start_time(date_str, time_str):
    try:
        # Giả sử date_str="2025-01-20", time_str="05:00"
        dt_str = f"{date_str} {time_str}"
        return datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
    except:
        return datetime.utcnow()
    
# --- ADMIN: TẠO TRẬN ĐẤU ---
@router.post("/matches", response_model=MatchResponse)
async def create_match(
    match_in: MatchCreate, 
    current_user: dict = Depends(RoleChecker(["admin"]))
):
    new_match = match_in.dict()
    new_match["is_locked"] = False
    
    # Tính toán start_time để dùng cho việc sắp xếp/khóa logic
    new_match["start_time"] = create_start_time(match_in.date, match_in.kickoff)
    
    result = await match_collection.insert_one(new_match)
    new_match["id"] = str(result.inserted_id)
    return new_match

@router.put("/matches/{match_id}/lock")
async def lock_match(
    match_id: str, 
    current_user: dict = Depends(RoleChecker(["admin"]))
):
    # Admin khoá trận đấu thủ công
    result = await match_collection.update_one(
        {"_id": ObjectId(match_id)}, 
        {"$set": {"is_locked": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy trận đấu")
    return {"message": "Đã khoá dự đoán trận đấu này"}

# --- USER: DỰ ĐOÁN TỈ SỐ ---
@router.post("/predict")
async def predict_match(
    prediction: PredictionCreate,
    current_user: dict = Depends(get_current_user)
):
    # 1. Kiểm tra trận đấu tồn tại không
    if not ObjectId.is_valid(prediction.match_id):
        raise HTTPException(status_code=400, detail="ID trận đấu không hợp lệ")
        
    match = await match_collection.find_one({"_id": ObjectId(prediction.match_id)})
    if not match:
        raise HTTPException(status_code=404, detail="Trận đấu không tồn tại")

    # 2. Kiểm tra thời gian (Khóa trước khi trận bắt đầu)
    if match.get("is_locked") or datetime.utcnow() >= match["start_time"]:
        raise HTTPException(status_code=400, detail="Đã hết thời gian dự đoán cho trận này")

    # 3. Kiểm tra User đã dự đoán trận này chưa (Mỗi người 1 lần/trận)
    existing_pred = await prediction_collection.find_one({
        "user_msv": current_user["msv"],
        "match_id": prediction.match_id
    })
    
    if existing_pred:
        # Nếu muốn cho update thì dùng update_one, còn yêu cầu "1 lần" thì báo lỗi
        raise HTTPException(status_code=400, detail="Bạn đã dự đoán trận này rồi. Không được sửa.")

    # 4. Lưu dự đoán
    new_pred = {
        "user_msv": current_user["msv"],
        "match_id": prediction.match_id,
        "score_a": prediction.score_a,
        "score_b": prediction.score_b,
        "created_at": datetime.utcnow()
    }
    await prediction_collection.insert_one(new_pred)
    return {"message": "Dự đoán thành công!"}

# --- USER: BÌNH CHỌN 3 ĐỘI YÊU THÍCH ---
@router.post("/vote-teams")
async def vote_favorite_teams(
    vote_in: FavoriteTeamVote,
    current_user: dict = Depends(get_current_user)
):
    # 1. Kiểm tra xem user đã bình chọn chưa (chỉ 1 lần cho cả giải)
    if await vote_collection.find_one({"user_msv": current_user["msv"]}):
        raise HTTPException(status_code=400, detail="Bạn đã bình chọn đội yêu thích rồi.")

    # 2. Lưu bình chọn
    vote_data = {
        "user_msv": current_user["msv"],
        "teams": vote_in.teams, # List 3 đội
        "created_at": datetime.utcnow()
    }
    await vote_collection.insert_one(vote_data)
    return {"message": "Đã lưu bình chọn 3 đội yêu thích."}

# --- ADMIN: CẬP NHẬT TỶ SỐ & BROADCAST ---
@router.put("/matches/{match_id}/score")
async def update_match_score(
    match_id: str,
    score_in: MatchScoreUpdate,
    current_user: dict = Depends(RoleChecker(["admin"]))
):
    if not ObjectId.is_valid(match_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    # 1. Cập nhật vào Database
    result = await match_collection.update_one(
        {"_id": ObjectId(match_id)},
        {"$set": {
            "score_a": score_in.score_a, 
            "score_b": score_in.score_b
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy trận đấu")

    # 2. Lấy thông tin mới nhất để gửi qua Socket
    updated_match = await match_collection.find_one({"_id": ObjectId(match_id)})
    
    # 3. Gửi thông báo realtime cho tất cả user đang xem
    await manager.broadcast({
        "event": "SCORE_UPDATE",
        "data": {
            "match_id": match_id,
            "team_a": updated_match["team_a"],
            "team_b": updated_match["team_b"],
            "score_a": updated_match.get("score_a", 0),
            "score_b": updated_match.get("score_b", 0)
        }
    })

    return {"message": "Đã cập nhật tỷ số và thông báo tới người xem"}

# --- USER: LẤY CHI TIẾT TRẬN ĐẤU (QUAN TRỌNG) ---
@router.get("/matches/{match_id}", response_model=MatchDetailResponse)
async def get_match_detail(match_id: str):
    if not ObjectId.is_valid(match_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    # 1. Lấy thông tin trận đấu
    match = await match_collection.find_one({"_id": ObjectId(match_id)})
    if not match:
        raise HTTPException(status_code=404, detail="Không tìm thấy trận đấu")

    # 2. Lấy danh sách dự đoán của trận này
    preds_cursor = prediction_collection.find({"match_id": match_id})
    predictions = await preds_cursor.to_list(length=1000)

    # 3. Tính toán thống kê & Danh sách người chơi
    total = len(predictions)
    wins_a, wins_b, draws = 0, 0, 0
    predictors_list = []

    for p in predictions:
        s_a, s_b = p["score_a"], p["score_b"]
        
        # Tính Stats
        if s_a > s_b: wins_a += 1
        elif s_b > s_a: wins_b += 1
        else: draws += 1
        
        # Thêm vào danh sách hiển thị (Tạm dùng MSV làm tên)
        predictors_list.append({
            "name": p["user_msv"], # Sau này có thể join bảng User để lấy full_name
            "pick": f"{s_a}-{s_b}"
        })

    # Tính %
    stats = {
        "total": total,
        "home_percent": int((wins_a / total) * 100) if total > 0 else 0,
        "away_percent": int((wins_b / total) * 100) if total > 0 else 0,
        "draw_percent": 0
    }
    # Phần trăm hòa = 100 - (thắng + thua) để tránh lẻ số
    if total > 0:
        stats["draw_percent"] = 100 - stats["home_percent"] - stats["away_percent"]

    # 4. Trả về kết quả
    return {
        **match,
        "id": str(match["_id"]),
        "events": match.get("events", []), # Lấy events từ DB (nếu có)
        "stats": stats,
        "predictors": predictors_list
    }

# --- ADMIN: THÊM SỰ KIỆN (BÀN THẮNG) ---
@router.post("/matches/{match_id}/events")
async def add_event(
    match_id: str, 
    event: EventCreate,
    current_user: dict = Depends(RoleChecker(["admin"]))
):
    if not ObjectId.is_valid(match_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")
        
    # Push event vào mảng "events" trong document match
    await match_collection.update_one(
        {"_id": ObjectId(match_id)},
        {"$push": {"events": event.dict()}}
    )
    return {"message": "Đã thêm sự kiện"}

@router.get("/matches", response_model=List[MatchResponse])
async def get_matches():
    matches = []
    # Lấy tất cả trận đấu, sắp xếp theo thời gian
    cursor = match_collection.find().sort("start_time", 1)
    async for match in cursor:
        matches.append({
            **match,
            "id": str(match["_id"])
        })
    return matches

# --- ADMIN: CẬP NHẬT THÔNG TIN (SỬA LẠI ĐỂ LƯU STRING) ---
@router.put("/matches/{match_id}/info")
async def update_match_info(
    match_id: str,
    info_in: MatchInfoUpdate,
    current_user: dict = Depends(RoleChecker(["admin"]))
):
    if not ObjectId.is_valid(match_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    # Lấy dữ liệu update, bỏ qua field None
    update_data = {k: v for k, v in info_in.dict().items() if v is not None}

    # Nếu có thay đổi ngày hoặc giờ -> Tính lại start_time mới
    if "date" in update_data or "kickoff" in update_data:
        # Phải lấy thông tin cũ trong DB để merge nếu user chỉ sửa 1 trong 2
        current_match = await match_collection.find_one({"_id": ObjectId(match_id)})
        new_date = update_data.get("date", current_match.get("date"))
        new_kickoff = update_data.get("kickoff", current_match.get("kickoff"))
        
        # Cập nhật start_time mới
        update_data["start_time"] = create_start_time(new_date, new_kickoff)

    if not update_data:
        return {"message": "Không có gì thay đổi"}

    result = await match_collection.update_one(
        {"_id": ObjectId(match_id)},
        {"$set": update_data}
    )
    
    return {"message": "Cập nhật thành công"}

# --- ADMIN: XÓA TRẬN ĐẤU (BẠN ĐANG THIẾU CÁI NÀY) ---
@router.delete("/matches/{match_id}")
async def delete_match(
    match_id: str, 
    current_user: dict = Depends(RoleChecker(["admin"]))
):
    if not ObjectId.is_valid(match_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    result = await match_collection.delete_one({"_id": ObjectId(match_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy trận đấu")
    
    # Xóa luôn dự đoán rác
    await prediction_collection.delete_many({"match_id": match_id})
    
    return {"message": "Đã xóa trận đấu"}