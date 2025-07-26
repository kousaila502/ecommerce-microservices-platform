from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, constr
from db.dals.user_dal import user_exists

router = APIRouter()

class UserValidationRequest(BaseModel):
    username: constr(min_length=3, max_length=32)
    email: EmailStr

@router.post("/validate-user")
async def validate_user(data: UserValidationRequest):
    # Use the helper to check if user exists
    exists = user_exists(data.username, data.email)
    return {
        "username": data.username,
        "email": data.email,
        "valid": not exists,
        "message": "User validation successful" if not exists else "User already exists"
    }