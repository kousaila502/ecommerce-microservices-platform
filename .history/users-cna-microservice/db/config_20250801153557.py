import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker

# Check if running on Railway (Railway sets this automatically)
IS_RAILWAY = os.getenv('RAILWAY_ENVIRONMENT') is not None or os.getenv('RAILWAY_PROJECT_ID') is not None

print("=== ENVIRONMENT DEBUG ===")
print(f"Running on Railway: {IS_RAILWAY}")
print(f"Railway Environment: {os.getenv('RAILWAY_ENVIRONMENT')}")
print(f"Railway Project ID: {os.getenv('RAILWAY_PROJECT_ID')}")
print("========================")

# Load configuration based on environment
if IS_RAILWAY:
    # Production Railway environment - MUST have these variables
    DATABASE_URL = os.getenv("DATABASE_URL")
    SECRET_KEY = os.getenv("SECRET_KEY")
    ALGORITHM = os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # Validate required Railway environment variables
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is required on Railway")
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable is required on Railway")
    if not ALGORITHM:
        raise ValueError("ALGORITHM environment variable is required on Railway")
    if not ACCESS_TOKEN_EXPIRE_MINUTES:
        raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES environment variable is required on Railway")
    
    # Convert string to int for token expiration
    ACCESS_TOKEN_EXPIRE_MINUTES = int(ACCESS_TOKEN_EXPIRE_MINUTES)
    
    print("✅ Using Railway environment variables")
    print(f"Database host: {DATABASE_URL.split('@')[1].split('/')[0] if '@' in DATABASE_URL else 'unknown'}")
    
else:
    # Local development with fallbacks
    print("🔧 Using local development defaults (with .env if available)")
    try:
        from dotenv import load_dotenv
        load_dotenv()
        print("📁 Loaded .env file for local development")
    except ImportError:
        print("📁 python-dotenv not installed, using system environment only")
    
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:password123@localhost:5432/userdb")
    SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-jwt-key-change-in-production")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Final configuration display
print("=== FINAL CONFIGURATION ===")
print(f"DATABASE_URL: {DATABASE_URL[:50]}..." if len(DATABASE_URL) > 50 else f"DATABASE_URL: {DATABASE_URL}")
print(f"SECRET_KEY: {'*' * len(SECRET_KEY)}")
print(f"ALGORITHM: {ALGORITHM}")
print(f"ACCESS_TOKEN_EXPIRE_MINUTES: {ACCESS_TOKEN_EXPIRE_MINUTES}")
print("============================")

# Create database engine
engine = create_async_engine(DATABASE_URL, future=True, echo=True)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

async def get_db():
    async with async_session() as session:
        yield session