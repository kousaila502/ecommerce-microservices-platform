// src/pages/Admin/Dashboard/AdminDashboard.tsx
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
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

interface UserStats {
  total_users: number;
  active_users: number;
  blocked_users: number;
  suspended_users: number;
  pending_verification: number;
  users_today: number;
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

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch recent users
      const usersResponse = await fetch('http://localhost:9090/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users');
      }

      const usersData = await usersResponse.json();
      // Sort by creation date and take the 5 most recent
      const sortedUsers = usersData
        .sort((a: User, b: User) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      
      setRecentUsers(sortedUsers);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
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
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Overview of your platform's users and activity
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {stats?.total_users || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Users
                  </Typography>
                  <Typography variant="h4">
                    {stats?.active_users || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    New Today
                  </Typography>
                  <Typography variant="h4">
                    {stats?.users_today || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <PersonAddIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Blocked Users
                  </Typography>
                  <Typography variant="h4">
                    {stats?.blocked_users || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <BlockIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Suspended
                  </Typography>
                  <Typography variant="h4">
                    {stats?.suspended_users || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <WarningIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Activity Rate
                  </Typography>
                  <Typography variant="h4">
                    {stats ? Math.round((stats.active_users / stats.total_users) * 100) : 0}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Users */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Users
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/admin/users')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {recentUsers.map((user, index) => (
                  <React.Fragment key={user.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.name}
                        secondary={user.email}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <Chip
                          label={user.status}
                          color={getStatusColor(user.status) as any}
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(user.created_at)}
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < recentUsers.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/admin/users')}
                  fullWidth
                >
                  Manage Users
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BlockIcon />}
                  onClick={() => navigate('/admin/users?filter=blocked')}
                  fullWidth
                >
                  View Blocked Users
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<TrendingUpIcon />}
                  onClick={() => navigate('/admin/analytics')}
                  fullWidth
                >
                  View Analytics
                </Button>
                <Button
                  variant="outlined"
                  onClick={fetchDashboardData}
                  fullWidth
                >
                  Refresh Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;