import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables with proper priority:
# 1. Kubernetes environment variables (highest priority)
# 2. .env file (fallback for local development)

# DEBUG: Print environment info
print("Loading .env environment variables...")
print("=== DEBUG INFO ===")
print(f"DATABASE_URL from env: {os.getenv('DATABASE_URL')}")
print(f"SECRET_KEY from env: {os.getenv('SECRET_KEY')}")
print(f"CORS_ORIGINS from env: {os.getenv('CORS_ORIGINS')}")
print("==================")

# Load from environment with proper fallbacks
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:password123@postgres-service:5432/userdb")
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-jwt-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

print(f"Final DATABASE_URL: {DATABASE_URL}")
print(f"Final SECRET_KEY: {SECRET_KEY}")
print(f"Final CORS_ORIGINS: {CORS_ORIGINS}")

# Create database engine and session
engine = create_async_engine(DATABASE_URL, future=True, echo=True)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

async def get_db():
    async with async_session() as session:
        yield session