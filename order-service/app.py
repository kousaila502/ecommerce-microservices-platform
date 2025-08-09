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

# Enhanced CORS middleware with comprehensive configuration
cors_origins = [
    "https://ecommerce-app-omega-two-64.vercel.app",  # Current frontend
    "https://ecommerce-microservices-platform.vercel.app",  # Backup frontend
    "http://34.95.5.30.nip.io",  # API Gateway HTTP
    "https://34.95.5.30.nip.io",  # API Gateway HTTPS
    "http://localhost:3000",  # Local frontend dev
    "http://127.0.0.1:3000",  # Local frontend dev
    "http://localhost:3001",  # Alternative local port
    "https://localhost:3000",  # Local HTTPS
]

# Add environment variable origins if available
if hasattr(settings, 'cors_origins') and settings.cors_origins:
    env_origins = settings.cors_origins.split(',')
    cors_origins.extend([origin.strip() for origin in env_origins])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization", 
        "X-Requested-With",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        "X-CSRF-Token",
        "X-Forwarded-For",
        "X-Real-IP"
    ],
    expose_headers=["*"],
    max_age=86400,  # 24 hours
)

# Include routers
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(admin_orders.router, prefix="/admin/orders", tags=["admin"])

@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    await init_database()
    print(f"🚀 Order Service started successfully")
    print(f"📊 CORS origins: {cors_origins}")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    await close_database()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "order-service",
        "version": "2.1.0",
        "cors_enabled": True
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Order Service API", 
        "version": "2.1.0",
        "endpoints": {
            "orders": "/orders",
            "admin": "/admin/orders",
            "health": "/health",
            "docs": "/docs"
        }
    }

# Add OPTIONS handler for preflight requests
@app.options("/{path:path}")
async def options_handler(path: str):
    """Handle preflight OPTIONS requests"""
    return {"message": "OK"}