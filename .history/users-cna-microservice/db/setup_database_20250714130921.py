#!/usr/bin/env python3
"""
Database Setup Script for E-commerce User Service
Creates tables and adds test users
"""

import asyncio
from datetime import datetime
from passlib.context import CryptContext

# Import database components
from db.config import Base, engine, get_db_session
from db.models.user import User, UserStatus

# Password hashing
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

async def create_tables():
    """Create all database tables"""
    print("🔨 Creating database tables...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Tables created successfully!")
        return True
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

async def create_test_users():
    """Create test users for development"""
    print("👥 Creating test users...")
    
    try:
        async with get_db_session() as session:
            # Check if users already exist
            from sqlalchemy import text
            result = await session.execute(text("SELECT COUNT(*) FROM \"user\""))
            user_count = result.scalar()
            
            if user_count > 0:
                print(f"⚠️  Found {user_count} existing users. Skipping user creation.")
                return True
            
            # Create test users
            users = [
                User(
                    name='Test User',
                    email='test@example.com',
                    password=pwd_context.hash('Password123!'),
                    mobile='1234567890',
                    role='user',
                    status=UserStatus.ACTIVE,
                    is_email_verified=True,
                    created_at=datetime.utcnow()
                ),
                User(
                    name='John Doe',
                    email='john@example.com', 
                    password=pwd_context.hash('MyPass456@'),
                    mobile='0987654321',
                    role='user',
                    status=UserStatus.ACTIVE,
                    is_email_verified=True,
                    created_at=datetime.utcnow()
                ),
                User(
                    name='Admin User',
                    email='admin@example.com',
                    password=pwd_context.hash('Admin789#'),
                    mobile='5555555555',
                    role='admin',
                    status=UserStatus.ACTIVE,
                    is_email_verified=True,
                    created_at=datetime.utcnow()
                )
            ]
            
            # Add users to session
            for user in users:
                session.add(user)
            
            # Commit changes
            await session.commit()
            
            print("✅ Test users created successfully!")
            print("📧 Available test accounts:")
            print("   • test@example.com / Password123! (user)")
            print("   • john@example.com / MyPass456@ (user)")
            print("   • admin@example.com / Admin789# (admin)")
            
            return True
            
    except Exception as e:
        print(f"❌ Error creating users: {e}")
        return False

async def verify_setup():
    """Verify database setup"""
    print("🔍 Verifying database setup...")
    
    try:
        from sqlalchemy import text
        async with engine.begin() as conn:
            # Check tables
            result = await conn.execute(text(
                "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
            ))
            tables = [row[0] for row in result.fetchall()]
            print(f"📋 Tables found: {tables}")
            
            # Check users
            result = await conn.execute(text(
                "SELECT id, name, email, role FROM \"user\" ORDER BY id"
            ))
            users = result.fetchall()
            
            print(f"👥 Users in database ({len(users)}):")
            for user in users:
                print(f"   🆔 {user[0]} | 👤 {user[1]} | 📧 {user[2]} | 🔑 {user[3]}")
            
            return True
            
    except Exception as e:
        print(f"❌ Error verifying setup: {e}")
        return False

async def main():
    """Main setup function"""
    print("🚀 Starting database setup...")
    print("=" * 50)
    
    # Step 1: Create tables
    if not await create_tables():
        print("❌ Failed to create tables. Exiting.")
        return
    
    # Step 2: Create test users
    if not await create_test_users():
        print("❌ Failed to create users. Exiting.")
        return
    
    # Step 3: Verify setup
    if not await verify_setup():
        print("❌ Failed to verify setup.")
        return
    
    print("=" * 50)
    print("🎉 Database setup completed successfully!")
    print("🌐 You can now test login at your frontend")
    print("📧 Use: test@example.com / Password123!")

if __name__ == "__main__":
    asyncio.run(main())