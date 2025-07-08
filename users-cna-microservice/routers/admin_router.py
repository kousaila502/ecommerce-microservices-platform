# routers/admin_router.py (NEW FILE)
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from db.dals.user_dal import UserDAL
from db.models.user import User, UserStatus
from routers.auth_router import get_current_user, require_admin
from db.config import get_db

router = APIRouter(prefix="/admin", tags=["admin"])

# Pydantic models
class BlockUserRequest(BaseModel):
    reason: Optional[str] = None

class UserStatusResponse(BaseModel):
    id: int
    name: str
    email: str
    mobile: str
    role: str
    status: str
    is_email_verified: bool
    created_at: Optional[str]
    last_login: Optional[str]
    blocked_at: Optional[str]
    blocked_reason: Optional[str]

class UserStatsResponse(BaseModel):
    total_users: int
    active_users: int
    blocked_users: int
    suspended_users: int
    pending_verification: int
    users_today: int

class SessionResponse(BaseModel):
    id: int
    user_id: int
    login_time: str
    logout_time: Optional[str]
    ip_address: Optional[str]
    is_active: bool

# User Management Endpoints
@router.get("/users", response_model=List[UserStatusResponse])
async def get_all_users_admin(
    include_blocked: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all users with full details (admin only)"""
    async with db as session:
        user_dal = UserDAL(session)
        users = await user_dal.get_all_users(include_blocked=include_blocked)
        return [UserStatusResponse(**user.to_dict()) for user in users]

@router.get("/users/blocked", response_model=List[UserStatusResponse])
async def get_blocked_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all blocked/suspended users (admin only)"""
    async with db as session:
        user_dal = UserDAL(session)
        users = await user_dal.get_blocked_users()
        return [UserStatusResponse(**user.to_dict()) for user in users]

@router.post("/users/{user_id}/block")
async def block_user(
    user_id: int,
    request_data: BlockUserRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Block a user (admin only)"""
    async with db as session:
        user_dal = UserDAL(session)
        
        # Check if user exists
        target_user = await user_dal.get_user(str(user_id))
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent admin from blocking themselves
        if target_user.id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot block yourself"
            )
        
        # Prevent blocking other admins
        if target_user.role == 'admin':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot block other administrators"
            )
        
        # Block the user
        updated_user = await user_dal.block_user(
            user_id=user_id,
            admin_id=current_user.id,
            reason=request_data.reason
        )
        await session.commit()
        
        return {
            "message": f"User {target_user.name} has been blocked",
            "user": UserStatusResponse(**updated_user.to_dict())
        }

@router.post("/users/{user_id}/unblock")
async def unblock_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Unblock a user (admin only)"""
    async with db as session:
        user_dal = UserDAL(session)
        
        target_user = await user_dal.get_user(str(user_id))
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        updated_user = await user_dal.unblock_user(user_id)
        await session.commit()
        
        return {
            "message": f"User {target_user.name} has been unblocked",
            "user": UserStatusResponse(**updated_user.to_dict())
        }

@router.post("/users/{user_id}/suspend")
async def suspend_user(
    user_id: int,
    request_data: BlockUserRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Temporarily suspend a user (admin only)"""
    async with db as session:
        user_dal = UserDAL(session)
        
        target_user = await user_dal.get_user(str(user_id))
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if target_user.id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot suspend yourself"
            )
        
        updated_user = await user_dal.suspend_user(
            user_id=user_id,
            admin_id=current_user.id,
            reason=request_data.reason
        )
        await session.commit()
        
        return {
            "message": f"User {target_user.name} has been suspended",
            "user": UserStatusResponse(**updated_user.to_dict())
        }

@router.put("/users/{user_id}/role")
async def change_user_role(
    user_id: int,
    new_role: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Change user role (admin only)"""
    if new_role not in ['user', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'user' or 'admin'"
        )
    
    async with db as session:
        user_dal = UserDAL(session)
        
        target_user = await user_dal.get_user(str(user_id))
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        updated_user = await user_dal.update_user(user_id, role=new_role)
        await session.commit()
        
        return {
            "message": f"User {target_user.name} role changed to {new_role}",
            "user": UserStatusResponse(**updated_user.to_dict())
        }

# Statistics and Analytics
@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get user statistics (admin only)"""
    async with db as session:
        user_dal = UserDAL(session)
        all_users = await user_dal.get_all_users()
        
        today = datetime.now().date()
        
        stats = {
            "total_users": len(all_users),
            "active_users": len([u for u in all_users if u.status == UserStatus.ACTIVE]),
            "blocked_users": len([u for u in all_users if u.status == UserStatus.BLOCKED]),
            "suspended_users": len([u for u in all_users if u.status == UserStatus.SUSPENDED]),
            "pending_verification": len([u for u in all_users if u.status == UserStatus.PENDING_VERIFICATION]),
            "users_today": len([u for u in all_users if u.created_at and u.created_at.date() == today])
        }
        
        return UserStatsResponse(**stats)

# Session Management
@router.get("/users/{user_id}/sessions", response_model=List[SessionResponse])
async def get_user_sessions(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get user's active sessions (admin only)"""
    async with db as session:
        user_dal = UserDAL(session)
        sessions = await user_dal.get_active_sessions(user_id)
        
        return [
            SessionResponse(
                id=s.id,
                user_id=s.user_id,
                login_time=s.login_time.isoformat(),
                logout_time=s.logout_time.isoformat() if s.logout_time else None,
                ip_address=s.ip_address,
                is_active=s.is_active
            ) for s in sessions
        ]

@router.post("/users/{user_id}/logout-all")
async def logout_all_user_sessions(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Force logout all user sessions (admin only)"""
    async with db as session:
        user_dal = UserDAL(session)
        
        target_user = await user_dal.get_user(str(user_id))
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        sessions = await user_dal.get_active_sessions(user_id)
        for session_obj in sessions:
            await user_dal.end_session(session_obj.token_id)
        
        await session.commit()
        
        return {
            "message": f"All sessions for user {target_user.name} have been terminated",
            "sessions_ended": len(sessions)
        }