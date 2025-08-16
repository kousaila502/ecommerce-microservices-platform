import os
import time
from fastapi import APIRouter

router = APIRouter(prefix="/status", tags=["Status"])

# Service start time to calculate uptime
START_TIME = time.time()

@router.get("")
async def health_check():
    uptime = round(time.time() - START_TIME, 2)

    return {
        "status": "ok",
        "service": "order-service",
        "uptime_seconds": uptime,
        "environment": os.getenv("ENV", "development"),
        "version": os.getenv("APP_VERSION", "1.0.0"),
    }
