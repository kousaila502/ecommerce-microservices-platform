import asyncio
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import create_tables, drop_tables, check_connection
from models.order import Order, OrderItem, OrderStatusHistory

async def main():
    print("🚀 Order Service Database Migration")
    print("=" * 40)
    
    # Check connection
    if not await check_connection():
        print("❌ Database connection failed")
        return
    
    # Create tables
    await create_tables()
    print("✅ Order tables created successfully!")

if __name__ == "__main__":
    asyncio.run(main())