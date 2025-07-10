import React, { useState, useEffect } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, LinearProgress,
  Alert, Chip, Avatar, List, ListItem, ListItemAvatar,
  ListItemText, Divider, Button
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
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getOrderStats } from '../../../api/order';

interface UserStats {
  total_users: number;
  active_users: number;
  blocked_users: number;
  suspended_users: number;
  pending_verification: number;
  users_today: number;
}

interface OrderStats {
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  revenue: number;
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
      const statsResponse = await fetch('http://localhost:9090/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!statsResponse.ok) throw new Error('Failed to fetch user statistics');
      setStats(await statsResponse.json());

      // Fetch recent users
      const usersResponse = await fetch('http://localhost:9090/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      const usersData = await usersResponse.json();
      const sortedUsers = usersData
        .sort((a: User, b: User) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentUsers(sortedUsers);

      // Fetch order statistics
      const orderData = await getOrderStats(token);
      setOrderStats(orderData);
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
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Overview of users and orders on your platform
      </Typography>

      {/* USER STATS */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary">Total Users</Typography>
                <Typography variant="h4">{stats?.total_users || 0}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}><PeopleIcon /></Avatar>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary">Active Users</Typography>
                <Typography variant="h4">{stats?.active_users || 0}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}><CheckCircleIcon /></Avatar>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary">New Today</Typography>
                <Typography variant="h4">{stats?.users_today || 0}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}><PersonAddIcon /></Avatar>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary">Blocked Users</Typography>
                <Typography variant="h4">{stats?.blocked_users || 0}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'error.main' }}><BlockIcon /></Avatar>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary">Suspended</Typography>
                <Typography variant="h4">{stats?.suspended_users || 0}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}><WarningIcon /></Avatar>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary">Activity Rate</Typography>
                <Typography variant="h4">
                  {stats && stats.total_users > 0
                    ? `${Math.round((stats.active_users / stats.total_users) * 100)}%`
                    : '0%'}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'secondary.main' }}><TrendingUpIcon /></Avatar>
            </Box>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* ORDER STATS */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary">Total Orders</Typography>
                <Typography variant="h4">{orderStats?.total_orders || 0}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main' }}><ShoppingCartIcon /></Avatar>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary">Completed</Typography>
                <Typography variant="h4">{orderStats?.completed_orders || 0}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}><DoneAllIcon /></Avatar>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary">Pending</Typography>
                <Typography variant="h4">{orderStats?.pending_orders || 0}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}><HourglassBottomIcon /></Avatar>
            </Box>
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary">Revenue</Typography>
                <Typography variant="h4">${orderStats?.revenue?.toFixed(2) || '0.00'}</Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'info.main' }}><AttachMoneyIcon /></Avatar>
            </Box>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* RECENT USERS + ACTIONS remain unchanged */}
      {/* You can keep your existing Recent Users and Quick Actions section below this */}

    </Box>
  );
};

export default AdminDashboard;
