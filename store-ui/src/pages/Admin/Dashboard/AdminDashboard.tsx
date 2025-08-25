// src/pages/Admin/Dashboard/AdminDashboard.tsx (FIXED FOR CORRECT ORDER STATS)
import React, { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, LinearProgress,
  Alert, Chip, Avatar, List, ListItem, ListItemAvatar,
  ListItemText, Divider, Button, CardActionArea
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  ShoppingCart as ShoppingCartIcon,
  DoneAll as DoneAllIcon,
  HourglassBottom as HourglassBottomIcon,
  AttachMoney as AttachMoneyIcon,
  LocalShipping as LocalShippingIcon,
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getOrderStats } from '../../../api/order';
import { apiUrl } from '../../../api/config';

interface UserStats {
  total_users: number;
  active_users: number;
  blocked_users: number;
  suspended_users: number;
  pending_verification: number;
  users_today: number;
}

// ✅ FIXED: Updated interface to match actual API response
interface OrderStats {
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: string; // API returns as string
  orders_today: number;
  orders_this_month: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  last_login?: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    if (!token) return;

    try {
      setLoading(true);

      // Fetch user statistics
      try {
        const statsResponse = await fetch(apiUrl.admin('stats'), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (statsResponse.ok) {
          setStats(await statsResponse.json());
        } else {
          console.warn('User stats not available');
        }
      } catch (err) {
        console.warn('Failed to fetch user stats:', err);
      }

      // Fetch recent users
      try {
        const usersResponse = await fetch(apiUrl.admin('users'), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          const sortedUsers = usersData
            .sort((a: User, b: User) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
          setRecentUsers(sortedUsers);
        } else {
          console.warn('Recent users not available');
        }
      } catch (err) {
        console.warn('Failed to fetch recent users:', err);
      }

      // ✅ FIXED: Fetch order statistics using correct API
      try {
        const orderData = await getOrderStats(token);
        console.log('Order stats received:', orderData);
        setOrderStats(orderData);
      } catch (err) {
        console.error('Failed to fetch order stats:', err);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Dashboard data fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'blocked': return 'error';
      case 'suspended': return 'warning';
      case 'pending_verification': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ FIXED: Updated to match actual order statuses
  const handleOrderCardClick = (filterType: string) => {
    navigate('/admin/orders', { state: { filter: filterType } });
  };

  const handleUserCardClick = (filterType: string) => {
    navigate('/admin/users', { state: { filter: filterType } });
  };

  // ✅ Helper function to parse revenue
  const formatRevenue = (revenue: string | undefined): string => {
    if (!revenue) return '0.00';
    const numRevenue = parseFloat(revenue);
    return isNaN(numRevenue) ? '0.00' : numRevenue.toFixed(2);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" onClick={fetchDashboardData} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Return to TechMart button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ ml: 2, boxShadow: 1, transition: 'background 0.2s, box-shadow 0.2s', '&:hover': { backgroundColor: 'primary.light', boxShadow: 3 } }}
        >
          Return to TechMart
        </Button>
      </Box>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Overview of users and orders on your platform
      </Typography>

      {/* USER STATS */}
      {stats && (
        <>
          <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>User Statistics</Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardActionArea onClick={() => handleUserCardClick('all')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary">Total Users</Typography>
                        <Typography variant="h4">{stats.total_users || 0}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'primary.main' }}><PeopleIcon /></Avatar>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardActionArea onClick={() => handleUserCardClick('active')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary">Active Users</Typography>
                        <Typography variant="h4">{stats.active_users || 0}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'success.main' }}><CheckCircleIcon /></Avatar>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardActionArea onClick={() => handleUserCardClick('today')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary">New Today</Typography>
                        <Typography variant="h4">{stats.users_today || 0}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'info.main' }}><PersonAddIcon /></Avatar>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardActionArea onClick={() => handleUserCardClick('blocked')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary">Blocked Users</Typography>
                        <Typography variant="h4">{stats.blocked_users || 0}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'error.main' }}><BlockIcon /></Avatar>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardActionArea onClick={() => handleUserCardClick('suspended')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography color="text.secondary">Suspended</Typography>
                        <Typography variant="h4">{stats.suspended_users || 0}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'warning.main' }}><WarningIcon /></Avatar>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography color="text.secondary">Activity Rate</Typography>
                      <Typography variant="h4">
                        {stats.total_users > 0
                          ? `${Math.round((stats.active_users / stats.total_users) * 100)}%`
                          : '0%'}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}><TrendingUpIcon /></Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* ORDER STATS */}
      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>Order Statistics</Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardActionArea onClick={() => handleOrderCardClick('all')}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary">Total Orders</Typography>
                    <Typography variant="h4">{orderStats?.total_orders || 0}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {orderStats?.orders_this_month || 0} this month
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}><ShoppingCartIcon /></Avatar>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardActionArea onClick={() => handleOrderCardClick('pending')}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary">Pending Orders</Typography>
                    <Typography variant="h4" color="warning.main">
                      {orderStats?.pending_orders || 0}
                    </Typography>
                    {orderStats?.pending_orders && orderStats.pending_orders > 0 && (
                      <Chip
                        label="Action Required"
                        size="small"
                        color="warning"
                        sx={{ mt: 0.5, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main' }}><HourglassBottomIcon /></Avatar>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardActionArea onClick={() => handleOrderCardClick('confirmed')}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary">Confirmed</Typography>
                    <Typography variant="h4">{orderStats?.confirmed_orders || 0}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main' }}><ReceiptIcon /></Avatar>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardActionArea onClick={() => handleOrderCardClick('delivered')}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary">Delivered</Typography>
                    <Typography variant="h4">{orderStats?.delivered_orders || 0}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main' }}><DoneAllIcon /></Avatar>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardActionArea onClick={() => handleOrderCardClick('processing')}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary">Processing</Typography>
                    <Typography variant="h4">{orderStats?.processing_orders || 0}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main' }}><LocalShippingIcon /></Avatar>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardActionArea onClick={() => handleOrderCardClick('shipped')}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary">Shipped</Typography>
                    <Typography variant="h4">{orderStats?.shipped_orders || 0}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}><LocalShippingIcon /></Avatar>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary">Total Revenue</Typography>
                  <Typography variant="h4">${formatRevenue(orderStats?.total_revenue)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {orderStats?.orders_today || 0} orders today
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}><AttachMoneyIcon /></Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
            <CardActionArea onClick={() => handleOrderCardClick('cancelled')}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary">Cancelled</Typography>
                    <Typography variant="h4" color="error.main">
                      {orderStats?.cancelled_orders || 0}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'error.main' }}><BlockIcon /></Avatar>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {/* RECENT USERS */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Users</Typography>
              {recentUsers.length > 0 ? (
                <List>
                  {recentUsers.map((user, index) => (
                    <React.Fragment key={user.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getStatusColor(user.status) === 'success' ? 'success.main' : 'warning.main' }}>
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.name}
                          secondary={
                            <Box>
                              <Typography variant="body2">{user.email}</Typography>
                              <Chip
                                label={user.status}
                                size="small"
                                color={getStatusColor(user.status)}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(user.created_at)}
                        </Typography>
                      </ListItem>
                      {index < recentUsers.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ py: 2 }}>
                  No recent users available
                </Typography>
              )}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/admin/users')}
                sx={{ mt: 2 }}
              >
                View All Users
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              {/* Navigation Section */}
              <Typography variant="h6" gutterBottom>Navigation</Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => navigate('/admin/orders')}
                    sx={{ textAlign: 'left' }}
                  >
                    Order Management
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<PeopleIcon />}
                    onClick={() => navigate('/admin/users')}
                    sx={{ textAlign: 'left' }}
                  >
                    User Management
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<TrendingUpIcon />}
                    onClick={() => navigate('/admin/analytics')}
                    sx={{ textAlign: 'left' }}
                  >
                    Analytics Dashboard
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    startIcon={<SettingsIcon />}
                    onClick={() => { }}
                    sx={{ textAlign: 'left' }}
                  >
                    Settings
                  </Button>
                </Grid>
              </Grid>
              {/* Quick Actions Section (existing) */}
              <Typography variant="h6" gutterBottom>Quick Actions</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate('/admin/orders')}
                    startIcon={<ShoppingCartIcon />}
                  >
                    Manage Orders ({orderStats?.total_orders || 0})
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/admin/users')}
                    startIcon={<PeopleIcon />}
                  >
                    Manage Users ({stats?.total_users || 0})
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleOrderCardClick('pending')}
                    startIcon={<HourglassBottomIcon />}
                    color={orderStats?.pending_orders && orderStats.pending_orders > 0 ? 'warning' : 'inherit'}
                  >
                    Pending Orders ({orderStats?.pending_orders || 0})
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/admin/analytics')}
                    startIcon={<TrendingUpIcon />}
                  >
                    View Analytics
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;