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