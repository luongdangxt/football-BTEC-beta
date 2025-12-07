from fastapi import FastAPI, WebSocketDisconnect, WebSocket
from slowapi import Limiter, _rate_limit_exceeded_handler
from fastapi.middleware.cors import CORSMiddleware
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from routes import auth, predict 
from socket_manager import manager

# uvicorn main:app --reload

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Web Bong Da API")

# --- CẤU HÌNH CORS ---
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:5173",
    "http://127.0.0.1:5500", # Port thường dùng của Live Server VSCode
    "*" # Hoặc để dấu * để cho phép tất cả (chỉ dùng khi test)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Include Router
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(predict.router, prefix="/api", tags=["Prediction"])

# --- WEBSOCKET ENDPOINT ---
@app.websocket("/ws/live-scores")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Server lắng nghe client (ping/pong) để giữ kết nối
            # Nếu chỉ cập nhật 1 chiều từ Server -> Client thì ta chỉ cần chờ thôi
            data = await websocket.receive_text()
            # Có thể xử lý logic chat ở đây nếu muốn
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        
@app.get("/")
async def root():
    return {"message": "API Web Bóng Đá hoạt động"}