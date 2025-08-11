from fastapi import APIRouter
from utils.startup_health_checker import (
    check_postgres_health,
    check_redis_health, 
    check_user_service_health,
    check_cart_service_health,
    check_product_service_health,
    check_search_service_health,
    run_startup_checks
)

router = APIRouter()

@router.get("/connectivity")
async def get_connectivity():
    """Get all service connectivity status"""
    return await run_startup_checks()

@router.get("/postgres") 
async def get_postgres_health():
    """Get PostgreSQL connectivity status"""
    return await check_postgres_health()

@router.get("/redis")
async def get_redis_health():
    """Get Redis connectivity status"""  
    return await check_redis_health()

@router.get("/user-service")
async def get_user_service_health():
    """Get User Service connectivity status"""
    return await check_user_service_health()

@router.get("/cart-service")
async def get_cart_service_health():
    """Get Cart Service connectivity status"""
    return await check_cart_service_health()

@router.get("/product-service") 
async def get_product_service_health():
    """Get Product Service connectivity status"""
    return await check_product_service_health()

@router.get("/search-service")
async def get_search_service_health():
    """Get Search Service connectivity status"""
    return await check_search_service_health()