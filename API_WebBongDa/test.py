import asyncio
from database import user_collection
from security import get_password_hash
from schemas import UserRegister

# Sửa lại file test.py
async def create_superuser():
    print("--- TẠO TÀI KHOẢN ADMIN ---")
    msv = "ADMIN001"  # Sửa thành MSV
    password = "Admin@a123"
    full_name = "System Admin" # Sửa thành full_name

    # 1. Kiểm tra tồn tại
    if await user_collection.find_one({"msv": msv}):
        print("Lỗi: Admin này đã tồn tại!")
        return

    # 2. Tạo data với role="admin"
    admin_user = {
        "msv": msv,
        "full_name": full_name,
        "phone": "0900000000",
        "hashed_password": get_password_hash(password),
        "role": "admin",
        "is_active": True
    }

    # 3. Lưu vào DB
    await user_collection.insert_one(admin_user)
    print(f"Thành công! Admin {msv} đã được tạo.")
    
if __name__ == "__main__":
    # Chạy hàm async trong môi trường sync
    loop = asyncio.get_event_loop()
    loop.run_until_complete(create_superuser())