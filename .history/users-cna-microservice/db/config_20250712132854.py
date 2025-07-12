impo
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:password123@localhost:5432/userdb")

# JWT Configuration (ADD THESE LINES)
SECRET_KEY = "your-super-secret-jwt-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

engine = create_async_engine(DATABASE_URL, future=True, echo=True)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

# Database dependency
async def get_db():
    async with async_session() as session:
        yield session