// src/pages/Orders/OrdersPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserOrders } from '../../api/order';
import {
  Box, CircularProgress, Typography, Alert, Paper, List, ListItem,
  ListItemText, ListItemButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getUserOrders(token!);
        setOrders(response.data);
      } catch (err) {
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (loading) return <Box p={2}><CircularProgress /></Box>;
  if (error) return <Box p={2}><Alert severity="error">{error}</Alert></Box>;
  if (orders.length === 0) return <Box p={2}><Typography>No orders found.</Typography></Box>;

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>Your Orders</Typography>
      <Paper>
        <List>
          {orders.map(order => (
            <ListItem key={order.id} disablePadding>
              <ListItemButton onClick={() => navigate(`/orders/${order.id}`)}>
                <ListItemText
                  primary={`Order #${order.order_number}`}
                  secondary={`Status: ${order.status} | Total: $${order.total_amount} | Created: ${new Date(order.created_at).toLocaleString()}`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default OrdersPage;
