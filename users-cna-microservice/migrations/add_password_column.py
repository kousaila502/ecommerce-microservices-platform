# migrations/add_user_status_fields.py (NEW FILE)
import asyncio
from sqlalchemy import text
from db.config import engine

async def add_user_status_fields():
    """Add status management fields to user table and create sessions table"""
    async with engine.begin() as conn:
        try:
            print("Adding user status fields...")
            
            # Add new columns for user management
            await conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT \'active\';'))
            await conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;'))
            await conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;'))
            await conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;'))
            await conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;'))
            await conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP;'))
            await conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS blocked_by INTEGER;'))
            await conn.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS blocked_reason TEXT;'))
            
            print("✅ User status fields added successfully")
            
            # Update existing users to have timestamps
            await conn.execute(text('''
                UPDATE "user" 
                SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
                WHERE created_at IS NULL;
            '''))
            
            print("✅ Updated existing users with timestamps")
            
        except Exception as e:
            print(f"⚠️  Error adding user fields (might already exist): {e}")

        try:
            # Create user_sessions table
            await conn.execute(text('''
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    token_id VARCHAR NOT NULL UNIQUE,
                    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    logout_time TIMESTAMP,
                    ip_address VARCHAR,
                    user_agent TEXT,
                    is_active BOOLEAN DEFAULT TRUE
                );
            '''))
            
            # Add index for better performance
            await conn.execute(text('''
                CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
            '''))
            await conn.execute(text('''
                CREATE INDEX IF NOT EXISTS idx_user_sessions_token_id ON user_sessions(token_id);
            '''))
            
            print("✅ User sessions table created successfully")
            
        except Exception as e:
            print(f"⚠️  Error creating sessions table: {e}")

if __name__ == "__main__":
    print("🔄 Starting user status migration...")
    asyncio.run(add_user_status_fields())
    print("✅ Migration completed!")