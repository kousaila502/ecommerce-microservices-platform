import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from database.connection import get_db
from utils.auth import get_current_admin_user, User
from services.order_service import OrderService
from schemas.order_schemas import OrderResponse, OrderSummary, OrderUpdate, OrderStats

router = APIRouter(tags=["admin-orders"])

@router.get(
    "/stats",
    response_model=OrderStats,
    summary="Get order statistics",
    description="Retrieve statistics for all orders (admin only)",
    tags=["admin-orders"],
    responses={
        200: {"description": "Order statistics"},
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden - Admin access required"}
    }
)
async def get_order_statistics(
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get order statistics for admin dashboard"""
    order_service = OrderService(db)
    stats = await order_service.get_order_stats()
    return stats

@router.get(
    "/",
    response_model=List[OrderSummary],
    summary="Get all orders (admin only)",
    description="Retrieve all orders with pagination (admin only)",
    tags=["admin-orders"],
    responses={
        200: {"description": "List of orders"},
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden - Admin access required"}
    }
)
async def get_all_orders(
    page: int = 1,
    size: int = 20,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all orders (admin only)"""
    order_service = OrderService(db)
    
    # For admin, we'll get all orders across all users
    from sqlalchemy import select, desc
    from models.order import Order
    
    offset = (page - 1) * size
    query = select(Order).order_by(desc(Order.created_at)).offset(offset).limit(size)
    result = await db.execute(query)
    orders = result.scalars().all()
    
    return orders

@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Get order by ID (admin only)",
    description="Retrieve any order by ID (admin only)",
    tags=["admin-orders"],
    responses={
        200: {"description": "Order details"},
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden - Admin access required"},
        404: {"description": "Order not found"}
    }
)
async def get_order_by_id_admin(
    order_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get any order by ID (admin only)"""
    order_service = OrderService(db)
    order = await order_service.get_order_by_id(order_id, current_user)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order

@router.put(
    "/{order_id}/status",
    response_model=OrderResponse,
    summary="Update order status (admin only)",
    description="Update the status of an order (admin only)",
    tags=["admin-orders"],
    responses={
        200: {"description": "Order status updated"},
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden - Admin access required"},
        404: {"description": "Order not found"},
        500: {"description": "Failed to update order"}
    }
)
async def update_order_status_admin(
    order_id: int,
    update_data: OrderUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update order status (admin only)"""
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