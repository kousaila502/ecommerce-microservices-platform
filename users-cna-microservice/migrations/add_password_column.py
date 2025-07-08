import asyncio
import sys
import os

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from db.config import engine
from utils.auth import hash_password

async def add_password_column():
    async with engine.begin() as conn:
        try:
            await conn.execute(text('ALTER TABLE "user" ADD COLUMN password VARCHAR;'))
            print("Password column added successfully")
        except Exception as e:
            print(f"Password column might already exist: {e}")
        
        try:
            default_password = hash_password("password123")
            await conn.execute(text('UPDATE "user" SET password = :password WHERE password IS NULL;'), {"password": default_password})
            print("Default passwords set for existing users")
        except Exception as e:
            print(f"Error setting default passwords: {e}")

if __name__ == "__main__":
    asyncio.run(add_password_column())