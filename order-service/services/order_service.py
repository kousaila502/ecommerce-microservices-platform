import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import selectinload
from models.order import Order, OrderItem, OrderStatusHistory, OrderStatus, PaymentStatus
from schemas.order_schemas import OrderCreate, OrderUpdate, OrderStats
from utils.auth import User
from typing import List, Optional, Dict
from decimal import Decimal
from datetime import datetime
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
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.cart_service_url}/cart/{user_id}",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=10.0
                )
                if response.status_code == 200:
                    cart_data = response.json()
                    return cart_data.get("items", [])
                return []
        except Exception:
            return []

    async def get_product_details(self, product_id: int, token: str) -> Optional[Dict]:
        """Fetch product details from product service"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{settings.product_service_url}/products/{product_id}",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=10.0
                )
                if response.status_code == 200:
                    response_data = response.json()
                    if response_data.get("success") and "data" in response_data:
                        return response_data["data"]
                    return response_data
                return None
        except Exception:
            return None

    async def clear_cart(self, user_id: int, token: str) -> bool:
        """Clear user's cart after order creation"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(
                    f"{settings.cart_service_url}/cart",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=10.0
                )
                return response.status_code in [200, 404]
        except Exception:
            return False

    async def update_product_stock(self, product_id: int, quantity: int, token: str) -> bool:
        """Decrease product stock after order"""
        try:
            async with httpx.AsyncClient() as client:
                # Get current stock
                get_response = await client.get(
                    f"{settings.product_service_url}/products/{product_id}",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=10.0
                )
                
                if get_response.status_code != 200:
                    return False
                
                product_data = get_response.json()
                if product_data.get("success") and "data" in product_data:
                    current_stock = product_data["data"].get("stock", 0)
                else:
                    current_stock = product_data.get("stock", 0)
                
                # Update stock
                new_stock = max(0, current_stock - quantity)
                response = await client.patch(
                    f"{settings.product_service_url}/products/{product_id}/stock",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    },
                    json={"stock": new_stock},
                    timeout=10.0
                )
                return response.status_code == 200
        except Exception:
            return False

    def calculate_order_totals(self, items: List[Dict]) -> Dict[str, Decimal]:
        """Calculate order totals"""
        subtotal = sum(Decimal(str(item['price'])) * item['quantity'] for item in items)
        tax_amount = subtotal * Decimal('0.10')  # 10% tax
        shipping_amount = Decimal('10.00') if subtotal < 100 else Decimal('0.00')
        discount_amount = Decimal('0.00')
        total_amount = subtotal + tax_amount + shipping_amount - discount_amount

        return {
            'subtotal': subtotal,
            'tax_amount': tax_amount,
            'shipping_amount': shipping_amount,
            'discount_amount': discount_amount,
            'total_amount': total_amount
        }

    async def create_order_simple(self, order_data: OrderCreate, user: User, token: str) -> Order:
        """Create a new order from cart - SIMPLIFIED VERSION"""
        # Get cart items
        cart_items = await self.get_cart_items(user.id, token)
        if not cart_items:
            raise ValueError("Cart is empty - cannot create order")

        # Use default shipping address if not provided
        if order_data.shipping_address is None:
            shipping_address = {
                "address": "123 Default Street",
                "city": "Default City",
                "state": "CA", 
                "postal_code": "90210",
                "country": "USA"
            }
        else:
            shipping_address = {
                "address": order_data.shipping_address.address,
                "city": order_data.shipping_address.city,
                "state": order_data.shipping_address.state,
                "postal_code": order_data.shipping_address.postal_code,
                "country": order_data.shipping_address.country
            }

        # Validate products and get details
        validated_items = []
        for cart_item in cart_items:
            product_id = cart_item.get('productId') or cart_item.get('product_id')
            if not product_id:
                raise ValueError("Invalid cart item: missing product ID")
            
            product = await self.get_product_details(product_id, token)
            if not product:
                raise ValueError(f"Product {product_id} not found or unavailable")

            validated_item = {
                'product_id': product_id,
                'product_name': product.get('title', ''),
                'product_sku': product.get('sku', ''),
                'product_image': product.get('image', ''),
                'unit_price': Decimal(str(cart_item['price'])),
                'quantity': cart_item['quantity'],
                'total_price': Decimal(str(cart_item['price'])) * cart_item['quantity'],
                'product_attributes': ''
            }
            validated_items.append(validated_item)

        # Calculate totals
        totals = self.calculate_order_totals(cart_items)

        # Create order
        order = Order(
            user_id=user.id,
            order_number=await self.generate_order_number(),
            status=OrderStatus.PENDING,
            payment_status=PaymentStatus.PENDING,
            subtotal=totals['subtotal'],
            tax_amount=totals['tax_amount'],
            shipping_amount=totals['shipping_amount'],
            discount_amount=totals['discount_amount'],
            total_amount=totals['total_amount'],
            shipping_address=shipping_address["address"],
            shipping_city=shipping_address["city"],
            shipping_state=shipping_address["state"],
            shipping_postal_code=shipping_address["postal_code"],
            shipping_country=shipping_address["country"],
            customer_email=user.email,
            customer_phone=order_data.customer_phone or "+1-555-0000",
            notes=order_data.notes or f"Auto-generated order for {user.email}",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        # Save order
        self.db.add(order)
        await self.db.flush()

        # Create order items
        for item_data in validated_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data['product_id'],
                product_name=item_data['product_name'],
                product_sku=item_data['product_sku'],
                product_image=item_data['product_image'],
                unit_price=item_data['unit_price'],
                quantity=item_data['quantity'],
                total_price=item_data['total_price'],
                product_attributes=item_data['product_attributes']
            )
            self.db.add(order_item)

        # Update product stock
        for item_data in validated_items:
            await self.update_product_stock(
                item_data['product_id'], 
                item_data['quantity'], 
                token
            )

        # Commit to database
        await self.db.commit()

        # Clear cart
        await self.clear_cart(user.id, token)

        # Reload order with items
        result = await self.db.execute(
            select(Order).options(selectinload(Order.order_items)).where(Order.id == order.id)
        )
        return result.scalar_one()

    async def get_order_by_id(self, order_id: int, user: User) -> Optional[Order]:
        """Get order by ID with authorization check"""
        query = select(Order).options(selectinload(Order.order_items)).where(Order.id == order_id)
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

        if not user.is_admin:
            raise ValueError("Only administrators can update order status")

        old_status = order.status

        # Update fields
        if update_data.status:
            order.status = update_data.status
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
        
        result = await self.db.execute(
            select(Order).options(selectinload(Order.order_items)).where(Order.id == order.id)
        )
        return result.scalar_one()

    async def get_order_stats(self) -> OrderStats:
        """Get order statistics for admin dashboard"""
        total_orders = await self.db.scalar(select(func.count(Order.id))) or 0
        pending_orders = await self.db.scalar(select(func.count(Order.id)).where(Order.status == OrderStatus.PENDING)) or 0
        confirmed_orders = await self.db.scalar(select(func.count(Order.id)).where(Order.status == OrderStatus.CONFIRMED)) or 0
        processing_orders = await self.db.scalar(select(func.count(Order.id)).where(Order.status == OrderStatus.PROCESSING)) or 0
        shipped_orders = await self.db.scalar(select(func.count(Order.id)).where(Order.status == OrderStatus.SHIPPED)) or 0
        delivered_orders = await self.db.scalar(select(func.count(Order.id)).where(Order.status == OrderStatus.DELIVERED)) or 0
        cancelled_orders = await self.db.scalar(select(func.count(Order.id)).where(Order.status == OrderStatus.CANCELLED)) or 0

        total_revenue = await self.db.scalar(
            select(func.sum(Order.total_amount)).where(Order.status.in_([OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED]))
        ) or Decimal('0.00')

        today = datetime.now().date()
        orders_today = await self.db.scalar(
            select(func.count(Order.id)).where(func.date(Order.created_at) == today)
        ) or 0

        month_start = datetime.now().replace(day=1).date()
        orders_this_month = await self.db.scalar(
            select(func.count(Order.id)).where(func.date(Order.created_at) >= month_start)
        ) or 0

        return OrderStats(
            total_orders=total_orders,
            pending_orders=pending_orders,
            confirmed_orders=confirmed_orders,
            processing_orders=processing_orders,
            shipped_orders=shipped_orders,
            delivered_orders=delivered_orders,
            cancelled_orders=cancelled_orders,
            total_revenue=total_revenue,
            orders_today=orders_today,
            orders_this_month=orders_this_month
        )