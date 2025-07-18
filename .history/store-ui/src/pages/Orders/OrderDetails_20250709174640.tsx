// src/pages/Orders/OrderDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderById } from '../../api/order';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box, Typography, CircularProgress, Alert, Paper, Divider, Grid
} from '@mui/material';

const OrderDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderById(id!, token!);
        setOrder(response.data);
      } catch (err) {
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  if (loading) return <Box p={2}><CircularProgress /></Box>;
  if (error) return <Box p={2}><Alert severity="error">{error}</Alert></Box>;
  if (!order) return <Box p={2}><Typography>No order found.</Typography></Box>;

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>Order #{order.order_number}</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography>Status: {order.status}</Typography>
        <Typography>Total: ${order.total_amount}</Typography>
        <Typography>Created: {new Date(order.created_at).toLocaleString()}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Shipping Address:</Typography>
        <Typography>{order.shipping_address}</Typography>
        <Typography>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</Typography>
        <Typography>{order.shipping_country}</Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Items:</Typography>
        {order.order_items.map((item: any, idx: number) => (
          <Box key={idx} sx={{ mb: 2 }}>
            <Grid container justifyContent="space-between">
              <Grid item xs={6}>
                <Typography>{item.product_name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Qty: {item.quantity} x ${item.unit_price} = ${item.total_price}</Typography>
              </Grid>
            </Grid>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

export default OrderDetails;
