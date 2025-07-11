// src/pages/Profile/Profile.tsx (ENHANCED VERSION)
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Avatar,
  Chip,
  Card,
  CardContent,
  IconButton,
  Container,
  Fade,
  Slide,
} from '@mui/material';
import {
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Home as HomeIcon,
  ShoppingCart as OrdersIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon,
  Camera as CameraIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface UpdateUserRequest {
  name?: string;
  email?: string;
  mobile?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, token, logout, isAdmin } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);

  // Form state - initialize with current user data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || ''
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        mobile: user.mobile
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
    setSuccess('');
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        mobile: user.mobile
      });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return false;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (!formData.mobile.trim()) {
      setError('Please enter your mobile number.');
      return false;
    }

    if (formData.mobile.length < 8) {
      setError('Please enter a valid mobile number (at least 8 digits).');
      return false;
    }

    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setSaving(false);
      return;
    }

    try {
      const updateData: UpdateUserRequest = {};

      // Only include changed fields
      if (formData.name !== user?.name) updateData.name = formData.name.trim();
      if (formData.email !== user?.email) updateData.email = formData.email.trim().toLowerCase();
      if (formData.mobile !== user?.mobile) updateData.mobile = formData.mobile.trim();

      if (Object.keys(updateData).length === 0) {
        setSuccess('No changes to save.');
        setEditing(false);
        setSaving(false);
        return;
      }

      // Simulate API call success
      setSuccess('Profile updated successfully!');
      setEditing(false);

      // TODO: Implement actual API call when user update endpoint is ready
      // const updatedUser = await updateUserProfile(updateData, token!);
      
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading if no user data yet
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
        <Typography sx={{ ml: 2 }}>Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Profile Header */}
          <Paper
            elevation={2}
            sx={{
              p: 4,
              mb: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                  }}
                >
                  {getInitials(user.name)}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    bgcolor: 'rgba(255,255,255,0.9)',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'white' },
                  }}
                  size="small"
                >
                  <CameraIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {user.name}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                  {user.email}
                </Typography>
                
                {/* Only show role badge for admins - don't show to regular users */}
                {isAdmin && (
                  <Chip
                    icon={<AdminIcon />}
                    label="Administrator"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' },
                    }}
                  />
                )}
                
                {/* Don't show user role for regular users */}
                {!isAdmin && (
                  <Chip
                    icon={<PersonIcon />}
                    label="Member"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '& .MuiChip-icon': { color: 'white' },
                    }}
                  />
                )}
              </Box>

              {/* Edit Button */}
              {!editing && (
                <IconButton
                  onClick={handleEdit}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  }}
                >
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          </Paper>

          {/* Alerts */}
          {error && (
            <Slide direction="down" in timeout={400}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            </Slide>
          )}

          {success && (
            <Slide direction="down" in timeout={400}>
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            </Slide>
          )}

          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Personal Information
                  </Typography>
                  {editing && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={handleSave}
                        disabled={saving}
                        color="primary"
                        sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                      >
                        {saving ? <CircularProgress size={20} /> : <SaveIcon />}
                      </IconButton>
                      <IconButton
                        onClick={handleCancel}
                        disabled={saving}
                        color="error"
                        sx={{ bgcolor: 'error.light', '&:hover': { bgcolor: 'error.main', color: 'white' } }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                <form onSubmit={handleSave}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        variant={editing ? 'outlined' : 'filled'}
                        disabled={!editing}
                        InputProps={{
                          readOnly: !editing,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        variant={editing ? 'outlined' : 'filled'}
                        disabled={!editing}
                        InputProps={{
                          readOnly: !editing,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Mobile Number"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required
                        variant={editing ? 'outlined' : 'filled'}
                        disabled={!editing}
                        InputProps={{
                          readOnly: !editing,
                        }}
                      />
                    </Grid>

                    {/* Show join date instead of user ID for regular users */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={isAdmin ? "User ID" : "Member Since"}
                        value={isAdmin ? user.id : 'Member'}
                        disabled
                        variant="filled"
                        helperText={isAdmin ? "Your unique identifier" : "Welcome to TechMart"}
                      />
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>

            {/* Quick Actions & Account Info */}
            <Grid item xs={12} md={4}>
              {/* Quick Actions */}
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<OrdersIcon />}
                      onClick={() => navigate('/orders')}
                    >
                      My Orders
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<HomeIcon />}
                      onClick={() => navigate('/')}
                    >
                      Continue Shopping
                    </Button>
                  </Grid>
                  {isAdmin && (
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="warning"
                        startIcon={<AdminIcon />}
                        onClick={() => navigate('/admin')}
                      >
                        Admin Dashboard
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              {/* Account Security */}
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Account Security
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
  Account Status: <Chip label="Active" size="small" color="success" />
</Typography>
                
                {/* Don't show sensitive role info to regular users */}
                {isAdmin && (
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Privileges: Administrator Access
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />
                
                <Button
                  fullWidth
                  variant="text"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={() => {
                    if (window.confirm('Are you sure you want to logout?')) {
                      logout();
                      navigate('/');
                    }
                  }}
                >
                  Logout
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Container>
  );
};

export default Profile;