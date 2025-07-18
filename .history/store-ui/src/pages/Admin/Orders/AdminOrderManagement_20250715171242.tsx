// src/pages/Admin/Orders/AdminOrderManagement.tsx (NEW FILE)
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Checkbox,
  Toolbar,
  Tooltip,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Avatar,
  Fade,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  Cancel as CancelIcon,
  LocalShipping as ShipIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

// You'll need to create this API function
// import { getAllOrders, updateOrderStatus } from '../../../api/order';

interface Order {
  id: number;
  order_number: string;
  customer_email: string;
  status: string;
  payment_status: string;
  total_amount: string;
  created_at: string;
  user_id: number;
}

const AdminOrderManagement: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [updateDialog, setUpdateDialog] = useState({ open: false, orderId: 0, currentStatus: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    if (!token) return;

    setLoading(true);
    try {
      // TODO: Replace with your actual API call
      const response = await fetch(`${ordersUrl}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    if (!token) return;

    try {
      // TODO: Replace with your actual API call
      const response = await fetch(`http://localhost:8081/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        setSnackbar({
          open: true,
          message: `Order status updated to ${newStatus}`,
          severity: 'success'
        });
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update order status',
        severity: 'error'
      });
    }
    setUpdateDialog({ open: false, orderId: 0, currentStatus: '' });
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.length === 0) return;

    try {
      // TODO: Implement bulk update API call
      const promises = selectedOrders.map(orderId =>
        handleStatusUpdate(orderId, newStatus)
      );
      await Promise.all(promises);
      setSelectedOrders([]);
      setSnackbar({
        open: true,
        message: `Updated ${selectedOrders.length} orders to ${newStatus}`,
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update orders',
        severity: 'error'
      });
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
      case 'confirmed':
        return 'primary';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const orderStatusOptions = [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Order Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and track all customer orders
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchOrders}
            >
              Refresh
            </Button>
          </Box>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <ViewIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">{orders.length}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Orders
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <FilterIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">
                        {orders.filter(o => o.status === 'pending').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <ShipIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">
                        {orders.filter(o => o.status === 'processing' || o.status === 'shipped').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        In Progress
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <ApproveIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4">
                        {orders.filter(o => o.status === 'delivered' || o.status === 'completed').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters and Search */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Status Filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  {orderStatusOptions.map(status => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ExportIcon />}
                >
                  Export
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light' }}>
              <Toolbar sx={{ pl: 0 }}>
                <Typography variant="h6" sx={{ flex: 1 }}>
                  {selectedOrders.length} orders selected
                </Typography>
                <Tooltip title="Approve Selected">
                  <IconButton onClick={() => handleBulkStatusUpdate('confirmed')}>
                    <ApproveIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Mark as Processing">
                  <IconButton onClick={() => handleBulkStatusUpdate('processing')}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Mark as Shipped">
                  <IconButton onClick={() => handleBulkStatusUpdate('shipped')}>
                    <ShipIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel Selected">
                  <IconButton onClick={() => handleBulkStatusUpdate('cancelled')}>
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </Toolbar>
            </Paper>
          )}

          {/* Orders Table */}
          <Paper sx={{ borderRadius: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedOrders.length > 0 && selectedOrders.length < filteredOrders.length}
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Order</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            #{order.order_number}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {order.id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.customer_email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          User ID: {order.user_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.payment_status}
                          color={order.payment_status === 'paid' ? 'success' : 'warning'}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          ${order.total_amount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(order.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update Status">
                          <IconButton
                            size="small"
                            onClick={() => setUpdateDialog({
                              open: true,
                              orderId: order.id,
                              currentStatus: order.status
                            })}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredOrders.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No orders found
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Try adjusting your search or filter criteria
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Status Update Dialog */}
          <Dialog
            open={updateDialog.open}
            onClose={() => setUpdateDialog({ open: false, orderId: 0, currentStatus: '' })}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogContent>
              <TextField
                select
                fullWidth
                label="New Status"
                value={updateDialog.currentStatus}
                onChange={(e) => setUpdateDialog(prev => ({ ...prev, currentStatus: e.target.value }))}
                margin="normal"
              >
                {orderStatusOptions.map(status => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUpdateDialog({ open: false, orderId: 0, currentStatus: '' })}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => handleStatusUpdate(updateDialog.orderId, updateDialog.currentStatus)}
              >
                Update
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Fade>
    </Container>
  );
};

export default AdminOrderManagement;