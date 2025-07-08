from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, validator
from datetime import timedelta
from typing import Optional
import logging

from db.dals.user_dal import UserDAL
from db.models.user import User, UserStatus
from utils.auth import (
    create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES,
    validate_password_strength, validate_email, validate_mobile
)
from db.config import get_db

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

# Enhanced Pydantic models with validation
class UserRegister(BaseModel):
    name: str
    email: str
    mobile: str
    password: str
    
    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters long')
        if len(v.strip()) > 100:
            raise ValueError('Name must be less than 100 characters')
        return v.strip()
    
    @validator('email')
    def validate_email_field(cls, v):
        is_valid, message = validate_email(v)
        if not is_valid:
            raise ValueError(message)
        return v.lower().strip()
    
    @validator('mobile')
    def validate_mobile_field(cls, v):
        is_valid, message = validate_mobile(v)
        if not is_valid:
            raise ValueError(message)
        return v.strip()
    
    @validator('password')
    def validate_password_field(cls, v):
        is_valid, message = validate_password_strength(v)
        if not is_valid:
            raise ValueError(message)
        return v

class UserLogin(BaseModel):
    email: str
    password: str
    
    @validator('email')
    def validate_email_field(cls, v):
        return v.lower().strip()

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    mobile: str
    role: str
    status: str
    is_email_verified: bool
    created_at: Optional[str]
    last_login: Optional[str]

# Helper function to get client info
def get_client_info(request: Request) -> tuple[str, str]:
    """Get client IP and User Agent"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        ip = forwarded.split(",")[0].strip()
    else:
        ip = request.client.host if request.client else "unknown"
    
    user_agent = request.headers.get("User-Agent", "unknown")
    return ip, user_agent

# Enhanced authentication endpoints
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister, 
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user with enhanced validation"""
    ip, user_agent = get_client_info(request)
    
    logger.info(f"Registration attempt for email: {user_data.email} from IP: {ip}")
    
    async with db as session:
        user_dal = UserDAL(session)
        
        # Check if user already exists
        existing_user = await user_dal.get_user_by_email(user_data.email)
        if existing_user:
            logger.warning(f"Registration failed - email exists: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        new_user = await user_dal.create_user(
            name=user_data.name,
            email=user_data.email,
            mobile=user_data.mobile,
            password=user_data.password,
            role='user'
        )
        await session.commit()
        
        logger.info(f"User registered successfully: {new_user.id} - {new_user.email}")
        
        return UserResponse(**new_user.to_dict())

@router.post("/login", response_model=Token)
async def login(
    user_credentials: UserLogin, 
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate user with session tracking"""
    ip, user_agent = get_client_info(request)
    
    logger.info(f"Login attempt for email: {user_credentials.email} from IP: {ip}")
    
    async with db as session:
        user_dal = UserDAL(session)
        
        # Authenticate user
        user = await user_dal.authenticate_user(user_credentials.email, user_credentials.password)
        
        if not user:
            logger.warning(f"Failed login attempt for email: {user_credentials.email} from IP: {ip}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is blocked
        if user.is_blocked():
            logger.warning(f"Blocked user login attempt: {user.email} from IP: {ip}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account is {user.status}. Contact administrator for assistance.",
            )
        
        # Create access token with session tracking
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token, token_id = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role},
            expires_delta=access_token_expires
        )
        
        # Create session record
        await user_dal.create_session(
            user_id=user.id,
            token_id=token_id,
            ip_address=ip,
            user_agent=user_agent
        )
        await session.commit()
        
        logger.info(f"Successful login for user: {user.id} - {user.email} from IP: {ip}")
        
        return {
            "access_token": access_token, 
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }

# Enhanced get_current_user with session validation
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current user with session validation"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    token_id = payload.get("jti")
    
    if user_id is None or token_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    async with db as session:
        user_dal = UserDAL(session)
        user = await user_dal.get_user(str(user_id))
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is blocked
        if user.is_blocked():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account is {user.status}. Contact administrator.",
            )
        
        return user

# Enhanced logout with session cleanup
@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Logout user and cleanup session"""
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload and payload.get("jti"):
        token_id = payload.get("jti")
        
        async with db as session:
            user_dal = UserDAL(session)
            await user_dal.end_session(token_id)
            await session.commit()
        
        logger.info(f"User logged out: {current_user.id} - {current_user.email}")
    
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(**current_user.to_dict())

# Check if user is admin (with status check)
async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role and active status"""
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    if not current_user.is_active():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is not active"
        )
    
    return current_user