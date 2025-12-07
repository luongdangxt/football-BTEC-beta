import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

client = motor.motor_asyncio.AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]

# Các collection chính
user_collection = db.get_collection("users")
match_collection = db.get_collection("matches")        # Lưu thông tin trận đấu
prediction_collection = db.get_collection("predictions") # Lưu dự đoán tỉ số của user
vote_collection = db.get_collection("favorite_teams")  # Lưu bình chọn 3 đội