import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Avatar, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';

import { useNavigate } from 'react-router-dom';
import { getAllUsers, User, updateUser, UpdateUserRequest } from '../../api/users';

const UsersManagement = () => {
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialog, setEditDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', mobile: '' });

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const usersData = await getAllUsers();
      if (usersData) {
        setUsers(usersData);
        console.log(`Loaded ${usersData.length} users`);
      } else {
        setError('Failed to load users. Make sure the User microservice is running on port 9090.');
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error loading users. Please ensure the User microservice is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEditClick = (user: User) => {
    setEditDialog({ open: true, user });
    setEditForm({
      name: user.name,
      email: user.email,
      mobile: user.mobile
    });
  };

  const handleEditSubmit = async () => {
    if (!editDialog.user) return;

    setEditLoading(true);
    try {
      const updateData: UpdateUserRequest = {};
      
      // Only include changed fields
      if (editForm.name !== editDialog.user.name) updateData.name = editForm.name;
      if (editForm.email !== editDialog.user.email) updateData.email = editForm.email;
      if (editForm.mobile !== editDialog.user.mobile) updateData.mobile = editForm.mobile;

      if (Object.keys(updateData).length > 0) {
        const updatedUser = await updateUser(editDialog.user.id, updateData);
        if (updatedUser) {
          // Update the user in the list
          setUsers(prev => prev.map(u => u.id === editDialog.user!.id ? updatedUser : u));
          setEditDialog({ open: false, user: null });
        } else {
          setError('Failed to update user');
        }
      } else {
        setEditDialog({ open: false, user: null });
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Error updating user');
    } finally {
      setEditLoading(false);
    }
  };

  const handleRefresh = () => {
    loadUsers();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading users...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h4" gutterBottom>
                Users Management
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                View and manage all registered users
              </Typography>
            </Box>
          </Box>
          <Box>
            <Button 
              variant="outlined" 
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button 
              variant="contained" 
              onClick={() => navigate('/register')}
              startIcon={<PersonAddIcon />}
            >
              Add New User
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <br />
            <strong>Make sure:</strong>
            <ul>
              <li>User microservice is running: <code>cd users-cna-microservice && python app.py</code></li>
              <li>Service is accessible at http://localhost:9090</li>
            </ul>
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Chip 
            label={`Total Users: ${users.length}`} 
            color="primary" 
            sx={{ mr: 2 }} 
          />
          <Chip 
            label={`Active: ${users.length}`} 
            color="success" 
            variant="outlined" 
          />
        </Box>

        {users.length === 0 ? (
          <Alert severity="info">
            <Typography variant="h6" gutterBottom>
              No users found
            </Typography>
            <Typography variant="body2">
              Create some users to see them here, or check if the User microservice is properly connected.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/register')}
              sx={{ mt: 2 }}
              startIcon={<PersonAddIcon />}
            >
              Create First User
            </Button>
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.50' }}>
                  <TableCell>Avatar</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Chip label={user.id} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {user.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.mobile}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        color={user.role === 'admin' ? 'warning' : 'primary'}
                        size="small"
                        icon={user.role === 'admin' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        onClick={() => handleEditClick(user)}
                        color="primary"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>

      {/* Edit User Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit User: {editDialog.user?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                variant="outlined"
                type="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mobile Number"
                value={editForm.mobile}
                onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, user: null })}>
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained" 
            disabled={editLoading}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersManagement;