# migrations/add_email_verification_fields.py

import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def run_migration():
    """
    Add email verification fields to user table
    """
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://admin:password123@localhost:5432/userdb")
    
    try:
        engine = create_async_engine(DATABASE_URL)
        
        print("Starting email verification migration...")
        
        async with engine.begin() as conn:
            # Add email verification fields
            await conn.execute(text('''
                ALTER TABLE "user" 
                ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
                ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP,
                ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMP;
            '''))
            
            # Create index for faster token lookups
            await conn.execute(text('''
                CREATE INDEX IF NOT EXISTS idx_user_email_verification_token 
                ON "user"(email_verification_token) 
                WHERE email_verification_token IS NOT NULL;
            '''))
            
            print("✅ Successfully added email verification fields to user table")
            print("   - email_verification_token VARCHAR(255)")
            print("   - email_verification_expires TIMESTAMP")
            print("   - verification_sent_at TIMESTAMP")
            print("   - idx_user_email_verification_token index created")
            
            # Verify the changes
            result = await conn.execute(text('''
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'user' 
                AND column_name IN ('email_verification_token', 'email_verification_expires', 'verification_sent_at');
            '''))
            
            rows = result.fetchall()
            print("\n📋 Verified columns:")
            for row in rows:
                print(f"   - {row[0]}: {row[1]}")
                
        await engine.dispose()
        print("\n🎉 Email verification migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure PostgreSQL is running")
        print("2. Check database credentials")
        raise

if __name__ == "__main__":
    asyncio.run(run_migration())