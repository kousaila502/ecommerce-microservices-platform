from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.settings import settings

# Convert PostgreSQL URL to async format for SQLAlchemy
DATABASE_URL = settings.async_database_url

print(f"🔗 Connecting to database: {DATABASE_URL}")

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    poolclass=NullPool,  # No connection pooling for simplicity
    echo=settings.is_development,  # Show SQL queries in development
    future=True  # Use SQLAlchemy 2.0 style
)

# Create async session factory
async_session_factory = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Don't expire objects after commit
    autoflush=False,  # Don't auto-flush before queries
    autocommit=False  # Don't auto-commit transactions
)

# Create base class for all database models
Base = declarative_base()

# Dependency function to get database session
async def get_db() -> AsyncSession:
    """
    Database dependency for FastAPI endpoints
    Creates a new database session for each request
    """
    async with async_session_factory() as session:
        try:
            yield session
        except Exception as e:
            print(f"❌ Database session error: {e}")
            await session.rollback()
            raise e
        finally:
            await session.close()

# Database management functions
async def create_tables():
    """Create all database tables"""
    print("🔄 Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created successfully!")

async def drop_tables():
    """Drop all database tables (for development)"""
    print("🗑️  Dropping database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    print("✅ Database tables dropped successfully!")

async def check_connection():
    """Test database connection"""
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT version();"))
            version = result.fetchone()
            print(f"✅ Database connection successful!")
            print(f"📊 PostgreSQL version: {version[0] if version else 'Unknown'}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

# Import text for raw SQL queries
from sqlalchemy import text

# Connection info for debugging
async def get_connection_info():
    """Get database connection information"""
    try:
        async with engine.begin() as conn:
            # Get database name
            db_result = await conn.execute(text("SELECT current_database();"))
            db_name = db_result.fetchone()[0]
            
            # Get current user
            user_result = await conn.execute(text("SELECT current_user;"))
            user_name = user_result.fetchone()[0]
            
            # Get connection count
            conn_result = await conn.execute(text("SELECT count(*) FROM pg_stat_activity;"))
            conn_count = conn_result.fetchone()[0]
            
            return {
                "database": db_name,
                "user": user_name,
                "connections": conn_count,
                "url": DATABASE_URL
            }
    except Exception as e:
        print(f"❌ Failed to get connection info: {e}")
        return None

# Startup function
async def init_database():
    """Initialize database on startup"""
    print("🚀 Initializing Order Service Database...")
    
    # Check connection
    if not await check_connection():
        raise Exception("Failed to connect to database")
    
    # Show connection info
    info = await get_connection_info()
    if info:
        print(f"📊 Database: {info['database']}")
        print(f"👤 User: {info['user']}")
        print(f"🔗 Active connections: {info['connections']}")
    
    print("✅ Database initialized successfully!")

# Cleanup function
async def close_database():
    """Close database connections"""
    print("🔄 Closing database connections...")
    await engine.dispose()
    print("✅ Database connections closed!")

# Test the connection when module is loaded (for debugging)
if __name__ == "__main__":
    import asyncio
    
    async def test_connection():
        await init_database()
        await close_database()
    
    asyncio.run(test_connection())