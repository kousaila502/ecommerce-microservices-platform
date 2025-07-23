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

app = FastAPI(
    title="E-Commerce User Service",
    description="User management with authentication, password reset, and email verification",
    version="2.2.0"
)

# Get CORS origins from environment variable
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
cors_origins = [origin.strip() for origin in cors_origins]  # Remove whitespace

print(f"CORS Origins: {cors_origins}")

# CORS middleware with dynamic origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your existing routers (FIXED - UNCOMMENTED)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(user_router)

# Include the new routers
app.include_router(password_reset_router)
app.include_router(email_verification_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "user-service",
        "version": "5.0",
        "features": [
            "authentication",
            "user-management", 
            "admin-dashboard",
            "password-reset",
            "email-verification"
        ],
        "message": "E-Commerce User Service with Authentication, Password Reset & Email Verification Good to Go!!!"
    }

@app.get("/")
async def root():
    return {
        "message": "E-Commerce User Service with Authentication, Password Reset & Email Verification",
        "docs": "/docs",
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