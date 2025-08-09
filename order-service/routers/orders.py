import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from database.connection import get_db
from utils.auth import get_current_user, User
from services.order_service import OrderService
from schemas.order_schemas import OrderCreate, OrderResponse, OrderSummary, OrderUpdate

router = APIRouter()

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order_simple(
    order_data: Optional[OrderCreate] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    authorization: str = Header(..., alias="Authorization")
):
    """Create order from cart - one-click checkout"""
    if order_data is None:
        order_data = OrderCreate()

    order_service = OrderService(db)
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    
    try:
        order = await order_service.create_order_simple(order_data, current_user, token)
        return order
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order"
        )

@router.get("/", response_model=List[OrderSummary])
async def get_my_orders(
    page: int = 1,
    size: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's orders"""
    order_service = OrderService(db)
    orders = await order_service.get_user_orders(current_user.id, page, size)
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific order by ID"""
    order_service = OrderService(db)
    order = await order_service.get_order_by_id(order_id, current_user)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order

@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    update_data: OrderUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update order (admin only)"""
    order_service = OrderService(db)
    
    try:
        order = await order_service.update_order_status(order_id, update_data, current_user)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        return order
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order"
        )