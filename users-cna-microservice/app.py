# app.py (REPLACE EXISTING)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from db.config import engine, Base
from routers import user_router, auth_router, admin_router

app = FastAPI(
    title="Users Microservice with Enhanced Authentication", 
    version="2.0.0",
    description="User management with JWT authentication, role-based access control, and admin features"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Include all routers
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(admin_router.router)  # NEW: Admin endpoints

@app.get("/")
async def root():
    return {
        "message": "Users Microservice with Enhanced Authentication",
        "version": "2.0.0",
        "features": [
            "JWT Authentication",
            "User Registration & Login",
            "Role-based Access Control",
            "User Blocking & Suspension",
            "Session Management",
            "Admin Dashboard",
            "Password Strength Validation",
            "Audit Logging"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "users-microservice",
        "version": "2.0.0"
    }

@app.on_event("startup")
async def startup():
    # Create db tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Database tables created (if they didn't exist).")
    print("🚀 Enhanced Users Microservice ready!")
    print("📋 Available features:")
    print("   - JWT Authentication")
    print("   - User Blocking/Suspension") 
    print("   - Session Tracking")
    print("   - Admin Management")
    print("   - Password Validation")
    print("🌐 CORS enabled for http://localhost:3000")
    print("📖 API docs: http://localhost:9090/docs")
        

if __name__ == '__main__':
    uvicorn.run("app:app", port=9090, host='127.0.0.1', reload=True)