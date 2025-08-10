import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional
from config.settings import settings
import httpx

security = HTTPBearer()

class User:
    def __init__(self, id: int, email: str, name: str, role: str = "user", status: str = "active"):
        self.id = id
        self.email = email
        self.name = name
        self.role = role
        self.status = status
        self.is_admin = role == "admin"

async def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        return None

async def get_user_from_service(user_id: int) -> Optional[User]:
    """Get user details from user service"""
    try:
        url = f"https://34.95.5.30.nip.io/user/{user_id}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            
            if response.status_code == 200:
                user_data = response.json()
                return User(
                    id=user_data.get("id"),
                    email=user_data.get("email"),
                    name=user_data.get("name"),
                    role=user_data.get("role", "user"),
                    status=user_data.get("status", "active")
                )
            return None
    except Exception:
        return None

async def create_user_from_token(token_payload: dict) -> User:
    """Create user object from token payload"""
    return User(
        id=int(token_payload.get("sub")),
        email=token_payload.get("email", ""),
        name=token_payload.get("name", ""),
        role=token_payload.get("role", "user"),
        status="active"
    )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current user from JWT token"""
    token = credentials.credentials
    
    # Verify token
    payload = await verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    user_id = int(payload.get("sub"))
    
    # Try to get user from service
    user = await get_user_from_service(user_id)
    
    # Fallback to token data if service unavailable
    if not user:
        user = await create_user_from_token(payload)
    
    return user

async def get_current_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current admin user from JWT token"""
    user = await get_current_user(credentials)
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return user