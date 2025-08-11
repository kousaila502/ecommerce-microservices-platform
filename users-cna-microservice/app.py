# app.py - Fixed with all routers included and corrected URLs

import os
import asyncio
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Import database config and health check
from db.config import check_database_health, validate_required_env_vars

# Import your existing routers
from routers.auth_router import router as auth_router
from routers.admin_router import router as admin_router
from routers.user_router import router as user_router

# Import the new routers
from routers.password_reset import router as password_reset_router
from routers.email_verification import router as email_verification_router
from routers.user_validation import router as user_validation_router

# Modern lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("\n" + "="*80)
    print("🚀 E-COMMERCE USER SERVICE - STARTUP")
    print("="*80)
    
    # Service Information
    print("📋 SERVICE INFORMATION:")
    print(f"   🏷️  Name: E-Commerce User Service")
    print(f"   📦 Version: 2.5.0-LIVE")
    print(f"   🌐 Platform: GKE Kubernetes")
    print(f"   🗄️  Database: Neon PostgreSQL")
    print(f"   📅 Started: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC")
    
    # Environment Validation
    print("\n🔧 ENVIRONMENT VALIDATION:")
    try:
        validate_required_env_vars()
        print("   ✅ Environment variables validated")
    except Exception as e:
        print(f"   ❌ Environment validation failed: {e}")
    
    # Database Health Check
    print("\n🗄️  DATABASE CONNECTIVITY:")
    db_health = await check_database_health()
    if db_health.get("status") == "connected":
        print("   ✅ PostgreSQL (Neon) - Connected")
        print("   🌐 Provider: Neon")
        print("   📍 Region: AWS us-east-2")
        print("   🔗 Host: ep-cold-breeze-aedi5hre-pooler.c-2.us-east-2.aws.neon.tech")
    else:
        print("   ❌ PostgreSQL (Neon) - Connection Failed")
        print(f"   ⚠️  Error: {db_health.get('error', 'Unknown error')}")
    
    # Live System URLs
    print("\n🌐 LIVE SYSTEM INTEGRATION:")
    print("   🎯 Frontend: https://ecommerce-app-omega-two-64.vercel.app")
    print("   🔗 API Gateway: https://34.95.5.30.nip.io")
    print("   🎮 Controller: https://techmart-controller.uksouth.azurecontainer.io:3000")
    
    # CORS Configuration
    print(f"\n🔒 CORS CONFIGURATION:")
    print(f"   ✅ Origins Configured: {len(cors_origins)} domains")
    print("   🌐 Live Frontend: Enabled")
    print("   🔗 API Gateway: Enabled")
    print("   🛡️  Credentials: Allowed")
    
    # API Documentation
    print("\n📚 API DOCUMENTATION:")
    print("   📖 Swagger UI: http://localhost:9090/docs")
    print("   📋 ReDoc: http://localhost:9090/redoc")
    print("   📄 OpenAPI JSON: http://localhost:9090/openapi.json")
    print("   📁 Swagger YAML: http://localhost:9090/swagger")
    
    # Available Endpoints
    print("\n🛠️  AVAILABLE ENDPOINTS:")
    print("   🔐 Authentication: /auth/*")
    print("   👤 User Management: /users/*")
    print("   👑 Admin Management: /admin/*")
    print("   🔑 Password Reset: /auth/forgot-password, /auth/reset-password")
    print("   📧 Email Verification: /auth/verify-email, /auth/resend-verification")
    print("   🏥 Health Checks: /health, /health/database")
    
    # Service Ready
    print("\n" + "="*80)
    print("✅ USER SERVICE SUCCESSFULLY STARTED!")
    print("🌐 Ready to handle requests on http://0.0.0.0:9090")
    print("📖 Documentation available at: http://localhost:9090/docs")
    print("="*80 + "\n")
    
    yield
    
    # Shutdown
    print("\n" + "="*80)
    print("🔄 USER SERVICE SHUTDOWN")
    print("="*80)
    print("   📅 Shutdown Time:", datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'), "UTC")
    print("   ✅ Service stopped gracefully")
    print("="*80 + "\n")

# Create FastAPI application with enhanced metadata and modern lifespan
app = FastAPI(
    title="E-Commerce User Service",
    description="Complete user management system with authentication, password reset, email verification, and live system integration",
    version="2.5.0-LIVE",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    root_path="/user",  # Fix for API Gateway routing
    lifespan=lifespan,
    contact={
        "name": "E-Commerce Platform Team",
        "url": "https://ecommerce-app-omega-two-64.vercel.app",
        "email": "support@ecommerce-platform.com"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    },
    servers=[
        {
            "url": "https://34.95.5.30.nip.io/user",
            "description": "Production API Gateway (GKE)"
        },
        {
            "url": "https://ecommerce-user-service.herokuapp.com",
            "description": "Backup Production Server"
        },
        {
            "url": "http://localhost:9090",
            "description": "Local Development Server"
        }
    ]
)

# CORS Configuration for Live System
cors_origins = [
    "https://ecommerce-app-omega-two-64.vercel.app",               # Live Frontend (Vercel) - UPDATED
    "https://34.95.5.30.nip.io",                                  # API Gateway (GKE) - UPDATED TO HTTPS
    "https://ecommerce-cart-service-f2a908c60d8a.herokuapp.com",      # Cart Service (Heroku)
    "https://ecommerce-product-service-56575270905a.herokuapp.com",   # Product Service (Heroku)
    "https://ecommerce-microservices-platform.onrender.com",          # Search Service (Render)
    "https://techmart-controller.uksouth.azurecontainer.io:3000",     # Controller (Azure) - UPDATED TO HTTPS
    "http://localhost:3000",   # Dev frontend
    "http://127.0.0.1:3000",   # Dev frontend alt
    "http://localhost:8080",   # Dev services
    "http://localhost:8081",   # Dev order service
    "http://localhost:3001",   # Dev product service
]

# Override with environment variable if provided
env_cors = os.getenv("CORS_ORIGINS")
if env_cors:
    additional_origins = [origin.strip() for origin in env_cors.split(",")]
    cors_origins.extend(additional_origins)

# CORS middleware with live system origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include all routers with prefixes
app.include_router(auth_router, tags=["Authentication"])
app.include_router(admin_router, tags=["Admin Management"]) 
app.include_router(user_router, tags=["User Management"])
app.include_router(password_reset_router, tags=["Password Reset"])
app.include_router(email_verification_router, tags=["Email Verification"])
app.include_router(user_validation_router, tags=["User Validation"])

# Swagger Documentation Route
@app.get("/swagger", include_in_schema=False)
async def get_swagger_yaml():
    """Serve the swagger.yaml file"""
    try:
        return FileResponse(
            path="swagger.yaml",
            media_type="application/x-yaml",
            filename="user-service-swagger.yaml"
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Swagger file not found")

# Enhanced health check endpoint with database connectivity
@app.get("/health", tags=["Health Checks"])
async def health_check():
    """Comprehensive health check for the User Service"""
    db_health = await check_database_health()
    
    return {
        "status": "healthy" if db_health.get("status") == "connected" else "degraded",
        "service": "user-service",
        "version": "2.5.0-LIVE",
        "timestamp": datetime.utcnow().isoformat(),
        "platform": "GKE Kubernetes",
        "database": {
            "provider": "Neon PostgreSQL",
            "status": db_health.get("status"),
            "host": "ep-cold-breeze-aedi5hre-pooler.c-2.us-east-2.aws.neon.tech",
            "platform": "AWS us-east-2"
        },
        "features": [
            "authentication",
            "user-management", 
            "admin-dashboard",
            "password-reset",
            "email-verification",
            "jwt-authentication",
            "live-system-integration",
            "swagger-documentation"
        ],
        "live_system": {
            "frontend": "https://ecommerce-app-omega-two-64.vercel.app",
            "api_gateway": "https://34.95.5.30.nip.io",
            "controller": "https://techmart-controller.uksouth.azurecontainer.io:3000"
        },
        "cors_enabled": True,
        "cors_origins_count": len(cors_origins),
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_json": "/openapi.json",
            "swagger_yaml": "/swagger"
        }
    }

# Database-specific health check
@app.get("/health/database", tags=["Health Checks"])
async def health_database():
    """Detailed database connectivity check"""
    db_health = await check_database_health()
    
    return {
        "service": "PostgreSQL Database (Neon)",
        "timestamp": datetime.utcnow().isoformat(),
        "provider": "Neon",
        "platform": "AWS us-east-2",
        "host": "ep-cold-breeze-aedi5hre-pooler.c-2.us-east-2.aws.neon.tech",
        "result": db_health
    }

# Service information endpoint
@app.get("/info", tags=["Service Information"])
async def service_info():
    """Detailed service information and configuration"""
    return {
        "service": "user-service",
        "version": "2.5.0-LIVE",
        "platform": "GKE Kubernetes",
        "database": "Neon PostgreSQL",
        "timestamp": datetime.utcnow().isoformat(),
        "live_system": {
            "frontend": "https://ecommerce-app-omega-two-64.vercel.app",
            "api_gateway": "https://34.95.5.30.nip.io",
            "controller": "https://techmart-controller.uksouth.azurecontainer.io:3000"
        },
        "endpoints": {
            "authentication": {
                "register": "/auth/register",
                "login": "/auth/login",
                "refresh": "/auth/refresh",
                "logout": "/auth/logout"
            },
            "user_management": {
                "profile": "/users/profile",
                "update_profile": "/users/profile",
                "delete_account": "/users/delete"
            },
            "password_management": {
                "forgot_password": "/auth/forgot-password",
                "reset_password": "/auth/reset-password",
                "change_password": "/users/change-password"
            },
            "email_verification": {
                "verify_email": "/auth/verify-email",
                "resend_verification": "/auth/resend-verification"
            },
            "admin": {
                "users_list": "/admin/users",
                "user_details": "/admin/users/{user_id}",
                "activate_user": "/admin/users/{user_id}/activate",
                "deactivate_user": "/admin/users/{user_id}/deactivate"
            }
        },
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_json": "/openapi.json",
            "swagger_yaml": "/swagger"
        },
        "features": [
            "JWT Authentication",
            "Password Reset via Email",
            "Email Verification",
            "User Profile Management",
            "Admin User Management",
            "CORS Support",
            "Live System Integration",
            "Database Health Monitoring",
            "Comprehensive API Documentation"
        ]
    }

# Root endpoint with welcome message
@app.get("/", tags=["Service Information"])
async def root():
    """Welcome endpoint with service overview"""
    return {
        "message": "🚀 E-Commerce User Service - Live System Integration",
        "service": "user-service",
        "version": "2.5.0-LIVE",
        "platform": "GKE Kubernetes",
        "database": "Neon PostgreSQL",
        "status": "operational",
        "live_system": {
            "frontend": "https://ecommerce-app-omega-two-64.vercel.app",
            "api_gateway": "https://34.95.5.30.nip.io"
        },
        "quick_links": {
            "documentation": "/docs",
            "health_check": "/health",
            "service_info": "/info",
            "swagger_yaml": "/swagger"
        },
        "getting_started": {
            "1": "📖 View API Documentation: /docs",
            "2": "🔍 Check Service Health: /health",
            "3": "👤 Register User: POST /auth/register",
            "4": "🔐 Login: POST /auth/login",
            "5": "📊 Service Info: /info"
        }
    }

# Main execution
if __name__ == "__main__":
    import uvicorn
    
    # Enhanced startup message
    print("\n🚀 Starting E-Commerce User Service...")
    print("📍 Host: 0.0.0.0:9090")
    print("📖 Documentation: http://localhost:9090/docs")
    print("🏥 Health Check: http://localhost:9090/health")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=9090,
        log_level="info",
        access_log=True
    )