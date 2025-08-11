import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from models.order import OrderStatus, PaymentStatus

# Address schemas
class AddressBase(BaseModel):
    address: str = Field(..., min_length=5, max_length=500)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    postal_code: str = Field(..., min_length=3, max_length=20)
    country: str = Field(..., min_length=2, max_length=100)

class ShippingAddress(AddressBase):
    pass

class BillingAddress(AddressBase):
    pass

# UPDATED: Simplified Order Creation Schema
class OrderCreate(BaseModel):
    """Simplified order creation - most data comes from user profile and cart"""
    # Optional override addresses (if not provided, use defaults)
    shipping_address: Optional[ShippingAddress] = None
    billing_address: Optional[BillingAddress] = None
    
    # Optional fields
    customer_phone: Optional[str] = None
    notes: Optional[str] = None
    
    # All other data comes automatically from:
    # - customer_email: JWT token
    # - items: current cart
    # - customer info: user service

# LEGACY: Keep old schema for backward compatibility
class OrderCreateLegacy(BaseModel):
    shipping_address: ShippingAddress
    billing_address: Optional[BillingAddress] = None
    customer_email: EmailStr
    customer_phone: Optional[str] = None
    notes: Optional[str] = None

# Order item schemas
class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_sku: Optional[str] = None
    product_image: Optional[str] = None
    unit_price: Decimal
    quantity: int
    total_price: Decimal
    product_attributes: Optional[str] = None

    class Config:
        from_attributes = True

# Order response schema
class OrderResponse(BaseModel):
    id: int
    user_id: int
    order_number: str
    status: OrderStatus
    payment_status: PaymentStatus
    
    # Financial details
    subtotal: Decimal
    tax_amount: Decimal
    shipping_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    
    # Shipping details
    shipping_address: str
    shipping_city: str
    shipping_state: str
    shipping_postal_code: str
    shipping_country: str
    
    # Contact details
    customer_email: str
    customer_phone: Optional[str] = None
    
    # Order tracking
    notes: Optional[str] = None
    tracking_number: Optional[str] = None
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    
    # Order items
    order_items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

# Order summary for lists
class OrderSummary(BaseModel):
    id: int
    user_id: int
    order_number: str
    status: OrderStatus
    payment_status: PaymentStatus
    total_amount: Decimal
    created_at: datetime

    class Config:
        from_attributes = True

# Order update schema
class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    tracking_number: Optional[str] = None
    notes: Optional[str] = None

# Order statistics for admin
class OrderStats(BaseModel):
    total_orders: int
    pending_orders: int
    confirmed_orders: int
    processing_orders: int
    shipped_orders: int
    delivered_orders: int
    cancelled_orders: int
    total_revenue: Decimal
    orders_today: int
    orders_this_month: int

# Error response schema
class ErrorResponse(BaseModel):
    error: str
    message: str
    status_code: int
    timestamp: datetime

# Order status history schema
class OrderStatusHistory(BaseModel):
    status: OrderStatus
    changed_at: datetime
    changed_by: str