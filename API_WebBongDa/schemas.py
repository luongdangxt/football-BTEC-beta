from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

# --- USER SCHEMAS ---
class UserRegister(BaseModel):
    msv: str = Field(..., min_length=1, description="Mã sinh viên")
    full_name: str = Field(..., min_length=2, description="Họ và tên")
    phone: str = Field(..., pattern=r"^\d{10,11}$", description="Số điện thoại")
    password: str = Field(..., min_length=6)
    
    # Validator để tự động viết hoa MSV có thể xử lý ở tầng logic (router)

class UserLogin(BaseModel):
    msv: str
    password: str

class UserResponse(BaseModel):
    id: str
    msv: str
    full_name: str
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str
    
class UserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None

# --- PREDICTION & MATCH SCHEMAS ---

class MatchScoreUpdate(BaseModel):
    score_a: int
    score_b: int
    
# User dự đoán tỉ số
class PredictionCreate(BaseModel):
    match_id: str
    score_a: int
    score_b: int

# User bình chọn 3 đội yêu thích
class FavoriteTeamVote(BaseModel):
    teams: List[str] = Field(..., min_items=3, max_items=3, description="Danh sách đúng 3 đội")

# CẬP NHẬT: Thêm trường date và kickoff dạng chuỗi
class MatchCreate(BaseModel):
    competition: Optional[str] = "Friendly"
    team_a: str
    team_a_logo: Optional[str] = None
    team_a_color: Optional[str] = "#5bed9f"
    team_b: str
    team_b_logo: Optional[str] = None
    team_b_color: Optional[str] = "#e85c5c"
    status: Optional[str] = "upcoming"
    minute: Optional[str] = None
    # Lưu giờ dạng chuỗi để không bị lỗi múi giờ
    date: str     # Ví dụ: "2025-01-20"
    kickoff: str  # Ví dụ: "05:00"

# --- THÊM CLASS MỚI ĐỂ SỬA TRẬN ĐẤU ---
class MatchInfoUpdate(BaseModel):
    competition: Optional[str] = None
    team_a: Optional[str] = None
    team_b: Optional[str] = None
    date: Optional[str] = None    # <--- Thêm dòng này
    kickoff: Optional[str] = None # <--- Thêm dòng này
    status: Optional[str] = None
    minute: Optional[str] = None
    
# Schema trả về cho Client hiển thị
class MatchResponse(MatchCreate):
    id: str
    is_locked: bool = False
    score_a: Optional[int] = None
    score_b: Optional[int] = None
    start_time: Optional[datetime] = None # Vẫn giữ để sort nếu cần
    
class MatchEvent(BaseModel):
    minute: str       # Ví dụ: "12'", "45+1'"
    player: str       # Tên cầu thủ
    type: str = "goal" # "goal", "card", "sub" (Mặc định là bàn thắng)
    team_side: str    # "a" (đội nhà) hoặc "b" (đội khách)

class PredictionStats(BaseModel):
    home_percent: int = 0
    draw_percent: int = 0
    away_percent: int = 0
    total: int = 0

class PredictorInfo(BaseModel):
    name: str # Tên người dự đoán (đã che hoặc tên thật)
    pick: str # Ví dụ: "2-1"

# Schema trả về đầy đủ thông tin khi click vào trận
class MatchDetailResponse(MatchResponse):
    events: List[MatchEvent] = []
    stats: PredictionStats = PredictionStats()
    predictors: List[PredictorInfo] = []

# Schema để Admin thêm sự kiện (API phụ)
class EventCreate(MatchEvent):
    pass
