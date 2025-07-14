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
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(orders.router)
app.include_router(admin_orders.router)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.service_name,
        "version": "TEST-V3-K-🔥",
        "timestamp": "2025-07-13-15:00"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Order Service API",
        "service": settings.service_name,
        "docs": "/docs",
        "health": "/health"
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    print(f"🚀 Starting {settings.service_name}")
    print(f"🌐 Running on: {settings.service_host}:{settings.service_port}")
    print(f"🏷️  Environment: {settings.environment}")
    await init_database()
    print("✅ Order Service started successfully!")

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