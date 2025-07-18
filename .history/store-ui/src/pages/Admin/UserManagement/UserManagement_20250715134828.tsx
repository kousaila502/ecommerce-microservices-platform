// src/pages/Admin/UserManagement/UserManagement.tsx (ENHANCED VERSION)
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
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

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

interface UserOrder {
  id: number;
  order_number: string;
  status: string;
  total_amount: string;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Selection state
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Dialog states
  const [blockDialog, setBlockDialog] = useState<{ open: boolean; user: User | null; action: 'block' | 'suspend' | null }>({
    open: false,
    user: null,
    action: null
  });
  const [blockReason, setBlockReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // User details dialog
  const [userDetailsDialog, setUserDetailsDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  });
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Bulk actions dialog
  const [bulkActionDialog, setBulkActionDialog] = useState<{ open: boolean; action: string | null }>({
    open: false,
    action: null
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, statusFilter, roleFilter]);

  const fetchUsers = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:9090/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (userId: number) => {
    if (!token) return;

    try {
      setOrdersLoading(true);
      // This endpoint might need to be created in your backend
      const response = await fetch(`http://localhost:8080/api/users/admin/users/${userId}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const orders = await response.json();
        setUserOrders(orders);
      } else {
        // Fallback: show mock data or empty state
        setUserOrders([]);
      }
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
      setUserOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  // Selection handlers
  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleUserAction = async (userId: number, action: 'block' | 'unblock' | 'suspend', reason?: string) => {
    if (!token) return;

    try {
      setActionLoading(true);
      
      let endpoint = '';
      let method = 'POST';
      let body: any = {};

      switch (action) {
        case 'block':
          endpoint = `http://localhost:8080/api/users/admin/users/${userId}/block`;
          body = { reason };
          break;
        case 'unblock':
          endpoint = `http://localhost:8080/api/users/admin/users/${userId}/unblock`;
          break;
        case 'suspend':
          endpoint = `http://localhost:9090/admin/users/${userId}/suspend`;
          body = { reason };
          break;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: Object.keys(body).length ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`);
      }

      const result = await response.json();
      setSuccess(result.message);
      
      // Refresh users list
      await fetchUsers();
      
      // Close dialog
      setBlockDialog({ open: false, user: null, action: null });
      setBlockReason('');
      
    } catch (err: any) {
      setError(err.message || `Failed to ${action} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      setActionLoading(true);
      const promises = selectedUsers.map(userId => {
        switch (action) {
          case 'block':
            return handleUserAction(userId, 'block', 'Bulk action');
          case 'unblock':
            return handleUserAction(userId, 'unblock');
          case 'suspend':
            return handleUserAction(userId, 'suspend', 'Bulk action');
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);
      setSuccess(`Successfully ${action}ed ${selectedUsers.length} users`);
      setSelectedUsers([]);
      setBulkActionDialog({ open: false, action: null });
    } catch (err: any) {
      setError(`Failed to ${action} users`);
    } finally {
      setActionLoading(false);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const openBlockDialog = (user: User, action: 'block' | 'suspend') => {
    setBlockDialog({ open: true, user, action });
    handleMenuClose();
  };

  const openUserDetails = async (user: User) => {
    setUserDetailsDialog({ open: true, user });
    await fetchUserOrders(user.id);
    handleMenuClose();
  };

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
                User Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage user accounts, roles, and access permissions
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchUsers}
            >
              Refresh
            </Button>
          </Box>

          {/* Alerts */}
          {error && (
            <Slide direction="down" in timeout={400}>
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            </Slide>
          )}
          {success && (
            <Slide direction="down" in timeout={400}>
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            </Slide>
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

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <Card sx={{ mb: 3, bgcolor: 'primary.light' }}>
              <Toolbar>
                <Typography variant="h6" sx={{ flex: 1 }}>
                  {selectedUsers.length} users selected
                </Typography>
                <Tooltip title="Block Selected">
                  <IconButton onClick={() => setBulkActionDialog({ open: true, action: 'block' })}>
                    <BlockIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Suspend Selected">
                  <IconButton onClick={() => setBulkActionDialog({ open: true, action: 'suspend' })}>
                    <SuspendIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Unblock Selected">
                  <IconButton onClick={() => setBulkActionDialog({ open: true, action: 'unblock' })}>
                    <UnblockIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Clear Selection">
                  <IconButton onClick={() => setSelectedUsers([])}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Toolbar>
            </Card>
          )}

          {/* Users Table */}
          <Card>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
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
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: user.role === 'admin' ? 'warning.main' : 'primary.main' }}>
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            <EmailIcon fontSize="small" color="action" />
                            {user.email}
                          </Typography>
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            {user.mobile}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={user.role === 'admin' ? <AdminIcon /> : <UserIcon />}
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          color={user.role === 'admin' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status.replace('_', ' ')}
                          color={getStatusColor(user.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(user.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(user.last_login)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, user)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredUsers.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <UserIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No users found
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  Try adjusting your search or filter criteria
                </Typography>
              </Box>
            )}
          </Card>

          {/* Action Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => selectedUser && openUserDetails(selectedUser)}>
              <ListItemIcon>
                <ViewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details & Orders</ListItemText>
            </MenuItem>
            
            {selectedUser?.status === 'active' && (
              <>
                <MenuItem onClick={() => selectedUser && openBlockDialog(selectedUser, 'block')}>
                  <ListItemIcon>
                    <BlockIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Block User</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => selectedUser && openBlockDialog(selectedUser, 'suspend')}>
                  <ListItemIcon>
                    <SuspendIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Suspend User</ListItemText>
                </MenuItem>
              </>
            )}
            
            {(selectedUser?.status === 'blocked' || selectedUser?.status === 'suspended') && (
              <MenuItem onClick={() => selectedUser && handleUserAction(selectedUser.id, 'unblock')}>
                <ListItemIcon>
                  <UnblockIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Unblock User</ListItemText>
              </MenuItem>
            )}
          </Menu>

          {/* Block/Suspend Dialog */}
          <Dialog open={blockDialog.open} onClose={() => setBlockDialog({ open: false, user: null, action: null })}>
            <DialogTitle>
              {blockDialog.action === 'block' ? 'Block User' : 'Suspend User'}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to {blockDialog.action} user "{blockDialog.user?.name}"?
                {blockDialog.action === 'block' && ' This will permanently block their access.'}
                {blockDialog.action === 'suspend' && ' This will temporarily suspend their access.'}
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Reason (optional)"
                fullWidth
                variant="outlined"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for this action..."
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setBlockDialog({ open: false, user: null, action: null })}>
                Cancel
              </Button>
              <Button
                onClick={() => blockDialog.user && blockDialog.action && handleUserAction(blockDialog.user.id, blockDialog.action, blockReason)}
                color={blockDialog.action === 'block' ? 'error' : 'warning'}
                disabled={actionLoading}
                startIcon={actionLoading ? <CircularProgress size={16} /> : null}
              >
                {blockDialog.action === 'block' ? 'Block User' : 'Suspend User'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Bulk Action Dialog */}
          <Dialog open={bulkActionDialog.open} onClose={() => setBulkActionDialog({ open: false, action: null })}>
            <DialogTitle>Bulk Action Confirmation</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to {bulkActionDialog.action} {selectedUsers.length} selected users?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setBulkActionDialog({ open: false, action: null })}>
                Cancel
              </Button>
              <Button
                onClick={() => bulkActionDialog.action && handleBulkAction(bulkActionDialog.action)}
                color="primary"
                disabled={actionLoading}
                startIcon={actionLoading ? <CircularProgress size={16} /> : null}
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>

          {/* User Details Dialog */}
          <Dialog 
            open={userDetailsDialog.open} 
            onClose={() => setUserDetailsDialog({ open: false, user: null })}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: userDetailsDialog.user?.role === 'admin' ? 'warning.main' : 'primary.main' }}>
                  {userDetailsDialog.user?.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">{userDetailsDialog.user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    User Details & Order History
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setUserDetailsDialog({ open: false, user: null })}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {userDetailsDialog.user && (
                <Grid container spacing={3}>
                  {/* User Info */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          User Information
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon color="action" />
                            <Typography>{userDetailsDialog.user.email}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PhoneIcon color="action" />
                            <Typography>{userDetailsDialog.user.mobile}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DateIcon color="action" />
                            <Typography>Joined {formatDate(userDetailsDialog.user.created_at)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={userDetailsDialog.user.status}
                              color={getStatusColor(userDetailsDialog.user.status) as any}
                              size="small"
                            />
                            <Chip
                              icon={userDetailsDialog.user.role === 'admin' ? <AdminIcon /> : <UserIcon />}
                              label={userDetailsDialog.user.role}
                              color={userDetailsDialog.user.role === 'admin' ? 'warning' : 'default'}
                              size="small"
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Order History */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <OrdersIcon color="primary" />
                          <Typography variant="h6">
                            Order History
                          </Typography>
                          <Badge badgeContent={userOrders.length} color="primary" />
                        </Box>
                        
                        {ordersLoading ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                            <CircularProgress />
                          </Box>
                        ) : userOrders.length > 0 ? (
                          <List dense>
                            {userOrders.slice(0, 5).map((order) => (
                              <ListItem key={order.id} divider>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: 'primary.light' }}>
                                    <OrdersIcon />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={`Order #${order.order_number}`}
                                  secondary={
                                    <Box>
                                      <Typography variant="caption">
                                        ${order.total_amount} • {formatDate(order.created_at)}
                                      </Typography>
                                      <br />
                                      <Chip 
                                        label={order.status} 
                                        size="small" 
                                        color={order.status === 'delivered' ? 'success' : 'default'}
                                      />
                                    </Box>
                                  }
                                />
                              </ListItem>
                            ))}
                            {userOrders.length > 5 && (
                              <ListItem>
                                <ListItemText 
                                  primary={
                                    <Typography variant="body2" color="primary" textAlign="center">
                                      +{userOrders.length - 5} more orders
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            )}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary" textAlign="center">
                            No orders found for this user
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
          </Dialog>
        </Box>
      </Fade>
    </Container>
  );
};

export default UserManagement;