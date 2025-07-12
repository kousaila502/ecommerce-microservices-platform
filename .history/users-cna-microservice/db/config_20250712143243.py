import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

# DEBUG: Print environment info
print("=== DEBUG INFO ===")
print(f"DATABASE_URL from env: {os.getenv('DATABASE_URL')}")
print("==================")

# JWT Configuration
SECRET_KEY = "your-super-secret-jwt-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

Base = declarative_base()

# Lazy load the engine and session
def get_database_url():
    url = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:password123@localhost:5432/userdb")
    print(f"Final DATABASE_URL: {url}")
    return url

def get_engine():
    DATABASE_URL = get_database_url()
    return create_async_engine(DATABASE_URL, future=True, echo=True)

def get_session_maker():
    engine = get_engine()
    return sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

# Database dependency
async def get_db():
    async_session = get_session_maker()
    async with async_session() as session:
        yield session