from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from db.config import engine, Base
from routers import user_router

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.include_router(user_router.router)


@app.on_event("startup")
async def startup():
    # Only create db tables if they don't exist
    # No automatic user creation
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("Database tables created (if they didn't exist).")
    print("User microservice ready. No automatic users created.")
    print("Users will only be created through API requests.")
    print("CORS enabled for http://localhost:3000")
        

if __name__ == '__main__':
    uvicorn.run("app:app", port=9090, host='127.0.0.1', reload=True)