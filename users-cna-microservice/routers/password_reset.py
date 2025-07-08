# routers/password_reset.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, validator
from datetime import datetime, timedelta
import secrets
import hashlib
import re
from typing import Optional

from db.config import get_db
from db.models.user import User, UserStatus
from db.dals.user_dal import UserDAL
from utils.auth import validate_password_strength

router = APIRouter(prefix="/auth", tags=["password-reset"])

# Pydantic Models
class ForgotPasswordRequest(BaseModel):
    email: str
    
    @validator('email')
    def validate_email(cls, v):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, v):
            raise ValueError('Invalid email format')
        return v.lower()

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class PasswordResetResponse(BaseModel):
    message: str
    success: bool

# Utility Functions
def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def is_token_expired(expires_at: Optional[datetime]) -> bool:
    if not expires_at:
        return True
    return datetime.utcnow() > expires_at

async def send_reset_email(email: str, token: str) -> bool:
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    print(f"Password reset link for {email}: {reset_link}")
    return True

# API Endpoints
@router.post("/forgot-password", response_model=PasswordResetResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        user_dal = UserDAL(db)
        user = await user_dal.get_user_by_email(request.email)
        
        if not user:
            return PasswordResetResponse(
                message="If the email exists, a reset link has been sent.",
                success=True
            )
        
        if user.status != UserStatus.ACTIVE:
            return PasswordResetResponse(
                message="Account is not active. Please contact support.",
                success=False
            )
        
        reset_token = generate_reset_token()
        hashed_token = hash_token(reset_token)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        await user_dal.set_password_reset_token(user.id, hashed_token, expires_at)
        await db.commit()
        
        email_sent = await send_reset_email(user.email, reset_token)
        
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send reset email"
            )
        
        return PasswordResetResponse(
            message="If the email exists, a reset link has been sent.",
            success=True
        )
        
    except Exception as e:
        await db.rollback()
        print(f"Error in forgot_password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request"
        )

@router.post("/reset-password", response_model=PasswordResetResponse)
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        is_valid, message = validate_password_strength(request.new_password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        hashed_token = hash_token(request.token)
        
        user_dal = UserDAL(db)
        user = await user_dal.get_user_by_reset_token(hashed_token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        if is_token_expired(user.reset_token_expires):
            await user_dal.clear_password_reset_token(user.id)
            await db.commit()
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset token has expired. Please request a new one."
            )
        
        await user_dal.update_password_with_reset(user.id, request.new_password)
        await db.commit()
        
        return PasswordResetResponse(
            message="Password has been reset successfully. You can now login with your new password.",
            success=True
        )
        
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        print(f"Error in reset_password: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while resetting your password"
        )

@router.get("/reset-status")
async def reset_status():
    return {
        "service": "password-reset",
        "status": "operational",
        "features": ["forgot-password", "reset-password"],
        "token_expiry": "1 hour"
    }