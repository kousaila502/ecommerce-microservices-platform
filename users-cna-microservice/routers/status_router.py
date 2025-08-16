# routers/status_router.py
import os
import time
from fastapi import APIRouter

router = APIRouter(prefix="/status", tags=["Status"])

# Record the app start time for uptime tracking
start_time = time.time()

@router.get("")
async def health_check():
    uptime = round(time.time() - start_time, 2)

    return {
        "status": "ok",
        "uptime_seconds": uptime,
        "environment": os.getenv("ENV", "development"),
        "version": os.getenv("APP_VERSION", "1.0.0"),
    }
