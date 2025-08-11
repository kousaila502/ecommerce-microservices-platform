import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from database.connection import init_database, close_database
from routers import orders, admin_orders, health  # Added health import

# Create FastAPI application
app = FastAPI(
    title="Order Service API - Live System Integration",
    description="""
E-commerce Order Management Service with comprehensive live system integration

## 🌐 Live System Architecture
This Order Service integrates with a multi-cloud microservices ecosystem:

### Frontend & Gateway
- **Frontend**: Vercel - https://ecommerce-app-omega-two-64.vercel.app
- **API Gateway**: GKE Kubernetes - https://34.95.5.30.nip.io

### External Services
- **User Service**: GKE Kubernetes (via API Gateway)
- **Cart Service**: Heroku Platform
- **Product Service**: Heroku Platform  
- **Search Service**: Render Platform

### Data Layer
- **Database**: Neon PostgreSQL (AWS us-east-2)
- **Cache**: Upstash Redis

## 🎯 Features
- Order creation and management
- Multi-platform service integration
- Comprehensive health monitoring
- JWT authentication
- CORS support for live frontend
- Real-time connectivity checks
- Platform-aware error handling

## 🔍 Health Monitoring
This service provides extensive health check endpoints to monitor all live system dependencies:
- Basic health check
- Database connectivity (Neon PostgreSQL)
- Cache connectivity (Upstash Redis)
- External service connectivity (GKE, Heroku, Render)
- Configuration validation
- Live system status overview
    """,
    version="2.1.0",
    docs_url=None,
    redoc_url=None,
    openapi_url=None  # Fixed: removed /order/ prefix
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
app.include_router(health.router, prefix="/health", tags=["health"])  # Added health router


@app.get("/docs")
async def custom_docs():
    """Custom docs endpoint without authentication"""
    from fastapi.openapi.docs import get_swagger_ui_html
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="Order Service API"
    )

@app.get("/redoc")
async def custom_redoc():
    """Custom redoc endpoint without authentication"""
    from fastapi.openapi.docs import get_redoc_html
    return get_redoc_html(
        openapi_url="/openapi.json",
        title="Order Service API"
    )

@app.get("/openapi.json", include_in_schema=False)
async def custom_openapi():
    """Custom OpenAPI schema without authentication"""
    return app.openapi()

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

@app.get("/health", tags=["health"])
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy", 
        "service": "order-service",
        "version": "2.2.0",
        "cors_enabled": True,
        "timestamp": "2025-08-11T17:45:00Z",
        "environment": settings.environment,
        "live_system": {
            "frontend": "https://ecommerce-app-omega-two-64.vercel.app",
            "api_gateway": "https://34.95.5.30.nip.io",
            "database": "Neon PostgreSQL",
            "cache": "Upstash Redis"
        }
    }

@app.get("/", tags=["service-info"])
async def root():
    """Root endpoint with service information"""
    return {
        "message": "Order Service API - Live System Integration", 
        "service": "order-service",
        "version": "2.4.0",
        "status": "running",
        "endpoints": {
            "orders": "/orders",
            "admin": "/admin/orders",
            "health": "/health",
            "health_monitoring": "/health/connectivity",
            "docs": "/docs",
            "openapi": "/openapi.json"
        },
        "live_system": {
            "frontend": "https://ecommerce-app-omega-two-64.vercel.app",
            "api_gateway": "https://34.95.5.30.nip.io",
            "platforms": {
                "database": "Neon PostgreSQL (AWS)",
                "cache": "Upstash Redis",
                "user_service": "GKE Kubernetes",
                "cart_service": "Heroku",
                "product_service": "Heroku",
                "search_service": "Render"
            }
        },
        "features": [
            "Order Management",
            "Live System Integration", 
            "Multi-Cloud Architecture",
            "Comprehensive Health Monitoring",
            "JWT Authentication",
            "CORS Support",
            "Platform-Aware Connectivity"
        ]
    }

# Add OPTIONS handler for preflight requests
@app.options("/{path:path}")
async def options_handler(path: str):
    """Handle preflight OPTIONS requests"""
    return {"message": "OK"}