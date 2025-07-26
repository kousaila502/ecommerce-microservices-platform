from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, constr

router = APIRouter()

class UserValidationRequest(BaseModel):
    username: constr(min_length=3, max_length=32)
    email: EmailStr

@router.post("/validate-user")
async def validate_user(data: UserValidationRequest):
    # Dummy validation logic for testing
    if not data.username or not data.email:
        raise HTTPException(status_code=400, detail="Invalid input")
    # In a real scenario, you would check if the user exists in the database
    return {
        "username": data.username,
        "email": data.email,
        "valid": True,
        "message": "User validation successful (dummy response)"
    }