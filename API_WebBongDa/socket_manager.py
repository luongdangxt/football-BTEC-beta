from fastapi import WebSocket
from typing import List

class ConnectionManager:
    def __init__(self):
        # Danh sách lưu các kết nối đang hoạt động
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # Gửi tin nhắn cho tất cả mọi người trong danh sách
        # Dùng copy list để tránh lỗi nếu có user thoát trong lúc đang gửi
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                # Nếu gửi lỗi (do user rớt mạng), có thể remove kết nối đó
                pass

# Tạo một instance duy nhất để dùng chung cho toàn app
manager = ConnectionManager()