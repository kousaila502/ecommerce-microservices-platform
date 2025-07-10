// src/pages/Orders/OrdersPage.tsx (ENHANCED VERSION)
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserOrders, Order } from '../../api/order';
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  Paper,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Container,
  Fade,
  Slide,
  Avatar,
  Divider,
  Button,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  HourglassBottom as PendingIcon,
  Refresh as RefreshIcon,
  ShoppingBag as EmptyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [token]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    if (!token) return;

    setLoading(true);
    setError('');
    try {
      const response = await getUserOrders(token);
      if (response) {
        setOrders(response);
      } else {
        setError("No orders found.");
      }
    } catch (err) {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return <CompletedIcon color="success" />;
      case 'shipped':
      case 'processing':
        return <ShippingIcon color="info" />;
      case 'cancelled':
        return <CancelledIcon color="error" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'success';
      case 'shipped':
      case 'processing':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          onClick={fetchOrders}
          startIcon={<RefreshIcon />}
        >
          Try Again
        </Button>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in timeout={800}>
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <EmptyIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No Orders Yet
            </Typography>
            <Typography variant="body1" color="text.disabled" sx={{ mb: 3 }}>
              You haven't placed any orders yet. Start shopping to see your orders here!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              size="large"
            >
              Start Shopping
            </Button>
          </Paper>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ReceiptIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">
              Your Orders
            </Typography>
            <Chip
              label={`${orders.length} total`}
              color="primary"
              sx={{ ml: 2 }}
            />
          </Box>

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by order number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  label="Filter by Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FilterIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="all">All Orders</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="delivered">Delivered</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <IconButton
                  onClick={fetchOrders}
                  color="primary"
                  sx={{
                    border: 1,
                    borderColor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.light' }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>

          {/* Results Summary */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {filteredOrders.length} of {orders.length} orders
          </Typography>

          {/* Orders List */}
          <Grid container spacing={2}>
            {filteredOrders.map((order, index) => (
              <Grid item xs={12} key={order.id}>
                <Slide direction="up" in timeout={400 + index * 100}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardActionArea onClick={() => navigate(`/orders/${order.id}`)}>
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3} alignItems="center">
                          {/* Order Icon */}
                          <Grid item xs={12} sm={1}>
                            <Avatar sx={{ bgcolor: 'primary.light' }}>
                              {getStatusIcon(order.status)}
                            </Avatar>
                          </Grid>

                          {/* Order Info */}
                          <Grid item xs={12} sm={5}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              Order #{order.order_number}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Placed on {formatDate(order.created_at)}
                            </Typography>
                          </Grid>

                          {/* Status */}
                          <Grid item xs={12} sm={2}>
                            <Chip
                              label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              color={getStatusColor(order.status)}
                              size="small"
                              sx={{ fontWeight: 'medium' }}
                            />
                          </Grid>

                          {/* Payment */}
                          <Grid item xs={12} sm={2}>
                            <Typography variant="body2" color="text.secondary">
                              Payment
                            </Typography>
                            <Chip
                              label={order.payment_status}
                              color={order.payment_status === 'paid' ? 'success' : 'warning'}
                              variant="outlined"
                              size="small"
                            />
                          </Grid>

                          {/* Total */}
                          <Grid item xs={12} sm={2}>
                            <Typography variant="body2" color="text.secondary">
                              Total
                            </Typography>
                            <Typography variant="h6" color="primary.main" fontWeight="bold">
                              ${order.total_amount}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Slide>
              </Grid>
            ))}
          </Grid>

          {/* No Results */}
          {filteredOrders.length === 0 && orders.length > 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No orders match your search
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Try adjusting your search terms or filters
              </Typography>
            </Paper>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default OrdersPage;