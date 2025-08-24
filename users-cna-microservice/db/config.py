import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import text
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Environment variable validation for security
def validate_required_env_vars():
    """Validate required environment variables for security"""
    required_vars = {
        "DATABASE_URL": os.getenv("DATABASE_URL"),
        "SECRET_KEY": os.getenv("SECRET_KEY")
    }
    
    missing_vars = [var for var, value in required_vars.items() if not value]
    
    if missing_vars:
        print("❌ SECURITY ERROR: Missing required environment variables!")
        print("🔒 For security, all sensitive configuration must be provided via environment variables.")
        print("📋 Missing variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\n💡 Please set these environment variables before starting the service.")
        print("🔐 This prevents hardcoded credentials in the codebase.")
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    print("✅ Security validation passed - all sensitive data loaded from environment variables")
    return required_vars

# Validate environment variables
try:
    env_vars = validate_required_env_vars()
    DATABASE_URL = env_vars["DATABASE_URL"]
    SECRET_KEY = env_vars["SECRET_KEY"]
except ValueError as e:
    print(f"❌ Configuration Error: {e}")
    exit(1)

# Additional configuration with defaults
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Print safe configuration info (without exposing credentials)
print("🚀 User Service Configuration (Live System):")
print(f"📊 Database: {'✅ Neon PostgreSQL Configured' if DATABASE_URL else '❌ Missing'}")
print(f"🔑 JWT Secret: {'✅ Configured' if SECRET_KEY else '❌ Missing'}")
print(f"🔐 JWT Algorithm: {ALGORITHM}")
print(f"⏰ Token Expire: {ACCESS_TOKEN_EXPIRE_MINUTES} minutes")
print(f"🌐 Platform: GKE Kubernetes")

# Create async engine with Neon PostgreSQL optimizations
engine = create_async_engine(
    DATABASE_URL, 
    future=True, 
    echo=False,  # Set to False for production
    pool_size=10,  # Optimize for cloud database
    max_overflow=20,
    pool_pre_ping=True,  # Validate connections
    pool_recycle=3600    # Recycle connections every hour
)

async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

async def get_db():
    async with async_session() as session:
        yield session

# Health check function for database
async def check_database_health():
    """Check database connectivity for health endpoints"""
    try:
        async with async_session() as session:
            # Proper connection test with actual query
            result = await session.execute(text("SELECT 1"))
            await session.commit()
            return {
                "status": "connected",
                "provider": "PostgreSQL",  # Updated
                "host": DATABASE_URL.split('@')[1].split('/')[0] if '@' in DATABASE_URL else "unknown"
            }
    except Exception as e:
        print(f"Database health check failed: {e}")  # Add logging
        return {
            "status": "failed",
            "provider": "PostgreSQL",
            "error": str(e)
        }