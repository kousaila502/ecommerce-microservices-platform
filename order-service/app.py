import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from database.connection import init_database, close_database
from routers import orders, admin_orders
from utils.startup_health_checker import (
    run_startup_checks, 
    check_postgres_health, 
    check_redis_health,
    check_user_service_health,
    check_cart_service_health,
    check_product_service_health,
    check_search_service_health
)
from datetime import datetime

# Create FastAPI application
app = FastAPI(
    title="Order Service",
    description="E-commerce Order Management Service with Live System Integration",
    version="2.0.0-LIVE",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enhanced CORS middleware with live system configuration
if settings.is_production:
    allowed_origins = [
        "https://ecommerce-microservices-platform.vercel.app",  # Frontend
        "http://34.118.167.199.nip.io",                         # API Gateway
        "https://ecommerce-cart-service-f2a908c60d8a.herokuapp.com",      # Cart Service
        "https://ecommerce-product-service-56575270905a.herokuapp.com",   # Product Service
        "https://ecommerce-microservices-platform.onrender.com",          # Search Service
        "http://techmart-controller.uksouth.azurecontainer.io:3000"      # Controller
    ]
else:
    allowed_origins = [
        "https://ecommerce-microservices-platform.vercel.app",  # Production frontend (keep for testing)
        "http://34.118.167.199.nip.io",                         # API Gateway
        "https://ecommerce-cart-service-f2a908c60d8a.herokuapp.com",      # Cart Service
        "https://ecommerce-product-service-56575270905a.herokuapp.com",   # Product Service
        "https://ecommerce-microservices-platform.onrender.com",          # Search Service
        "http://techmart-controller.uksouth.azurecontainer.io:3000",     # Controller
        "http://localhost:3000",   # React frontend (dev)
        "http://localhost:8080",   # Local services (dev)
        "http://localhost:3001",   # Product service (dev)
        "http://localhost:8081",   # Order service (dev)
        "http://localhost:9090",   # User service (dev)
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(orders.router)
app.include_router(admin_orders.router)

# Basic health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.service_name,
        "version": "2.0.0-LIVE",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.environment,
        "uptime": "Service is running",
        "live_system": {
            "frontend": "https://ecommerce-microservices-platform.vercel.app",
            "api_gateway": "http://34.118.167.199.nip.io",
            "controller": "http://techmart-controller.uksouth.azurecontainer.io:3000"
        }
    }

# Comprehensive connectivity health check
@app.get("/health/connectivity")
async def health_connectivity():
    """Complete connectivity check for all live system dependencies"""
    results = await run_startup_checks()
    
    # Determine overall status
    connected_services = [r for r in results.values() if r.get("status") == "connected"]
    not_configured_services = [r for r in results.values() if r.get("status") == "not_configured"]
    all_configured_connected = len(connected_services) + len(not_configured_services) == len(results)
    
    return {
        "status": "healthy" if all_configured_connected else "degraded",
        "service": settings.service_name,
        "version": "2.0.0-LIVE",
        "timestamp": datetime.utcnow().isoformat(),
        "connectivity": results,
        "summary": {
            "total_services": len(results),
            "connected": len(connected_services),
            "not_configured": len(not_configured_services),
            "failed": sum(1 for r in results.values() if r.get("status") == "failed"),
            "warnings": sum(1 for r in results.values() if r.get("status") == "warning"),
            "timeouts": sum(1 for r in results.values() if r.get("status") == "timeout")
        },
        "live_system_status": {
            "postgres_neon": results.get("postgres", {}).get("status"),
            "redis_upstash": results.get("redis", {}).get("status"),
            "user_service_gke": results.get("user_service", {}).get("status"),
            "cart_service_heroku": results.get("cart_service", {}).get("status"),
            "product_service_heroku": results.get("product_service", {}).get("status"),
            "search_service_render": results.get("search_service", {}).get("status")
        }
    }

# Individual service health checks
@app.get("/health/postgres")
async def health_postgres():
    """PostgreSQL database health check (Neon)"""
    result = await check_postgres_health()
    return {
        "service": "PostgreSQL Database (Neon)",
        "timestamp": datetime.utcnow().isoformat(),
        "provider": "Neon",
        "host": "ep-cold-breeze-aedi5hre-pooler.c-2.us-east-2.aws.neon.tech",
        "result": result
    }

@app.get("/health/redis")
async def health_redis():
    """Redis cache health check (Upstash)"""
    result = await check_redis_health()
    return {
        "service": "Redis Cache (Upstash)",
        "timestamp": datetime.utcnow().isoformat(),
        "provider": "Upstash",
        "host": "discrete-raccoon-6606.upstash.io:6379",
        "result": result
    }

@app.get("/health/user-service")
async def health_user_service():
    """User Service health check (GKE via API Gateway)"""
    result = await check_user_service_health()
    return {
        "service": "User Service (GKE)",
        "timestamp": datetime.utcnow().isoformat(),
        "provider": "Google Kubernetes Engine",
        "api_gateway": "http://34.118.167.199.nip.io",
        "endpoint": "/user/health",
        "result": result
    }

@app.get("/health/cart-service")
async def health_cart_service():
    """Cart Service health check (Heroku)"""
    result = await check_cart_service_health()
    return {
        "service": "Cart Service (Heroku)",
        "timestamp": datetime.utcnow().isoformat(),
        "provider": "Heroku Platform",
        "url": "https://ecommerce-cart-service-f2a908c60d8a.herokuapp.com",
        "result": result
    }

@app.get("/health/product-service")
async def health_product_service():
    """Product Service health check (Heroku)"""
    result = await check_product_service_health()
    return {
        "service": "Product Service (Heroku)",
        "timestamp": datetime.utcnow().isoformat(),
        "provider": "Heroku Platform",
        "url": "https://ecommerce-product-service-56575270905a.herokuapp.com",
        "result": result
    }

@app.get("/health/search-service")
async def health_search_service():
    """Search Service health check (Render)"""
    result = await check_search_service_health()
    return {
        "service": "Search Service (Render)",
        "timestamp": datetime.utcnow().isoformat(),
        "provider": "Render Platform",
        "url": "https://ecommerce-microservices-platform.onrender.com",
        "result": result
    }

@app.get("/health/info")
async def health_info():
    """Service configuration and live system environment information"""
    live_urls = settings.get_live_system_urls()
    
    return {
        "service": settings.service_name,
        "version": "2.0.0-LIVE",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.environment,
        "live_system": live_urls,
        "configuration": {
            "database_configured": bool(settings.database_url),
            "redis_configured": bool(settings.redis_url),
            "external_services": {
                "user_service": settings.user_service_url,
                "cart_service": settings.cart_service_url,
                "product_service": settings.product_service_url,
                "search_service": settings.search_service_url
            },
            "cors_origins": allowed_origins,
            "jwt_algorithm": settings.algorithm,
            "token_expire_minutes": settings.access_token_expire_minutes
        },
        "platforms": {
            "frontend": {"platform": "Vercel", "url": live_urls["frontend"]},
            "api_gateway": {"platform": "GKE Kubernetes", "url": live_urls["api_gateway"]},
            "controller": {"platform": "Azure Container Instance", "url": live_urls["controller"]},
            "database": {"platform": "Neon PostgreSQL", "provider": "Neon"},
            "cache": {"platform": "Upstash Redis", "provider": "Upstash"},
            "services": {
                "user": {"platform": "GKE Kubernetes", "url": live_urls["services"]["user"]},
                "cart": {"platform": "Heroku", "url": live_urls["services"]["cart"]},
                "product": {"platform": "Heroku", "url": live_urls["services"]["product"]},
                "search": {"platform": "Render", "url": live_urls["services"]["search"]}
            }
        },
        "features": [
            "Order Management",
            "Live System Integration",
            "Multi-Cloud Architecture",
            "PostgreSQL Database (Neon)",
            "Redis Caching (Upstash)",
            "JWT Authentication",
            "External Service Integration",
            "Comprehensive Health Monitoring",
            "CORS Support",
            "API Documentation",
            "Platform-Aware Connectivity"
        ]
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Order Service API is running with Live System Integration",
        "service": settings.service_name,
        "version": "2.0.0-LIVE",
        "docs": "/docs",
        "health": "/health",
        "connectivity": "/health/connectivity",
        "live_system": {
            "frontend": "https://ecommerce-microservices-platform.vercel.app",
            "api_gateway": "http://34.118.167.199.nip.io",
            "controller": "http://techmart-controller.uksouth.azurecontainer.io:3000"
        },
        "endpoints": {
            "health": "/health",
            "connectivity": "/health/connectivity",
            "postgres": "/health/postgres",
            "redis": "/health/redis",
            "user_service": "/health/user-service",
            "cart_service": "/health/cart-service", 
            "product_service": "/health/product-service",
            "search_service": "/health/search-service",
            "info": "/health/info"
        },
        "platform_status": {
            "database": "Neon PostgreSQL",
            "cache": "Upstash Redis",
            "user_service": "GKE Kubernetes",
            "cart_service": "Heroku",
            "product_service": "Heroku",
            "search_service": "Render"
        }
    }

# Startup event with comprehensive live system health checks
@app.on_event("startup")
async def startup_event():
    print(f"🚀 Starting {settings.service_name} v2.0.0-LIVE")
    print(f"🌐 Running on: {settings.service_host}:{settings.service_port}")
    print(f"🏷️  Environment: {settings.environment}")
    print("🌐 Live System Integration:")
    print(f"   🎯 Frontend: https://ecommerce-microservices-platform.vercel.app")
    print(f"   🔗 API Gateway: http://34.118.167.199.nip.io")
    print(f"   🎮 Controller: http://techmart-controller.uksouth.azurecontainer.io:3000")
    
    # Initialize database
    await init_database()
    
    # Run comprehensive startup checks for live system
    await run_startup_checks()
    
    print("✅ Order Service with Live System Integration started successfully!")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    print("🔄 Shutting down Order Service...")
    await close_database()
    print("✅ Order Service stopped successfully!")

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host=settings.service_host,
        port=settings.service_port,
        reload=settings.is_development,
        log_level=settings.log_level.lower()
    )