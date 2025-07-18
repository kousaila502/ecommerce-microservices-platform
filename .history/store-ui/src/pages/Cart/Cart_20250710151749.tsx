import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {
  getCart, updateCartItemQuantity, removeFromCart, clearCart,
  Cart as CartType, CartItem
} from "../../api/cart";
import { createOrder, CreateOrderPayload } from "../../api/order";
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

  const fetchCartData = async () => {
    if (!user || !token) return;
    try {
      setLoading(true);
      const cartData = await getCart(user.id, token);
      if (cartData) {
        setCart(cartData);
      } else {
        setError("Your cart is empty.");
      }
    } catch {
      setError("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId: number, newQty: number) => {
    if (!user || !token || newQty <= 0) return;
    await updateCartItemQuantity(user.id, productId, newQty, token);
    fetchCartData(); // Reload cart
  };

  const handleRemoveItem = async (productId: number) => {
    if (!user || !token) return;
    await removeFromCart(user.id, productId, token);
    fetchCartData(); // Reload cart
  };

  const calculateTotal = () => {
    return cart?.items.reduce((total, item) => total + item.price * item.quantity, 0) || 0;
  };

  const handleCheckout = async () => {
    if (!user || !token || !cart || cart.items.length === 0) return;

    const orderPayload: CreateOrderPayload = {
      customer_email: user.email,
      shipping_address: {
        address: "123 Main St",
        city: "City",
        country: "Country",
        postal_code: "00000",
        state: "State",
      },
    };

    try {
      setCheckoutLoading(true);
      const order = await createOrder(orderPayload, token);
      if (order) {
        await clearCart(user.id, token);
        alert("Order placed successfully!");
        navigate('/orders');
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

        {cart.items.map((item: CartItem) => (
          <Box key={item.productId}>
            <Grid container spacing={2} alignItems="center" sx={{ py: 2 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">SKU: {item.sku}</Typography>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size="small" onClick={() => handleQuantityChange(item.productId, item.quantity - 1)} disabled={item.quantity <= 1}>
                    <RemoveCircleIcon />
                  </IconButton>
                  <TextField
                    size="small"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                    inputProps={{ min: 1 }}
                    sx={{ width: '80px' }}
                  />
                  <IconButton size="small" onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}>
                    <AddCircleIcon />
                  </IconButton>
                </Box>
              </Grid>

              <Grid item xs={4} sm={2}>
                <Typography variant="h6">{item.currency} {item.price.toFixed(2)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: {item.currency} {(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Grid>

              <Grid item xs={2} sm={1}>
                <IconButton color="error" onClick={() => handleRemoveItem(item.productId)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
            <Divider />
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
