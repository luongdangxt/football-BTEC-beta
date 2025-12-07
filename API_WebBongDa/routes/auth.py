from fastapi import APIRouter, Depends, HTTPException, status, Request
from dependencies import RoleChecker
from schemas import UserRegister, UserLogin, Token, UserResponse
from database import user_collection
from security import get_password_hash, verify_password, create_access_token
from datetime import timedelta
import os
from slowapi import Limiter
from slowapi.util import get_remote_address
from bson import ObjectId

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# --- REGISTER ---
@router.post("/register", response_model=UserResponse)
@limiter.limit("5/hour") # Chống spam đăng ký
async def register(request: Request, user: UserRegister):
    # 1. Tự động viết hoa MSV
    msv_clean = user.msv.strip().upper()
    
    # 2. Kiểm tra MSV đã tồn tại chưa
    if await user_collection.find_one({"msv": msv_clean}):
        raise HTTPException(status_code=400, detail="Mã sinh viên này đã được đăng ký!")

    # 3. Tạo user mới
    new_user = {
        "msv": msv_clean,
        "full_name": user.full_name.strip(),
        "phone": user.phone,
        "hashed_password": get_password_hash(user.password),
        "role": "user",
        "is_active": True
    }
    
    result = await user_collection.insert_one(new_user)
    
    return {
        "id": str(result.inserted_id),
        "msv": new_user["msv"],
        "full_name": new_user["full_name"],
        "role": new_user["role"]
    }

# --- LOGIN ---
@router.post("/login", response_model=Token)
@limiter.limit("10/minute") 
async def login(request: Request, user_in: UserLogin):
    # 1. Chuẩn hóa MSV đầu vào
    msv_input = user_in.msv.strip().upper()
    
    # 2. Tìm user
    user = await user_collection.find_one({"msv": msv_input})
    
    if not user or not verify_password(user_in.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sai Mã sinh viên hoặc Mật khẩu",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.get("is_active") is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin."
        )
    
    # 3. Tạo token với sub là MSV
    access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)))
    access_token = create_access_token(
        data={"sub": user["msv"], "role": user["role"]}, 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users", dependencies=[Depends(RoleChecker(["admin"]))])
async def get_all_users():
    users = []
    # Lấy tất cả user, trừ admin ra (hoặc lấy hết tùy nhu cầu)
    async for user in user_collection.find():
        users.append({
            "id": str(user["_id"]),
            "msv": user.get("msv"),
            "full_name": user.get("full_name"),
            "role": user.get("role"),
            "is_active": user.get("is_active", True) # Mặc định là True nếu chưa có field này
        })
    return users

# --- ADMIN: KHÓA/MỞ KHÓA TÀI KHOẢN ---
@router.put("/users/{user_id}/lock", dependencies=[Depends(RoleChecker(["admin"]))])
async def lock_user(user_id: str, active: bool):
    """
    active = False -> Khóa
    active = True -> Mở khóa
    """
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    result = await user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"is_active": active}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy User")
        
    status_msg = "được kích hoạt" if active else "bị khóa"
    return {"message": f"Tài khoản đã {status_msg}"}

# --- ADMIN: XÓA TÀI KHOẢN ---
@router.delete("/users/{user_id}", dependencies=[Depends(RoleChecker(["admin"]))])
async def delete_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="ID không hợp lệ")

    # Xóa user khỏi bảng users
    result = await user_collection.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Không tìm thấy User")

    # (Tùy chọn) Xóa luôn các dự đoán/bình chọn của user này để sạch data
    # await prediction_collection.delete_many({"user_msv": ...}) 
    
    return {"message": "Đã xóa tài khoản vĩnh viễn"}