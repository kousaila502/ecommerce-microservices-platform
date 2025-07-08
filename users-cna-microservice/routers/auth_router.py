from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from datetime import timedelta
from typing import Optional

from db.dals.user_dal import UserDAL
from db.models.user import User
from utils.auth import create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES
from db.config import get_db

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    name: str
    email: str
    mobile: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    mobile: str
    role: str

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    async with db as session:
        user_dal = UserDAL(session)
        # Convert user_id to string since your get_user method expects string
        user = await user_dal.get_user(str(user_id))
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    async with db as session:
        user_dal = UserDAL(session)
        
        existing_user = await user_dal.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        new_user = await user_dal.create_user(
            name=user_data.name,
            email=user_data.email,
            mobile=user_data.mobile,
            password=user_data.password,
            role='user'
        )
        await session.commit()
        
        return UserResponse(**new_user.to_dict())

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    async with db as session:
        user_dal = UserDAL(session)
        
        user = await user_dal.authenticate_user(user_credentials.email, user_credentials.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role},
            expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(**current_user.to_dict())

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Successfully logged out"}