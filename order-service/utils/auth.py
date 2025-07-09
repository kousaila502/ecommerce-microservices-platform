import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional
from config.settings import settings
import httpx
from datetime import datetime

# Security instance
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
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.user_service_url}/users/{user_id}",
                timeout=5.0
            )
            if response.status_code == 200:
                user_data = response.json()
                return User(
                    id=user_data["id"],
                    email=user_data["email"],
                    name=user_data["name"],
                    role=user_data.get("role", "user"),
                    status=user_data.get("status", "active")
                )
    except Exception as e:
        print(f"Error fetching user from service: {e}")
    return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify token
        payload = await verify_token(credentials.credentials)
        if payload is None:
            raise credentials_exception
        
        # Get user ID from token
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        # Check token expiration
        exp = payload.get("exp")
        if exp is None or datetime.utcnow().timestamp() > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from user service
        user = await get_user_from_service(int(user_id))
        if user is None:
            raise credentials_exception
            
        # Check if user is active
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is not active"
            )
            
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Authentication error: {e}")
        raise credentials_exception

async def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current user and verify admin privileges"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user