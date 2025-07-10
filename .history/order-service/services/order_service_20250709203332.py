# Replace these methods in your order_service.py

async def get_cart_items(self, user_id: int, token: str) -> List[Dict]:
    """Fetch cart items from cart service"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.cart_service_url}/cart/{user_id}",
                headers={
                    "Authorization": f"Bearer {token}"  # ADD AUTHENTICATION
                },
                timeout=10.0
            )
            if response.status_code == 200:
                cart_data = response.json()
                return cart_data.get("items", [])
            print(f"Cart service error: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        print(f"Error fetching cart items: {e}")
        return []

async def clear_cart(self, user_id: int, token: str) -> bool:
    """Clear user's cart after order creation"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{settings.cart_service_url}/cart/{user_id}",
                headers={
                    "Authorization": f"Bearer {token}"  # ADD AUTHENTICATION
                },
                timeout=10.0
            )
            return response.status_code == 200
    except Exception as e:
        print(f"Error clearing cart: {e}")
        return False

async def create_order(self, order_data: OrderCreate, user: User, token: str) -> Order:
    """Create a new order from cart items"""
    # 1. Get cart items WITH TOKEN
    cart_items = await self.get_cart_items(user.id, token)
    if not cart_items:
        raise ValueError("Cart is empty")
    
    # 2. Validate products and get details
    validated_items = []
    for cart_item in cart_items:
        # FIX: Use 'productId' instead of 'product_id'
        product_id = cart_item.get('productId') or cart_item.get('product_id')
        product = await self.get_product_details(product_id)
        if not product:
            raise ValueError(f"Product {product_id} not found")
        
        validated_items.append({
            'product_id': product_id,
            'product_name': product.get('title') or product.get('name', ''),  # Cart uses 'title'
            'product_sku': product.get('sku', ''),
            'product_image': product.get('image', ''),
            'unit_price': Decimal(str(cart_item['price'])),
            'quantity': cart_item['quantity'],
            'total_price': Decimal(str(cart_item['price'])) * cart_item['quantity'],
            'product_attributes': cart_item.get('attributes', '')
        })
    
    # 3. Calculate totals
    totals = self.calculate_order_totals(cart_items)
    
    # 4. Create order (same as before)
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
    
    # 6. Create order items
    for item_data in validated_items:
        order_item = OrderItem(
            order_id=order.id,
            **item_data
        )
        self.db.add(order_item)
    
    # 7. Create status history
    status_history = OrderStatusHistory(
        order_id=order.id,
        new_status=OrderStatus.PENDING,
        changed_by=user.id,
        reason="Order created"
    )
    self.db.add(status_history)
    
    # 8. Commit transaction
    await self.db.commit()
    
    # 9. Clear cart WITH TOKEN
    await self.clear_cart(user.id, token)
    
    # 10. Refresh order with relationships
    await self.db.refresh(order)
    return order