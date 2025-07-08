import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, 
  CircularProgress, Grid, Link as MuiLink, Avatar,
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import { createUser, CreateUserRequest } from '../../api/users';

const Register = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'user'  // Default to regular user
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      role: e.target.value
    }));
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

    if (!formData.role || !['user', 'admin'].includes(formData.role)) {
      setError('Please select a valid role.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData: CreateUserRequest = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        role: formData.role
      };

      console.log('Creating user with data:', userData);
      const newUser = await createUser(userData);
      
      if (newUser) {
        setSuccess(`Account created successfully! Welcome, ${newUser.name}! Your user ID is ${newUser.id} and role is ${newUser.role}.`);
        setFormData({ name: '', email: '', mobile: '', role: 'user' });
        
        // Redirect to profile after 3 seconds
        setTimeout(() => {
          navigate('/users');  // Go to user management to see the new user
        }, 3000);
      } else {
        setError('Failed to create account. Please try again or check if the email already exists.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Error creating account. Please ensure the User microservice is running on port 9090.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 60, height: 60 }}>
            <PersonAddIcon fontSize="large" />
          </Avatar>
          <Typography variant="h4" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Join our e-commerce platform
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
            <br />
            <Typography variant="body2" sx={{ mt: 1 }}>
              Redirecting to user management page in 3 seconds...
            </Typography>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                variant="outlined"
                placeholder="Enter your full name"
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                variant="outlined"
                placeholder="Enter your email address"
                disabled={loading}
                helperText="We'll use this to identify your account"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mobile Number"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                required
                variant="outlined"
                placeholder="Enter your mobile number"
                disabled={loading}
                helperText="For order updates and notifications"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="role-label">User Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={formData.role}
                  label="User Role"
                  onChange={handleRoleChange}
                  disabled={loading}
                >
                  <MenuItem value="user">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon color="primary" />
                      <Box>
                        <Typography variant="body1">Regular User</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Can shop and manage personal account
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                  <MenuItem value="admin">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AdminPanelSettingsIcon color="warning" />
                      <Box>
                        <Typography variant="body1">Administrator</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Can manage users and system settings
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
              sx={{ minWidth: 200, mb: 2 }}
            >
              {loading ? 'Creating Account...' : `Create ${formData.role === 'admin' ? 'Admin' : 'User'} Account`}
            </Button>
            
            {formData.role === 'admin' && (
              <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 1 }}>
                ⚠️ Admin accounts have elevated privileges
              </Typography>
            )}
          </Box>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Want to view existing users?{' '}
            <MuiLink 
              component="button" 
              variant="body2" 
              onClick={() => navigate('/users')}
              sx={{ textDecoration: 'underline', cursor: 'pointer' }}
            >
              User Management
            </MuiLink>
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Want to browse first?{' '}
            <MuiLink 
              component="button" 
              variant="body2" 
              onClick={() => navigate('/')}
              sx={{ textDecoration: 'underline', cursor: 'pointer' }}
            >
              Back to Homepage
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;