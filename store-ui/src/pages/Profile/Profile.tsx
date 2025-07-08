import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, 
  CircularProgress, Grid, Divider, Avatar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import { getUser, updateUser, User, UpdateUserRequest } from '../../api/users';

const Profile = () => {
  const navigate = useNavigate();
  
  // For now, we'll use a hardcoded user ID (John from the sample data)
  // Later, this should come from user authentication/session
  const currentUserId = 2; // John's ID from the sample data
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: ''
  });

  // Load user data on component mount
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const userData = await getUser(currentUserId);
        if (userData) {
          setUser(userData);
          setFormData({
            name: userData.name,
            email: userData.email,
            mobile: userData.mobile
          });
        } else {
          setError('User not found. Make sure the User microservice is running on port 9090.');
        }
      } catch (err) {
        setError('Failed to load user profile. Please ensure the User microservice is running.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [currentUserId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData: UpdateUserRequest = {};
      
      // Only include changed fields
      if (formData.name !== user?.name) updateData.name = formData.name;
      if (formData.email !== user?.email) updateData.email = formData.email;
      if (formData.mobile !== user?.mobile) updateData.mobile = formData.mobile;

      if (Object.keys(updateData).length === 0) {
        setSuccess('No changes to save.');
        setSaving(false);
        return;
      }

      const updatedUser = await updateUser(currentUserId, updateData);
      
      if (updatedUser) {
        setUser(updatedUser);
        setSuccess('Profile updated successfully!');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (err) {
      setError('Error updating profile. Please ensure the User microservice is running.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading profile...</Typography>
      </Box>
    );
  }

  if (error && !user) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {error}
          <br />
          <strong>Make sure:</strong>
          <ul>
            <li>User microservice is running: <code>cd users-cna-microservice && python app.py</code></li>
            <li>Service is accessible at http://localhost:9090</li>
          </ul>
          <Button variant="outlined" onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Back to Home
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 60, height: 60 }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              My Profile
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your account information
            </Typography>
          </Box>
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
                variant="outlined"
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
                variant="outlined"
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
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="User ID"
                value={user?.id || ''}
                disabled
                variant="outlined"
                helperText="This is your unique user identifier"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
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
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile;