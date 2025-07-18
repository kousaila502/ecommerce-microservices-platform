import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, desc
from sqlalchemy.orm import selectinload
from models.order import Order, OrderItem, OrderStatusHistory, OrderStatus, PaymentStatus
from schemas.order_schemas import OrderCreate, OrderUpdate, OrderStats
from utils.auth import User
from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import datetime, timedelta
import httpx
import uuid
from config.settings import settings

class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_order_number(self) -> str:
        """Generate unique order number"""
        date_str = datetime.now().strftime("%Y%m%d")
        random_part = str(uuid.uuid4())[:8].upper()
        return f"ORD-{date_str}-{random_part}"

    async def get_cart_items(self, user_id: int, token: str) -> List[Dict]:
        """Fetch cart items from cart service"""
        try:
            print(f"🛒 Fetching cart items for user {user_id}")
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.cart_service_url}/cart/{user_id}",
                    headers={
                        "Authorization": f"Bearer {token}"
                    },
                    timeout=10.0
                )
                if response.status_code == 200:
                    cart_data = response.json()
                    items = cart_data.get("items", [])
                    print(f"✅ Found {len(items)} items in cart")
                    return items
                else:
                    print(f"❌ Cart service error: {response.status_code} - {response.text}")
                    return []
        except Exception as e:
            print(f"❌ Error fetching cart items: {e}")
            return []

    async def get_product_details(self, product_id: int, token: str) -> Optional[Dict]:
        """Fetch product details from NEW simplified product service"""
        try:
            print(f"📦 Fetching product details for product {product_id}")
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.product_service_url}/products/{product_id}",
                    headers={
                        "Authorization": f"Bearer {token}"
                    },
                    timeout=10.0
                )
                if response.status_code == 200:
                    response_data = response.json()
                    print(f"📦 Product service response: {response_data}")
                    
                    # UPDATED: Handle new Product Service response format
                    if response_data.get("success") and "data" in response_data:
                        product = response_data["data"]
                        print(f"✅ Product found: {product.get('title', 'Unknown')}")
                        return product
                    else:
                        # Fallback for direct product object (in case format changes)
                        print(f"⚠️  Using fallback product format")
                        return response_data
                else:
                    print(f"❌ Product service error: {response.status_code} - {response.text}")
                    return None
        except Exception as e:
            print(f"❌ Error fetching product details: {e}")
            return None

    async def clear_cart(self, user_id: int, token: str) -> bool:
        """Clear user's cart after order creation"""
        try:
            print(f"🧹 Clearing cart for user {user_id}")
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{settings.cart_service_url}/cart/{user_id}",
                    headers={
                        "Authorization": f"Bearer {token}"
                    },
                    timeout=10.0
                )
                if response.status_code == 200:
                    print("✅ Cart cleared successfully")
                    return True
                else:
                    print(f"❌ Failed to clear cart: {response.status_code}")
                    return False
        except Exception as e:
            print(f"❌ Error clearing cart: {e}")
            return False

    def calculate_order_totals(self, items: List[Dict]) -> Dict[str, Decimal]:
        """Calculate order totals (subtotal, tax, shipping, etc.)"""
        print(f"💰 Calculating totals for {len(items)} items")
        
        subtotal = sum(Decimal(str(item['price'])) * item['quantity'] for item in items)
        print(f"💰 Subtotal: ${subtotal}")

        # Simple tax calculation (10% for demo)
        tax_rate = Decimal('0.10')
        tax_amount = subtotal * tax_rate

        # Simple shipping calculation
        shipping_amount = Decimal('10.00') if subtotal < 100 else Decimal('0.00')

        # No discount for now
        discount_amount = Decimal('0.00')

        # Total calculation
        total_amount = subtotal + tax_amount + shipping_amount - discount_amount

        print(f"💰 Tax: ${tax_amount}, Shipping: ${shipping_amount}, Total: ${total_amount}")

        return {
            'subtotal': subtotal,
            'tax_amount': tax_amount,
            'shipping_amount': shipping_amount,
            'discount_amount': discount_amount,
            'total_amount': total_amount
        }

    async def create_order(self, order_data: OrderCreate, user: User, token: str) -> Order:
        """Create a new order from cart items"""
        print(f"🚀 Creating order for user {user.id}")
        
        # 1. Get cart items WITH TOKEN
        cart_items = await self.get_cart_items(user.id, token)
        if not cart_items:
            raise ValueError("Cart is empty")

        print(f"🛒 Processing {len(cart_items)} cart items")

        # 2. Validate products and get details
        validated_items = []
        for i, cart_item in enumerate(cart_items):
            print(f"📦 Processing cart item {i+1}: {cart_item}")
            
            # Handle both 'productId' (from Cart Service) and 'product_id' (fallback)
            product_id = cart_item.get('productId') or cart_item.get('product_id')
            if not product_id:
                print(f"❌ No product ID found in cart item: {cart_item}")
                raise ValueError(f"Invalid cart item: missing product ID")
            
            # Get product details from NEW Product Service
            product = await self.get_product_details(product_id, token)
            if not product:
                print(f"❌ Product {product_id} not found")
                raise ValueError(f"Product {product_id} not found or unavailable")

            # UPDATED: Extract fields from new simplified product structure
            validated_item = {
                'product_id': product_id,
                'product_name': product.get('title', ''),  # Use 'title' from new structure
                'product_sku': product.get('sku', ''),     # Direct 'sku' field
                'product_image': product.get('image', ''), # Direct 'image' field
                'unit_price': Decimal(str(cart_item['price'])),
                'quantity': cart_item['quantity'],
                'total_price': Decimal(str(cart_item['price'])) * cart_item['quantity'],
                'product_attributes': ''  # Simplified - no complex attributes
            }
            
            print(f"✅ Validated item: {validated_item['product_name']} x{validated_item['quantity']}")
            validated_items.append(validated_item)

        # 3. Calculate totals
        totals = self.calculate_order_totals(cart_items)

        # 4. Create order
        print("📝 Creating order record...")
        order = Order(
            user_id=user.id,
            order_number=await self.generate_order_number(),
            status=OrderStatus.PENDING,
            payment_status=PaymentStatus.PENDING,

            # Financial details
            subtotal=totals['subtotal'],
            tax_amount=totals['tax_amount'],
            shipping_amount=totals['shipping_amount'],
            discount_amount=totals['discount_amount'],
            total_amount=totals['total_amount'],

            # Shipping details
            shipping_address=order_data.shipping_address.address,
            shipping_city=order_data.shipping_address.city,
            shipping_state=order_data.shipping_address.state,
            shipping_postal_code=order_data.shipping_address.postal_code,
            shipping_country=order_data.shipping_address.country,

            # Billing details (use shipping if not provided)
            billing_address=order_data.billing_address.address if order_data.billing_address else order_data.shipping_address.address,
            billing_city=order_data.billing_address.city if order_data.billing_address else order_data.shipping_address.city,
            billing_state=order_data.billing_address.state if order_data.billing_address else order_data.shipping_address.state,
            billing_postal_code=order_data.billing_address.postal_code if order_data.billing_address else order_data.shipping_address.postal_code,
            billing_country=order_data.billing_address.country if order_data.billing_address else order_data.shipping_address.country,

            # Contact details
            customer_email=order_data.customer_email,
            customer_phone=order_data.customer_phone,
            notes=order_data.notes
        )

        # 5. Add to database
        self.db.add(order)
        await self.db.flush()  # Get order ID
        print(f"📝 Order created with ID: {order.id} and number: {order.order_number}")

        # 6. Create order items
        print("📦 Creating order items...")
        for item_data in validated_items:
            order_item = OrderItem(
                order_id=order.id,
                **item_data
            )
            self.db.add(order_item)
            print(f"📦 Added item: {item_data['product_name']}")

        # 7. Create status history
        status_history = OrderStatusHistory(
            order_id=order.id,
            new_status=OrderStatus.PENDING,
            changed_by=user.id,
            reason="Order created"
        )
        self.db.add(status_history)

        # 8. Commit transaction
        print("💾 Committing order to database...")
        await self.db.commit()

        # 9. Clear cart WITH TOKEN
        cart_cleared = await self.clear_cart(user.id, token)
        if not cart_cleared:
            print("⚠️  Warning: Failed to clear cart after order creation")

        # 10. Refresh order with relationships
        print("🔄 Loading order with items...")
        result = await self.db.execute(
            select(Order)
            .options(selectinload(Order.order_items))
            .where(Order.id == order.id)
        )
        order_with_items = result.scalar_one()
        
        print(f"✅ Order created successfully: {order_with_items.order_number}")
        print(f"📊 Total: ${order_with_items.total_amount}")
        print(f"📦 Items: {len(order_with_items.order_items)}")
        
        return order_with_items
    
    async def get_order_by_id(self, order_id: int, user: User) -> Optional[Order]:
        """Get order by ID (with authorization check)"""
        query = select(Order).options(selectinload(Order.order_items)).where(Order.id == order_id)

        # Non-admin users can only see their own orders
        if not user.is_admin:
            query = query.where(Order.user_id == user.id)

        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def get_user_orders(self, user_id: int, page: int = 1, size: int = 10) -> List[Order]:
        """Get orders for a specific user"""
        offset = (page - 1) * size
        query = select(Order).where(Order.user_id == user_id).order_by(desc(Order.created_at)).offset(offset).limit(size)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def update_order_status(self, order_id: int, update_data: OrderUpdate, user: User) -> Optional[Order]:
        """Update order status"""
        order = await self.get_order_by_id(order_id, user)
        if not order:
            return None

        # Only admins can update order status
        if not user.is_admin:
            raise ValueError("Only administrators can update order status")

        old_status = order.status

        # Update fields
        if update_data.status:
            order.status = update_data.status
            # Update timestamp based on status
            if update_data.status == OrderStatus.CONFIRMED:
                order.confirmed_at = datetime.utcnow()
            elif update_data.status == OrderStatus.SHIPPED:
                order.shipped_at = datetime.utcnow()
            elif update_data.status == OrderStatus.DELIVERED:
                order.delivered_at = datetime.utcnow()
            elif update_data.status == OrderStatus.CANCELLED:
                order.cancelled_at = datetime.utcnow()

        if update_data.payment_status:
            order.payment_status = update_data.payment_status

        if update_data.tracking_number:
            order.tracking_number = update_data.tracking_number

        if update_data.notes:
            order.notes = update_data.notes

        # Create status history
        if update_data.status and update_data.status != old_status:
            status_history = OrderStatusHistory(
                order_id=order.id,
                old_status=old_status,
                new_status=update_data.status,
                changed_by=user.id,
                reason=f"Status updated by {user.name}"
            )
            self.db.add(status_history)

        await self.db.commit()
        # Reload the order WITH order_items eagerly loaded
        result = await self.db.execute(
            select(Order)
            .options(selectinload(Order.order_items))
            .where(Order.id == order.id)
        )
        order_with_items = result.scalar_one()
        return order_with_items

    async def get_order_stats(self) -> OrderStats:
        """Get order statistics for admin dashboard"""
        # Count orders by status
        total_orders = await self.db.scalar(select(func.count(Order.id)))
        pending_orders = await self.db.scalar(select(func.count(Order.id)).where(Order.status == OrderStatus.PENDING))
        confirmed_orders = await self.db.scalar(select(func.count(Order.id)).where(Order.status == OrderStatus.CONFIRMED))
        processing_orders = await self.db.scalar(select(func.count(Order.id)).where(Order.status == OrderStatus.PROCESSING))
        shipped_orders = await self.db.scalar(select(func.count(Order.id)).where(Order.status == OrderStatus.SHIPPED))
        delivered_orders = await self.db.scalar(select(func.count(Order.id)).where(Order.status == OrderStatus.DELIVERED))
        cancelled_orders = await self.db.scalar(select(func.count(Order.id)).where(Order.status == OrderStatus.CANCELLED))

        # Calculate total revenue
        total_revenue = await self.db.scalar(
            select(func.sum(Order.total_amount)).where(Order.status.in_([OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED]))
        ) or Decimal('0.00')

        # Orders today
        today = datetime.now().date()
        orders_today = await self.db.scalar(
            select(func.count(Order.id)).where(func.date(Order.created_at) == today)
        )

        # Orders this month
        month_start = datetime.now().replace(day=1).date()
        orders_this_month = await self.db.scalar(
            select(func.count(Order.id)).where(func.date(Order.created_at) >= month_start)
        )

        return OrderStats(
            total_orders=total_orders or 0,
            pending_orders=pending_orders or 0,
            confirmed_orders=confirmed_orders or 0,
            processing_orders=processing_orders or 0,
            shipped_orders=shipped_orders or 0,
            delivered_orders=delivered_orders or 0,
            cancelled_orders=cancelled_orders or 0,
            total_revenue=total_revenue,
            orders_today=orders_today or 0,
            orders_this_month=orders_this_month or 0
        )