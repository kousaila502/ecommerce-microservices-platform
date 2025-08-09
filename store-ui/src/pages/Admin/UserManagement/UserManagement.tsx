// src/pages/Admin/UserManagement/UserManagement.tsx (ENHANCED WITH CREATE USER)
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
  Button, TextField, InputAdornment, Select, MenuItem, FormControl,
  InputLabel, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Alert, CircularProgress, Avatar, Tooltip,
  Menu, ListItemIcon, ListItemText, Checkbox, Toolbar, Divider,
  Grid, Fade, Slide, List, ListItem, ListItemAvatar, Badge,
  Container
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  Pause as SuspendIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckBox as SelectAllIcon,
  IndeterminateCheckBox as PartialSelectIcon,
  ShoppingCart as OrdersIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as DateIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { apiUrl } from '../../../api/config';

interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  is_email_verified: boolean;
  created_at: string;
  last_login?: string;
  blocked_at?: string;
  blocked_reason?: string;
}

interface CreateUserData {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: string;
}

const AdminUserManagement: React.FC = () => {
  const { token } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // NEW: Create user dialog state
  const [createUserDialog, setCreateUserDialog] = useState({
    open: false,
    loading: false,
    data: {
      name: '',
      email: '',
      mobile: '',
      password: '',
      role: 'user'
    } as CreateUserData
  });

  // ...existing state variables...

  // NEW: Create user function
  const handleCreateUser = async () => {
    if (!token) return;

    const { name, email, mobile, password, role } = createUserDialog.data;

    // Validation
    if (!name.trim() || !email.trim() || !mobile.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setCreateUserDialog(prev => ({ ...prev, loading: true }));

      // FIXED: Use admin create-user endpoint instead of auth/register
      const response = await fetch(apiUrl.admin('create-user'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobile.trim(),
          password: password,
          role: role
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create user');
      }

      const result = await response.json();

      setSuccess(result.message || `User ${result.name} created successfully!`);
      setCreateUserDialog({
        open: false,
        loading: false,
        data: { name: '', email: '', mobile: '', password: '', role: 'user' }
      });

      // Refresh users list
      await fetchUsers();

    } catch (err: any) {
      console.error('Create user error:', err);
      setError(err.message || 'Failed to create user');
    } finally {
      setCreateUserDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchUsers = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch(apiUrl.admin('users'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const userData = await response.json();
      setUsers(userData);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              User Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage users, roles, and permissions
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchUsers}
            >
              Refresh
            </Button>
            {/* NEW: Create User Button */}
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setCreateUserDialog(prev => ({ ...prev, open: true }))}
            >
              Create User
            </Button>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Filters and Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="blocked">Blocked</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="pending_verification">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Role"
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setRoleFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </Grid>

              <Grid item xs={12} md={2}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  {filteredUsers.length} of {users.length} users
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{user.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            ID: {user.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="body2">{user.email}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.mobile}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={user.role}
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                        icon={user.role === 'admin' ? <AdminIcon /> : <UserIcon />}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(user.created_at)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.last_login ? formatDate(user.last_login) : 'Never'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          // Handle user actions (view, edit, block, etc.)
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* NEW: Create User Dialog */}
        <Dialog
          open={createUserDialog.open}
          onClose={() => !createUserDialog.loading && setCreateUserDialog(prev => ({ ...prev, open: false }))}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonAddIcon />
              Create New User
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 3 }}>
              Add a new user to the system. They will receive account credentials via email.
            </DialogContentText>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={createUserDialog.data.name}
                  onChange={(e) => setCreateUserDialog(prev => ({
                    ...prev,
                    data: { ...prev.data, name: e.target.value }
                  }))}
                  required
                  disabled={createUserDialog.loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={createUserDialog.data.email}
                  onChange={(e) => setCreateUserDialog(prev => ({
                    ...prev,
                    data: { ...prev.data, email: e.target.value }
                  }))}
                  required
                  disabled={createUserDialog.loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  value={createUserDialog.data.mobile}
                  onChange={(e) => setCreateUserDialog(prev => ({
                    ...prev,
                    data: { ...prev.data, mobile: e.target.value }
                  }))}
                  required
                  disabled={createUserDialog.loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={createUserDialog.data.password}
                  onChange={(e) => setCreateUserDialog(prev => ({
                    ...prev,
                    data: { ...prev.data, password: e.target.value }
                  }))}
                  required
                  disabled={createUserDialog.loading}
                  helperText="Minimum 6 characters"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={createUserDialog.data.role}
                    label="Role"
                    onChange={(e) => setCreateUserDialog(prev => ({
                      ...prev,
                      data: { ...prev.data, role: e.target.value }
                    }))}
                    disabled={createUserDialog.loading}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setCreateUserDialog(prev => ({ ...prev, open: false }))}
              disabled={createUserDialog.loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateUser}
              disabled={createUserDialog.loading}
              startIcon={createUserDialog.loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
            >
              {createUserDialog.loading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminUserManagement;