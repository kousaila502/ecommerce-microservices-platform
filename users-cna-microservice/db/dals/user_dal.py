from typing import List, Optional
from sqlalchemy import update, and_
from sqlalchemy.future import select
from sqlalchemy.orm import Session
from db.models.user import User, UserStatus, UserSession
from utils.auth import hash_password, verify_password
from datetime import datetime

class UserDAL:
    def __init__(self, db_session: Session):
        self.db_session = db_session

    async def create_user(self, name: str, email: str, mobile: str, password: str, role: str = "user"):
        hashed_password = hash_password(password)
        new_user = User(
            name=name, 
            email=email, 
            mobile=mobile, 
            password=hashed_password, 
            role=role,
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow()
        )
        self.db_session.add(new_user)
        await self.db_session.flush()
        await self.db_session.refresh(new_user)
        return new_user

    async def create_user_with_auth(self, name: str, email: str, mobile: str, password: str, role: str = "user"):
        """
        Create a user with proper password hashing and authentication setup.
        Used by admin creation and registration endpoints.
        """
        try:
            # Hash the password
            hashed_password = hash_password(password)
            
            # Create user with hashed password
            new_user = User(
                name=name,
                email=email,
                mobile=mobile,
                password=hashed_password,  # FIXED: Use 'password' not 'password_hash'
                role=role,
                status=UserStatus.ACTIVE,
                is_email_verified=True,  # Admin-created users are verified by default
                created_at=datetime.utcnow()
            )
            
            self.db_session.add(new_user)
            await self.db_session.flush()
            await self.db_session.refresh(new_user)
            
            return new_user
            
        except Exception as e:
            await self.db_session.rollback()
            raise e

    async def get_all_users(self, include_blocked: bool = True) -> List[User]:
        query = select(User).order_by(User.id)
        if not include_blocked:
            query = query.where(User.status == UserStatus.ACTIVE)
        q = await self.db_session.execute(query)
        return q.scalars().all()

    async def get_user(self, user_id: str) -> User:
        q = await self.db_session.execute(select(User).where(User.id == int(user_id)))
        return q.scalar()

    async def get_user_by_email(self, email: str) -> Optional[User]:
        q = await self.db_session.execute(select(User).where(User.email == email))
        return q.scalar()

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = await self.get_user_by_email(email)
        if user and user.is_active() and verify_password(password, user.password):
            # Update last login
            await self.update_last_login(user.id)
            return user
        return None

    async def update_last_login(self, user_id: int):
        q = update(User).where(User.id == user_id).values(last_login=datetime.utcnow())
        await self.db_session.execute(q)

    async def block_user(self, user_id: int, admin_id: int, reason: str = None) -> User:
        """Block a user (admin action)"""
        q = update(User).where(User.id == user_id).values(
            status=UserStatus.BLOCKED,
            blocked_at=datetime.utcnow(),
            blocked_by=admin_id,
            blocked_reason=reason,
            updated_at=datetime.utcnow()
        )
        await self.db_session.execute(q)
        return await self.get_user(str(user_id))

    async def unblock_user(self, user_id: int) -> User:
        """Unblock a user (admin action)"""
        q = update(User).where(User.id == user_id).values(
            status=UserStatus.ACTIVE,
            blocked_at=None,
            blocked_by=None,
            blocked_reason=None,
            updated_at=datetime.utcnow()
        )
        await self.db_session.execute(q)
        return await self.get_user(str(user_id))

    async def suspend_user(self, user_id: int, admin_id: int, reason: str = None) -> User:
        """Temporarily suspend a user (admin action)"""
        q = update(User).where(User.id == user_id).values(
            status=UserStatus.SUSPENDED,
            blocked_at=datetime.utcnow(),
            blocked_by=admin_id,
            blocked_reason=reason,
            updated_at=datetime.utcnow()
        )
        await self.db_session.execute(q)
        return await self.get_user(str(user_id))

    async def get_blocked_users(self) -> List[User]:
        """Get all blocked/suspended users"""
        q = await self.db_session.execute(
            select(User).where(User.status.in_([UserStatus.BLOCKED, UserStatus.SUSPENDED]))
        )
        return q.scalars().all()

    # Session management
    async def create_session(self, user_id: int, token_id: str, ip_address: str = None, user_agent: str = None):
        session = UserSession(
            user_id=user_id,
            token_id=token_id,
            ip_address=ip_address,
            user_agent=user_agent
        )
        self.db_session.add(session)
        await self.db_session.flush()
        return session

    async def end_session(self, token_id: str):
        q = update(UserSession).where(UserSession.token_id == token_id).values(
            logout_time=datetime.utcnow(),
            is_active=False
        )
        await self.db_session.execute(q)

    async def get_active_sessions(self, user_id: int) -> List[UserSession]:
        q = await self.db_session.execute(
            select(UserSession).where(
                and_(UserSession.user_id == user_id, UserSession.is_active == True)
            )
        )
        return q.scalars().all()

    async def update_user(self, user_id: int, name: Optional[str] = None, email: Optional[str] = None, 
                         mobile: Optional[str] = None, role: Optional[str] = None, password: Optional[str] = None):
        update_data = {"updated_at": datetime.utcnow()}
        
        if name:
            update_data["name"] = name
        if email:
            update_data["email"] = email
        if mobile:
            update_data["mobile"] = mobile
        if role:
            update_data["role"] = role
        if password:
            update_data["password"] = hash_password(password)
            
        q = update(User).where(User.id == user_id).values(**update_data)
        await self.db_session.execute(q)
        return await self.get_user(str(user_id))
    
     # Password Reset Methods
    async def set_password_reset_token(self, user_id: int, reset_token: str, expires_at: datetime) -> User:
        """Set password reset token for user"""
        q = update(User).where(User.id == user_id).values(
            reset_token=reset_token,
            reset_token_expires=expires_at,
            updated_at=datetime.utcnow()
        )
        await self.db_session.execute(q)
        return await self.get_user(str(user_id))

    async def get_user_by_reset_token(self, reset_token: str) -> Optional[User]:
        """Get user by password reset token"""
        q = await self.db_session.execute(
            select(User).where(User.reset_token == reset_token)
        )
        return q.scalar()

    async def clear_password_reset_token(self, user_id: int) -> User:
        """Clear password reset token after successful reset"""
        q = update(User).where(User.id == user_id).values(
            reset_token=None,
            reset_token_expires=None,
            updated_at=datetime.utcnow()
        )
        await self.db_session.execute(q)
        return await self.get_user(str(user_id))

    async def update_password_with_reset(self, user_id: int, new_password: str) -> User:
        """Update user password and clear reset token"""
        hashed_password = hash_password(new_password)
        q = update(User).where(User.id == user_id).values(
            password=hashed_password,
            reset_token=None,
            reset_token_expires=None,
            updated_at=datetime.utcnow()
        )
        await self.db_session.execute(q)
        return await self.get_user(str(user_id))
    
     # Email Verification Methods
    async def set_email_verification_token(self, user_id: int, verification_token: str, expires_at: datetime) -> User:
        """Set email verification token for user"""
        q = update(User).where(User.id == user_id).values(
            email_verification_token=verification_token,
            email_verification_expires=expires_at,
            verification_sent_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        await self.db_session.execute(q)
        return await self.get_user(str(user_id))

    async def get_user_by_verification_token(self, verification_token: str) -> Optional[User]:
        """Get user by email verification token"""
        q = await self.db_session.execute(
            select(User).where(User.email_verification_token == verification_token)
        )
        return q.scalar()

    async def verify_user_email(self, user_id: int) -> User:
        """Mark user email as verified and clear verification token"""
        q = update(User).where(User.id == user_id).values(
            is_email_verified=True,
            email_verification_token=None,
            email_verification_expires=None,
            updated_at=datetime.utcnow()
        )
        await self.db_session.execute(q)
        return await self.get_user(str(user_id))

    async def clear_email_verification_token(self, user_id: int) -> User:
        """Clear email verification token (for expired tokens)"""
        q = update(User).where(User.id == user_id).values(
            email_verification_token=None,
            email_verification_expires=None,
            updated_at=datetime.utcnow()
        )
        await self.db_session.execute(q)
        return await self.get_user(str(user_id))

    async def can_resend_verification(self, user_id: int, cooldown_minutes: int = 5) -> bool:
        """Check if user can resend verification email (rate limiting)"""
        user = await self.get_user(str(user_id))
        if not user or not user.verification_sent_at:
            return True
        
        time_since_last_send = datetime.utcnow() - user.verification_sent_at
        return time_since_last_send.total_seconds() > (cooldown_minutes * 60)

def user_exists(username: str, email: str) -> bool:
    # Dummy logic for testing; replace with real DB query if needed
    # For now, always return False (user does not exist)
    return False