import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from database.connection import init_database, close_database
from routers import orders, admin_orders

# Create FastAPI application
app = FastAPI(
    title="Order Service",
    description="E-commerce Order Management Service",
    version="2.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ecommerce-app-omega-two-64.vercel.app",
        "http://34.95.5.30.nip.io",
        "https://ecommerce-cart-service-f2a908c60d8a.herokuapp.com",
        "https://ecommerce-product-service-56575270905a.herokuapp.com",
        "http://localhost:3000",
        "http://localhost:8081"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(admin_orders.router, prefix="/admin/orders", tags=["admin"])

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    await init_database()

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    await close_database()

@app.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {"status": "healthy", "service": "order-service"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Order Service API", "version": "2.1.0"}