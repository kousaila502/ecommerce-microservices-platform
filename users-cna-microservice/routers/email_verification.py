# routers/email_verification.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, validator
from datetime import datetime, timedelta
import secrets
import hashlib
import re
from typing import Optional

# Import your existing dependencies
from db.config import get_db
from db.models.user import User, UserStatus
from db.dals.user_dal import UserDAL
from routers.auth_router import get_current_user

router = APIRouter(prefix="/auth", tags=["email-verification"])

# Pydantic Models
class VerifyEmailRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    email: str
    
    @validator('email')
    def validate_email(cls, v):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, v):
            raise ValueError('Invalid email format')
        return v.lower()

class EmailVerificationResponse(BaseModel):
    message: str
    success: bool
    is_verified: Optional[bool] = None

# Utility Functions
def generate_verification_token() -> str:
    """Generate a secure verification token"""
    return secrets.token_urlsafe(32)

def hash_token(token: str) -> str:
    """Hash token for database storage"""
    return hashlib.sha256(token.encode()).hexdigest()

def is_token_expired(expires_at: Optional[datetime]) -> bool:
    """Check if verification token is expired"""
    if not expires_at:
        return True
    return datetime.utcnow() > expires_at

# Email service placeholder
async def send_verification_email(email: str, name: str, token: str) -> bool:
    """
    Send email verification email
    TODO: Implement with your email service
    """
    verification_link = f"http://localhost:3000/verify-email?token={token}"
    print(f"Email verification link for {name} ({email}): {verification_link}")
    
    # In production, replace with actual email sending:
    # try:
    #     send_email(
    #         to=email,
    #         subject="Please verify your email address",
    #         html_content=f"Hi {name}, please click here to verify your email: {verification_link}"
    #     )
    #     return True
    # except Exception as e:
    #     print(f"Failed to send verification email: {e}")
    #     return False
    
    return True  # Simulate success for development

# API Endpoints
@router.post("/verify-email", response_model=EmailVerificationResponse)
async def verify_email(
    request: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Verify user email using verification token
    """
    try:
        # Hash the token to find user
        hashed_token = hash_token(request.token)
        
        # Find user by verification token using DAL
        async with db as session:
            user_dal = UserDAL(session)
            user = await user_dal.get_user_by_verification_token(hashed_token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token"
            )
        
        # Check if already verified
        if user.is_email_verified:
            return EmailVerificationResponse(
                message="Email is already verified.",
                success=True,
                is_verified=True
            )
        
        # Check if token is expired
        if is_token_expired(user.email_verification_expires):
            # Clear expired token
            async with db as session:
                user_dal = UserDAL(session)
                await user_dal.clear_email_verification_token(user.id)
                await session.commit()
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification token has expired. Please request a new one."
            )
        
        # Verify the email
        async with db as session:
            user_dal = UserDAL(session)
            await user_dal.verify_user_email(user.id)
            await session.commit()
        
        return EmailVerificationResponse(
            message="Email verified successfully! Your account is now fully activated.",
            success=True,
            is_verified=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in verify_email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while verifying your email"
        )

@router.post("/resend-verification", response_model=EmailVerificationResponse)
async def resend_verification(
    request: ResendVerificationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Resend email verification link
    """
    try:
        # Find user by email
        async with db as session:
            user_dal = UserDAL(session)
            user = await user_dal.get_user_by_email(request.email)
        
        if not user:
            # Don't reveal if email exists (security)
            return EmailVerificationResponse(
                message="If the email exists and is unverified, a verification link has been sent.",
                success=True
            )
        
        # Check if already verified
        if user.is_email_verified:
            return EmailVerificationResponse(
                message="Email is already verified.",
                success=True,
                is_verified=True
            )
        
        # Check rate limiting (prevent spam)
        async with db as session:
            user_dal = UserDAL(session)
            can_resend = await user_dal.can_resend_verification(user.id, cooldown_minutes=5)
        
        if not can_resend:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Please wait 5 minutes before requesting another verification email."
            )
        
        # Generate new verification token
        verification_token = generate_verification_token()
        hashed_token = hash_token(verification_token)
        expires_at = datetime.utcnow() + timedelta(hours=24)  # 24 hour expiry
        
        # Update user with new verification token
        async with db as session:
            user_dal = UserDAL(session)
            await user_dal.set_email_verification_token(user.id, hashed_token, expires_at)
            await session.commit()
        
        # Send verification email
        email_sent = await send_verification_email(user.email, user.name, verification_token)
        
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send verification email"
            )
        
        return EmailVerificationResponse(
            message="Verification email sent successfully. Please check your inbox.",
            success=True,
            is_verified=False
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in resend_verification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while sending verification email"
        )

@router.get("/verification-status")
async def get_verification_status(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's email verification status
    """
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "is_verified": current_user.is_email_verified,
        "verification_sent_at": current_user.verification_sent_at.isoformat() if current_user.verification_sent_at else None
    }

# Helper endpoint for sending verification email during registration
async def send_verification_on_registration(user: User, db: AsyncSession) -> bool:
    """
    Helper function to send verification email when user registers
    Call this from your registration endpoint
    """
    try:
        # Generate verification token
        verification_token = generate_verification_token()
        hashed_token = hash_token(verification_token)
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        # Set verification token
        async with db as session:
            user_dal = UserDAL(session)
            await user_dal.set_email_verification_token(user.id, hashed_token, expires_at)
            await session.commit()
        
        # Send email
        return await send_verification_email(user.email, user.name, verification_token)
        
    except Exception as e:
        print(f"Error sending verification email on registration: {e}")
        return False