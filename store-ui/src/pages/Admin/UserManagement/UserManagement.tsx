// src/pages/Admin/UserManagement/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, IconButton,
  Button, TextField, InputAdornment, Select, MenuItem, FormControl,
  InputLabel, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Alert, CircularProgress, Avatar, Tooltip,
  Menu, ListItemIcon, ListItemText
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
  Edit as EditIcon
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

const UserManagement: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  const applyFilters = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleUserAction = async (userId: number, action: 'block' | 'unblock' | 'suspend', reason?: string) => {
    if (!token) return;

    try {
      setActionLoading(true);
      
      let endpoint = '';
      let method = 'POST';
      let body: any = {};

      switch (action) {
        case 'block':
          endpoint = `http://localhost:9090/admin/users/${userId}/block`;
          body = { reason };
          break;
        case 'unblock':
          endpoint = `http://localhost:9090/admin/users/${userId}/unblock`;
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Manage user accounts, roles, and access permissions
      </Typography>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
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
              sx={{ minWidth: 250 }}
            />
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="pending_verification">Pending</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>

            <Button
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

            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              Showing {filteredUsers.length} of {users.length} users
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
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
                        <Typography variant="body2" fontWeight="medium">
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={user.role === 'admin' ? <AdminIcon /> : <UserIcon />}
                      label={user.role}
                      color={user.role === 'admin' ? 'warning' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
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
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => console.log('View user details')}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        {selectedUser?.status === 'active' && (
          <>
            <MenuItem onClick={() => openBlockDialog(selectedUser, 'block')}>
              <ListItemIcon>
                <BlockIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Block User</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => openBlockDialog(selectedUser, 'suspend')}>
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
    </Box>
  );
};

export default UserManagement;