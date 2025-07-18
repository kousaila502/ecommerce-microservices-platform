// src/pages/Admin/Analytics/Analytics.tsx (FULLY FIXED)
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardHeader,
  LinearProgress, Alert, Select, MenuItem, FormControl,
  InputLabel, Chip, Avatar, List, ListItem, ListItemAvatar,
  ListItemText, Divider
} from '@mui/material';
import {
  TrendingUp, TrendingDown, People, PersonAdd,
  Block, CheckCircle, Warning
} from '@mui/icons-material';
import {
  LineChart as RechartsLineChart, 
  Line as RechartsLine, 
  AreaChart as RechartsAreaChart, 
  Area as RechartsArea, 
  BarChart as RechartsBarChart, 
  Bar as RechartsBar,
  PieChart as RechartsPieChart, 
  Pie as RechartsPie, 
  Cell as RechartsCell, 
  XAxis as RechartsXAxis, 
  YAxis as RechartsYAxis, 
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend, 
  ResponsiveContainer as RechartsResponsiveContainer
} from 'recharts';
import { useAuth } from '../../../contexts/AuthContext';

// Type assertions for all Recharts components
const ResponsiveContainer = RechartsResponsiveContainer as any;
const AreaChart = RechartsAreaChart as any;
const Area = RechartsArea as any;
const PieChart = RechartsPieChart as any;
const Pie = RechartsPie as any;
const Cell = RechartsCell as any;
const BarChart = RechartsBarChart as any;
const Bar = RechartsBar as any;
const XAxis = RechartsXAxis as any;
const YAxis = RechartsYAxis as any;
const CartesianGrid = RechartsCartesianGrid as any;
const Tooltip = RechartsTooltip as any;
const Legend = RechartsLegend as any;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  last_login?: string;
}

interface UserStats {
  total_users: number;
  active_users: number;
  blocked_users: number;
  suspended_users: number;
  pending_verification: number;
  users_today: number;
}

interface ChartData {
  date: string;
  users: number;
  cumulative: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

const Analytics: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch('http://localhost:8080/api/users/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch users for analytics
      const usersResponse = await fetch('http://localhost:9090/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const usersData = await usersResponse.json();
      setUsers(usersData);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Generate user registration trend data
  const generateRegistrationTrend = (): ChartData[] => {
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    const data: ChartData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayUsers = users.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate.toDateString() === date.toDateString();
      }).length;

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: dayUsers,
        cumulative: users.filter(user => 
          new Date(user.created_at) <= date
        ).length
      });
    }
    
    return data;
  };

  // Generate status distribution data
  const generateStatusDistribution = (): StatusData[] => {
    if (!stats) return [];
    
    return [
      { name: 'Active', value: stats.active_users, color: '#4caf50' },
      { name: 'Blocked', value: stats.blocked_users, color: '#f44336' },
      { name: 'Suspended', value: stats.suspended_users, color: '#ff9800' },
      { name: 'Pending', value: stats.pending_verification, color: '#2196f3' },
    ].filter(item => item.value > 0);
  };

  // Generate role distribution data
  const generateRoleDistribution = () => {
    const adminCount = users.filter(user => user.role === 'admin').length;
    const userCount = users.filter(user => user.role === 'user').length;
    
    return [
      { name: 'Users', value: userCount, color: '#2196f3' },
      { name: 'Admins', value: adminCount, color: '#ff9800' },
    ].filter(item => item.value > 0);
  };

  // Calculate growth metrics
  const calculateGrowthMetrics = () => {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekUsers = users.filter(user => 
      new Date(user.created_at) >= lastWeek
    ).length;

    const lastWeekUsers = users.filter(user => {
      const date = new Date(user.created_at);
      return date >= twoWeeksAgo && date < lastWeek;
    }).length;

    const growthRate = lastWeekUsers === 0 ? 100 : 
      ((thisWeekUsers - lastWeekUsers) / lastWeekUsers) * 100;

    return {
      thisWeek: thisWeekUsers,
      lastWeek: lastWeekUsers,
      growthRate: Math.round(growthRate * 10) / 10
    };
  };

  // Get recent activity
  const getRecentActivity = () => {
    return users
      .filter(user => user.last_login)
      .sort((a, b) => new Date(b.last_login!).getTime() - new Date(a.last_login!).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Analytics</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>Analytics</Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const registrationTrend = generateRegistrationTrend();
  const statusDistribution = generateStatusDistribution();
  const roleDistribution = generateRoleDistribution();
  const growth = calculateGrowthMetrics();
  const recentActivity = getRecentActivity();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Insights into user behavior and platform growth
          </Typography>
        </Box>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7days">Last 7 days</MenuItem>
            <MenuItem value="30days">Last 30 days</MenuItem>
            <MenuItem value="90days">Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Growth Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    This Week
                  </Typography>
                  <Typography variant="h4">
                    {growth.thisWeek}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    {growth.growthRate >= 0 ? (
                      <TrendingUp color="success" fontSize="small" />
                    ) : (
                      <TrendingDown color="error" fontSize="small" />
                    )}
                    <Typography 
                      variant="body2" 
                      color={growth.growthRate >= 0 ? 'success.main' : 'error.main'}
                      sx={{ ml: 0.5 }}
                    >
                      {growth.growthRate >= 0 ? '+' : ''}{growth.growthRate}%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <PersonAdd />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                  <Typography variant="body2" color="text.secondary">
                    Platform total
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <People />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Rate
                  </Typography>
                  <Typography variant="h4">
                    {stats ? Math.round((stats.active_users / stats.total_users) * 100) : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    User engagement
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Issues
                  </Typography>
                  <Typography variant="h4">
                    {(stats?.blocked_users || 0) + (stats?.suspended_users || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Blocked + Suspended
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Warning />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Registration Trend */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader title="User Registration Trend" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={registrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#2196f3" 
                    fill="#2196f3" 
                    fillOpacity={0.3}
                    name="New Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardHeader title="User Status Distribution" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Role Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Role Distribution" />
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={roleDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent User Activity" />
            <CardContent>
              <List>
                {recentActivity.map((user, index) => (
                  <React.Fragment key={user.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.name}
                        secondary={`Last login: ${new Date(user.last_login!).toLocaleDateString()}`}
                      />
                      <Chip
                        label={user.status}
                        color={user.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;