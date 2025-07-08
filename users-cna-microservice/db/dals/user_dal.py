from typing import List, Optional
from sqlalchemy import update
from sqlalchemy.future import select
from sqlalchemy.orm import Session
from db.models.user import User
from utils.auth import hash_password, verify_password

class UserDAL():
    def __init__(self, db_session: Session):
        self.db_session = db_session

    async def create_user(self, name: str, email: str, mobile: str, password: str, role: str = "user"):
        hashed_password = hash_password(password)
        new_user = User(name=name, email=email, mobile=mobile, password=hashed_password, role=role)
        self.db_session.add(new_user)
        await self.db_session.flush()
        await self.db_session.refresh(new_user)
        return new_user

    async def get_all_users(self) -> List[User]:
        q = await self.db_session.execute(select(User).order_by(User.id))
        return q.scalars().all()

    async def get_user(self, user_id: str) -> User:
        # Convert string ID to integer for database comparison
        q = await self.db_session.execute(select(User).where(User.id == int(user_id)))
        return q.scalar()

    async def update_user(self, user_id: int, name: Optional[str], email: Optional[str], mobile: Optional[str], role: Optional[str] = None):
        q = update(User).where(User.id == user_id)
        if name:
            q = q.values(name=name)
        if email:
            q = q.values(email=email)
        if mobile:
            q = q.values(mobile=mobile)
        if role:
            q = q.values(role=role)
        q.execution_options(synchronize_session="fetch")
        await self.db_session.execute(q)
        return await self.get_user(user_id)

    async def get_user_by_email(self, email: str) -> Optional[User]:
        q = await self.db_session.execute(select(User).where(User.email == email))
        return q.scalar()

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        user = await self.get_user_by_email(email)
        if user and verify_password(password, user.password):
            return user
        return None