import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getCart, Cart as CartType, CartItem, clearCart } from "../../api/cart";
import { createOrder } from "../../api/order";
import { useAuth } from "../../contexts/AuthContext";

import {
  Paper, Box, Grid, Typography, Alert, CircularProgress, Divider,
  Button, IconButton, TextField
} from '@mui/material';
import {
  Paid as PaidIcon,
  RemoveCircle as RemoveCircleIcon,
  AddCircle as AddCircleIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const Cart = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [itemQuantities, setItemQuantities] = useState<{ [key: number]: number }>({});

  const updateItemQuantity = (index: number, newQty: number) => {
    if (newQty > 0) {
      setItemQuantities(prev => ({ ...prev, [index]: newQty }));
    }
  };

  const handleQuantityChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) updateItemQuantity(index, value);
  };

  const handleIncrement = (index: number) => {
    updateItemQuantity(index, (itemQuantities[index] || cart!.items[index].quantity) + 1);
  };

  const handleDecrement = (index: number) => {
    const current = itemQuantities[index] || cart!.items[index].quantity;
    if (current > 1) updateItemQuantity(index, current - 1);
  };

  const handleRemoveItem = (index: number) => {
    // Optional: Implement actual removal via DELETE API
    alert("Item removal is not yet implemented.");
  };

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item, idx) => {
      const qty = itemQuantities[idx] || item.quantity;
      return total + (item.price * qty);
    }, 0);
  };

  const handleCheckout = async () => {
    if (!token || !user?.id || !cart) {
      alert("Please log in to proceed with checkout.");
      return;
    }

    const total = calculateTotal();

    const orderPayload = {
      userId: user.id,
      items: cart.items.map((item, idx) => ({
        productId: item.productId,
        sku: item.sku,
        title: item.title,
        quantity: itemQuantities[idx] || item.quantity,
        price: item.price,
        currency: item.currency
      })),
      total,
      currency: cart.items[0]?.currency || 'USD'
    };

    try {
      setCheckoutLoading(true);
      const order = await createOrder(orderPayload, token);
      if (order) {
        await clearCart(user.id, token);
        alert("Order placed successfully!");
        navigate('/orders'); // Make sure /orders page exists
      } else {
        alert("Failed to place order.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("An error occurred during checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        const cartData = await getCart();
        if (cartData) {
          setCart(cartData);
          const qtys: { [key: number]: number } = {};
          cartData.items.forEach((item, index) => {
            qtys[index] = item.quantity;
          });
          setItemQuantities(qtys);
        } else {
          setError("Cart is empty or failed to load.");
        }
      } catch (err) {
        setError("Failed to load cart.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 2 }}><Alert severity="error">{error}</Alert></Box>;

  if (!cart || cart.items.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">Your cart is empty</Typography>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Continue Shopping
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>Shopping Cart</Typography>

        {cart.items.map((item: CartItem, index: number) => (
          <Box key={index}>
            <Grid container spacing={2} alignItems="center" sx={{ py: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">SKU: {item.sku}</Typography>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size="small" onClick={() => handleDecrement(index)} disabled={(itemQuantities[index] || 1) <= 1}>
                    <RemoveCircleIcon />
                  </IconButton>
                  <TextField
                size="small"
                type="number"
                value={itemQuantities[index] || item.quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQuantityChange(index, e)}
                inputProps={{ min: 1 }}
                sx={{ width: '80px' }}
                />
                  <IconButton size="small" onClick={() => handleIncrement(index)}>
                    <AddCircleIcon />
                  </IconButton>
                </Box>
              </Grid>

              <Grid item xs={4} sm={2}>
                <Typography variant="h6">{item.currency} {item.price.toFixed(2)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: {item.currency} {(item.price * (itemQuantities[index] || item.quantity)).toFixed(2)}
                </Typography>
              </Grid>

              <Grid item xs={2} sm={1}>
                <IconButton color="error" onClick={() => handleRemoveItem(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
            {index < cart.items.length - 1 && <Divider />}
          </Box>
        ))}

        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h6">Total: ${calculateTotal().toFixed(2)}</Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/')}>Continue Shopping</Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PaidIcon />}
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? 'Processing...' : 'Checkout'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default Cart;
