// src/pages/Orders/OrderDetails.tsx (UPDATED FOR NEW MODEL)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, Order } from '../../api/order';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Container,
  Fade,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  HourglassBottom as PendingIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id || isNaN(Number(id)) || !token) {
        setError("Invalid order ID or unauthorized.");
        setLoading(false);
        return;
      }

      try {
        const result = await getOrderById(parseInt(id), token);
        if (result) {
          setOrder(result);
        } else {
          setError("Order not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status?.toLowerCase()) {
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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
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

  const getOrderSteps = (status: string) => {
    const steps = [
      { label: 'Order Placed', status: 'pending' },
      { label: 'Confirmed', status: 'confirmed' },
      { label: 'Processing', status: 'processing' },
      { label: 'Shipped', status: 'shipped' },
      { label: 'Delivered', status: 'delivered' },
    ];

    const currentStepIndex = steps.findIndex(step => step.status === status?.toLowerCase());
    return { steps, currentStepIndex };
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // ✅ FIXED: Add safety check for order_items
  const calculateSubtotal = () => {
    if (!order?.order_items || !Array.isArray(order.order_items)) return 0;
    return order.order_items.reduce((sum, item) => {
      const price = typeof item.total_price === 'string' 
        ? parseFloat(item.total_price) 
        : item.total_price;
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  };

  // ✅ Helper function to safely parse amounts
  const parseAmount = (amount: string | number | undefined): number => {
    if (!amount) return 0;
    const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(parsed) ? 0 : parsed;
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
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/orders')}
          startIcon={<ArrowBackIcon />}
        >
          Back to Orders
        </Button>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>No order found.</Typography>
        <Button
          variant="outlined"
          onClick={() => navigate('/orders')}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Container>
    );
  }

  const { steps, currentStepIndex } = getOrderSteps(order.status);
  const subtotal = parseAmount(order.subtotal); // ✅ Use actual subtotal from API

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => navigate('/orders')}
                sx={{ mr: 2 }}
              >
                <ArrowBackIcon />
              </IconButton>
              <ReceiptIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Order #{order.order_number}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Placed on {formatDate(order.created_at)}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="primary">
                <PrintIcon />
              </IconButton>
              <IconButton color="primary">
                <DownloadIcon />
              </IconButton>
              <IconButton color="primary">
                <EmailIcon />
              </IconButton>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Order Status */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Order Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(order.status)}
                    <Chip
                      label={order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      color={getStatusColor(order.status)}
                      sx={{ fontWeight: 'medium' }}
                    />
                  </Box>
                </Box>

                <Stepper activeStep={currentStepIndex} orientation="horizontal" alternativeLabel>
                  {steps.map((step, index) => (
                    <Step key={step.label} completed={index <= currentStepIndex}>
                      <StepLabel>{step.label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* ✅ ADD: Tracking Number if available */}
                {order.tracking_number && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="body2" color="info.dark">
                      <strong>Tracking Number:</strong> {order.tracking_number}
                    </Typography>
                  </Box>
                )}

                {/* ✅ ADD: Notes if available */}
                {order.notes && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Notes:</strong> {order.notes}
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* Order Items */}
              <Paper sx={{ borderRadius: 2 }}>
                <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight="bold">
                    Order Items ({order.order_items?.length || 0})
                  </Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* ✅ FIXED: Add safety check for order_items */}
                      {order.order_items && Array.isArray(order.order_items) && order.order_items.map((item, idx) => (
                        <TableRow key={item.id || idx} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {/* ✅ UPDATED: Use product_image if available */}
                              {item.product_image ? (
                                <Avatar
                                  src={item.product_image}
                                  sx={{ mr: 2, width: 48, height: 48 }}
                                />
                              ) : (
                                <Avatar
                                  sx={{
                                    mr: 2,
                                    bgcolor: 'primary.light',
                                    width: 48,
                                    height: 48,
                                  }}
                                >
                                  {item.product_name?.substring(0, 2) || 'PR'}
                                </Avatar>
                              )}
                              <Box>
                                <Typography variant="body1" fontWeight="medium">
                                  {item.product_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  SKU: {item.product_sku || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Product ID: {item.product_id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={item.quantity} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1">
                              ${parseAmount(item.unit_price).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="medium">
                              ${parseAmount(item.total_price).toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Order Summary & Details */}
            <Grid item xs={12} md={4}>
              {/* Order Summary */}
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Order Summary
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>${subtotal.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax:</Typography>
                  <Typography>${parseAmount(order.tax_amount).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Shipping:</Typography>
                  <Typography>${parseAmount(order.shipping_amount).toFixed(2)}</Typography>
                </Box>
                {/* ✅ ADD: Discount if available */}
                {parseAmount(order.discount_amount) > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="success.main">Discount:</Typography>
                    <Typography color="success.main">-${parseAmount(order.discount_amount).toFixed(2)}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight="bold">Total:</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    ${parseAmount(order.total_amount).toFixed(2)}
                  </Typography>
                </Box>
              </Paper>

              {/* Payment Info */}
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PaymentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Payment
                  </Typography>
                </Box>
                <Chip
                  label={order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                  color={order.payment_status === 'paid' ? 'success' : 'warning'}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Payment method will be displayed here
                </Typography>
              </Paper>

              {/* Shipping Address */}
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Shipping Address
                  </Typography>
                </Box>
                <Typography variant="body1" gutterBottom>
                  {order.shipping_address}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {order.shipping_country}
                </Typography>
                
                {/* ✅ UPDATED: Customer contact info */}
                {order.customer_email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {order.customer_email}
                    </Typography>
                  </Box>
                )}
                {order.customer_phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {order.customer_phone}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Container>
  );
};

export default OrderDetails;