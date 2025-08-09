# routers/admin_router.py (NEW FILE)
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime

from db.dals.user_dal import UserDAL
from db.models.user import User, UserStatus
from routers.auth_router import get_current_user, require_admin
from db.config import get_db
from dependencies import get_user_dal
from utils.auth import validate_password_strength, validate_email, validate_mobile

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

# NEW: Admin Create User Request Model
class AdminCreateUserRequest(BaseModel):
    name: str
    email: str
    mobile: str
    password: str
    role: str = "user"
    
    @validator('role')
    def validate_role(cls, v):
        if v not in ['user', 'admin']:
            raise ValueError('Role must be either "user" or "admin"')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v
    
    @validator('email')
    def validate_email_format(cls, v):
        if '@' not in v or '.' not in v:
            raise ValueError('Invalid email format')
        return v.lower()
    
    @validator('mobile')
    def validate_mobile_format(cls, v):
        if not v.isdigit() or len(v) < 8:
            raise ValueError('Mobile must be a valid number with at least 8 digits')
        return v

# NEW: Admin Create User Response Model
class AdminCreateUserResponse(BaseModel):
    id: int
    name: str
    email: str
    mobile: str
    role: str
    status: str
    is_email_verified: bool
    created_at: str
    message: str

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

# NEW: Admin Create User Endpoint
@router.post("/create-user", response_model=AdminCreateUserResponse)
async def admin_create_user(
    user_data: AdminCreateUserRequest,
    current_admin: User = Depends(require_admin),
    user_dal: UserDAL = Depends(get_user_dal),
    request: Request = None
):
    """
    Admin-only endpoint to create new users with any role.
    This is separate from the public registration endpoint.
    """
    
    client_ip = request.client.host if request else "unknown"
    
    try:
        # Log admin action
        print(f"Admin {current_admin.email} (ID: {current_admin.id}) creating user from IP: {client_ip}")
        print(f"User data: name={user_data.name}, email={user_data.email}, role={user_data.role}")
        
        # Additional validation
        if not validate_email(user_data.email):
            raise HTTPException(
                status_code=400, 
                detail="Invalid email format"
            )
        
        if not validate_mobile(user_data.mobile):
            raise HTTPException(
                status_code=400, 
                detail="Invalid mobile number format"
            )
        
        # Check if user already exists
        existing_user = await user_dal.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=400, 
                detail=f"User with email {user_data.email} already exists"
            )
        
        # Create the user using the auth registration flow
        # This ensures proper password hashing and user setup
        from routers.auth_router import UserRegister
        
        register_data = UserRegister(
            name=user_data.name,
            email=user_data.email,
            mobile=user_data.mobile,
            password=user_data.password
        )
        
        # Create user with specified role (this is the admin privilege)
        new_user = await user_dal.create_user_with_auth(
            name=register_data.name,
            email=register_data.email,
            mobile=register_data.mobile,
            password=register_data.password,  # Will be hashed by the DAL
            role=user_data.role  # Admin can set any role
        )
        
        print(f"✅ Admin {current_admin.email} successfully created user {new_user.email} with role {new_user.role}")
        
        return AdminCreateUserResponse(
            id=new_user.id,
            name=new_user.name,
            email=new_user.email,
            mobile=new_user.mobile,
            role=new_user.role,
            status=new_user.status,  # Remove .value since status is already a string
            is_email_verified=new_user.is_email_verified,
            created_at=new_user.created_at.isoformat(),
            message=f"User {new_user.name} created successfully by admin {current_admin.name}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in admin user creation: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to create user: {str(e)}"
        )

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