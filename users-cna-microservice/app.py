# app.py - Fixed with all routers included

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import your existing routers (FIXED - UNCOMMENTED)
from routers.auth_router import router as auth_router
from routers.admin_router import router as admin_router
from routers.user_router import router as user_router

# Import the new routers
from routers.password_reset import router as password_reset_router
from routers.email_verification import router as email_verification_router
from routers.user_validation import router as user_validation_router

app = FastAPI(
    title="E-Commerce User Service",
    description="User management with authentication, password reset, and email verification for Live System",
    version="2.3.0-LIVE"
)

# FIXED: Live System CORS Configuration
cors_origins = [
    "https://ecommerce-microservices-platform.vercel.app",  # Live Frontend (Vercel)
    "http://34.118.167.199.nip.io",                         # API Gateway (GKE)
    "https://ecommerce-cart-service-f2a908c60d8a.herokuapp.com",      # Cart Service (Heroku)
    "https://ecommerce-product-service-56575270905a.herokuapp.com",   # Product Service (Heroku)
    "https://ecommerce-microservices-platform.onrender.com",          # Search Service (Render)
    "http://techmart-controller.uksouth.azurecontainer.io:3000",     # Controller (Azure)
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

print(f"🌐 CORS Origins configured: {len(cors_origins)} origins")
print("   ✅ Live Frontend: ecommerce-microservices-platform.vercel.app")
print("   ✅ API Gateway: 34.118.167.199.nip.io")
print("   ✅ Live Services: Heroku, Render, Azure")

# CORS middleware with live system origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include your existing routers (FIXED - UNCOMMENTED)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(user_router)

# Include the new routers
app.include_router(password_reset_router)
app.include_router(email_verification_router)
app.include_router(user_validation_router)

# Enhanced health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "user-service",
        "version": "2.4.0-LIVE",
        "timestamp": "2025-08-07T10:30:00.000Z",
        "platform": "GKE Kubernetes",
        "database": "Neon PostgreSQL",
        "features": [
            "authentication",
            "user-management", 
            "admin-dashboard",
            "password-reset",
            "email-verification",
            "live-system-integration"
        ],
        "live_system": {
            "frontend": "https://ecommerce-microservices-platform.vercel.app",
            "api_gateway": "http://34.118.167.199.nip.io",
            "controller": "http://techmart-controller.uksouth.azurecontainer.io:3000"
        },
        "cors_enabled": True,
        "cors_origins_count": len(cors_origins)
    }

@app.get("/")
async def root():
    return {
        "message": "E-Commerce User Service with Authentication, Password Reset & Email Verification - Live System Integration",
        "service": "user-service",
        "version": "2.3.0-LIVE",
        "platform": "GKE Kubernetes",
        "database": "Neon PostgreSQL",
        "docs": "/docs",
        "health": "/health",
        "live_system": {
            "frontend": "https://ecommerce-microservices-platform.vercel.app",
            "api_gateway": "http://34.118.167.199.nip.io"
        },
        "endpoints": {
            "auth": "/auth/*",
            "admin": "/admin/*",
            "user": "/user/*", 
            "password_reset": "/auth/forgot-password, /auth/reset-password",
            "email_verification": "/auth/verify-email, /auth/resend-verification"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9090)


