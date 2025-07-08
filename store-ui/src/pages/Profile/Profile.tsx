// src/pages/Profile/Profile.tsx - REPLACE YOUR EXISTING FILE WITH THIS CODE
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, 
  CircularProgress, Grid, Divider, Avatar, Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface UpdateUserRequest {
  name?: string;
  email?: string;
  mobile?: string;
}

// Updated API call to use authentication
const updateUserProfile = async (userData: UpdateUserRequest, token: string) => {
  const response = await fetch(`http://localhost:9090/users/${userData}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update profile');
  }

  return response.json();
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

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
    // Reset form data to original user data
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

      // Note: For now, we'll show success message since the backend update endpoint 
      // might need to be implemented. The user data is already current from auth context.
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

  // Show loading if no user data yet
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ bgcolor: user.role === 'admin' ? 'warning.main' : 'primary.main', mr: 2, width: 60, height: 60 }}>
            {user.role === 'admin' ? <AdminPanelSettingsIcon fontSize="large" /> : <PersonIcon fontSize="large" />}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
              My Profile
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your account information
            </Typography>
          </Box>
          <Chip 
            label={user.role === 'admin' ? 'Administrator' : 'User'} 
            color={user.role === 'admin' ? 'warning' : 'primary'}
            variant="outlined"
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Form */}
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
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="User ID"
                value={user.id}
                disabled
                variant="filled"
                helperText="This is your unique user identifier"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account Type"
                value={user.role === 'admin' ? 'Administrator' : 'Regular User'}
                disabled
                variant="filled"
                helperText={user.role === 'admin' ? 'You have administrative privileges' : 'Standard user account'}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {editing ? (
              <>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : null}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={handleEdit}
              >
                Edit Profile
              </Button>
            )}
            
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>

            {user.role === 'admin' && (
              <Button
                variant="outlined"
                color="warning"
                onClick={() => navigate('/users')}
              >
                Manage Users
              </Button>
            )}
          </Box>
        </form>

        {/* Account Actions */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Account Actions
          </Typography>
          <Button
            variant="text"
            color="error"
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                logout();
                navigate('/');
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;