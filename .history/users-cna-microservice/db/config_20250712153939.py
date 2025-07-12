import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

# DEBUG: Print environment info
print("=== DEBUG INFO ===")
print(f"DATABASE_URL from env: {os.getenv('DATABASE_URL')}")
print(f"SECRET_KEY from env: {os.getenv('SECRET_KEY')}")
print("==================")

# Load from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:password123@localhost:5432/userdb")
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-jwt-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

print(f"Final DATABASE_URL: {DATABASE_URL}")
print(f"Final SECRET_KEY: {SECRET_KEY}")

engine = create_async_engine(DATABASE_URL, future=True, echo=True)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

async def get_db():
    async with async_session() as session:
        yield session