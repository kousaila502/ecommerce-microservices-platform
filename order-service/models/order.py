import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.connection import Base
from enum import Enum
from decimal import Decimal

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    
    # Order details
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    status = Column(String(20), default=OrderStatus.PENDING, nullable=False)
    payment_status = Column(String(20), default=PaymentStatus.PENDING, nullable=False)
    
    # Financial details
    subtotal = Column(DECIMAL(10, 2), nullable=False)
    tax_amount = Column(DECIMAL(10, 2), default=0.00)
    shipping_amount = Column(DECIMAL(10, 2), default=0.00)
    discount_amount = Column(DECIMAL(10, 2), default=0.00)
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    
    # Shipping details
    shipping_address = Column(Text, nullable=False)
    shipping_city = Column(String(100), nullable=False)
    shipping_state = Column(String(100), nullable=False)
    shipping_postal_code = Column(String(20), nullable=False)
    shipping_country = Column(String(100), nullable=False)
    
    # Billing details
    billing_address = Column(Text)
    billing_city = Column(String(100))
    billing_state = Column(String(100))
    billing_postal_code = Column(String(20))
    billing_country = Column(String(100))
    
    # Contact details
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(20))
    
    # Order tracking
    notes = Column(Text)
    tracking_number = Column(String(100))
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    confirmed_at = Column(DateTime)
    shipped_at = Column(DateTime)
    delivered_at = Column(DateTime)
    cancelled_at = Column(DateTime)
    
    # Relationships
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    
    # Product details
    product_id = Column(Integer, nullable=False)
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100))
    product_image = Column(String(500))
    
    # Pricing details
    unit_price = Column(DECIMAL(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    total_price = Column(DECIMAL(10, 2), nullable=False)
    
    # Product attributes
    product_attributes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    order = relationship("Order", back_populates="order_items")

class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    
    # Status change details
    old_status = Column(String(20))
    new_status = Column(String(20), nullable=False)
    changed_by = Column(Integer)
    reason = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)