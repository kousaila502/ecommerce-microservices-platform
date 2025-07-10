from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from db.dals.user_dal import UserDAL
from db.models.user import User
from dependencies import get_user_dal

router = APIRouter()


@router.post("/users")
async def create_user(name: str, email: str, mobile: str, role: str = "user", user_dal: UserDAL = Depends(get_user_dal)):
    print("name: " + name)
    print("email: " + email)
    print("mobile: " + mobile)
    print("role: " + role)
    
    try:
        # Validate mobile number (basic validation)
        if not mobile.isdigit() or len(mobile) < 8:
            raise ValueError("Mobile must be a valid number with at least 8 digits")
        
        # Validate role
        if role not in ["admin", "user"]:
            raise ValueError("Role must be either 'admin' or 'user'")
        
        # Create user with role
        result = await user_dal.create_user(name, email, mobile, role)
        print("User created successfully:", result)
        
        # Convert to dictionary for JSON response
        user_dict = result.to_dict()
        print("Returning user data:", user_dict)
        return user_dict
        
    except ValueError as e:
        print("Error: Invalid input:", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print("Error creating user:", str(e))
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")


@router.put("/users/{user_id}")
async def update_user(user_id: int, name: Optional[str] = None, email: Optional[str] = None, 
                      mobile: Optional[str] = None, role: Optional[str] = None,
                      user_dal: UserDAL = Depends(get_user_dal)):
    try:
        # Validate mobile if provided
        if mobile is not None and (not mobile.isdigit() or len(mobile) < 8):
            raise ValueError("Mobile must be a valid number with at least 8 digits")
        
        # Validate role if provided
        if role is not None and role not in ["admin", "user"]:
            raise ValueError("Role must be either 'admin' or 'user'")
        
        # Update user
        result = await user_dal.update_user(user_id, name, email, mobile, role)
        print("User updated successfully:", result)
        return result
    except ValueError as e:
        print("Error: Invalid input:", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print("Error updating user:", str(e))
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")


@router.get("/users/{user_id}")
async def get_user(user_id: int, user_dal: UserDAL = Depends(get_user_dal)):
    try:
        result = await user_dal.get_user(user_id)
        if result is None:
            raise HTTPException(status_code=404, detail="User not found")
        return result
    except Exception as e:
        print("Error getting user:", str(e))
        raise HTTPException(status_code=500, detail=f"Error getting user: {str(e)}")


@router.get("/users")
async def get_all_users(user_dal: UserDAL = Depends(get_user_dal)):
    try:
        result = await user_dal.get_all_users()
        print("Retrieved users:", len(result))
        return result
    except Exception as e:
        print("Error getting all users:", str(e))
        raise HTTPException(status_code=500, detail=f"Error getting users: {str(e)}")


@router.get("/users/role/{role}")
async def get_users_by_role(role: str, user_dal: UserDAL = Depends(get_user_dal)):
    try:
        if role not in ["admin", "user"]:
            raise HTTPException(status_code=400, detail="Role must be either 'admin' or 'user'")
        
        # This would need to be implemented in your DAL
        # For now, get all users and filter (not efficient, but works for testing)
        all_users = await user_dal.get_all_users()
        filtered_users = [user for user in all_users if user.role == role]
        
        print(f"Retrieved {len(filtered_users)} users with role '{role}'")
        return filtered_users
    except Exception as e:
        print("Error getting users by role:", str(e))
        raise HTTPException(status_code=500, detail=f"Error getting users by role: {str(e)}")