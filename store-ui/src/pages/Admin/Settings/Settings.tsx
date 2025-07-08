// src/pages/Admin/Settings/Settings.tsx
import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, CardHeader, Grid,
  Switch, FormControlLabel, TextField, Button, Divider,
  Alert, List, ListItem, ListItemText, ListItemSecondaryAction,
  Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    // Security Settings
    requireEmailVerification: true,
    enableTwoFactor: false,
    passwordStrengthRequirement: 'strong',
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    
    // Notification Settings
    emailNotifications: true,
    adminAlerts: true,
    userRegistrationNotify: true,
    suspiciousActivityAlerts: true,
    
    // System Settings
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    apiRateLimit: 100,
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [exportDialog, setExportDialog] = useState(false);

  const handleSettingChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleTextChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.value
    }));
  };

  const handleSelectChange = (setting: string) => (event: any) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.value
    }));
  };

  const handleSaveSettings = () => {
    // TODO: Implement API call to save settings
    setSuccess('Settings saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleExportData = (type: string) => {
    // TODO: Implement data export
    setSuccess(`${type} export started. You'll receive a download link via email.`);
    setExportDialog(false);
    setTimeout(() => setSuccess(''), 5000);
  };

  const systemInfo = [
    { label: 'Service Version', value: '2.0.0' },
    { label: 'Database Status', value: 'Connected', status: 'success' },
    { label: 'Cache Status', value: 'Active', status: 'success' },
    { label: 'Last Backup', value: '2 hours ago', status: 'success' },
    { label: 'Uptime', value: '15 days, 4 hours', status: 'info' },
    { label: 'Active Sessions', value: '23', status: 'info' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Configure system settings and preferences
      </Typography>

      {/* Alerts */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Security Settings" 
              avatar={<SecurityIcon color="primary" />}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.requireEmailVerification}
                      onChange={handleSettingChange('requireEmailVerification')}
                    />
                  }
                  label="Require Email Verification"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableTwoFactor}
                      onChange={handleSettingChange('enableTwoFactor')}
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />

                <FormControl fullWidth>
                  <InputLabel>Password Strength</InputLabel>
                  <Select
                    value={settings.passwordStrengthRequirement}
                    label="Password Strength"
                    onChange={handleSelectChange('passwordStrengthRequirement')}
                  >
                    <MenuItem value="weak">Weak (6+ characters)</MenuItem>
                    <MenuItem value="medium">Medium (8+ chars, mixed case)</MenuItem>
                    <MenuItem value="strong">Strong (8+ chars, mixed case, numbers, symbols)</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={handleTextChange('sessionTimeout')}
                  fullWidth
                />

                <TextField
                  label="Max Login Attempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={handleTextChange('maxLoginAttempts')}
                  fullWidth
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Notification Settings" 
              avatar={<NotificationsIcon color="primary" />}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={handleSettingChange('emailNotifications')}
                    />
                  }
                  label="Email Notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.adminAlerts}
                      onChange={handleSettingChange('adminAlerts')}
                    />
                  }
                  label="Admin Alerts"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.userRegistrationNotify}
                      onChange={handleSettingChange('userRegistrationNotify')}
                    />
                  }
                  label="New User Registration Notifications"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.suspiciousActivityAlerts}
                      onChange={handleSettingChange('suspiciousActivityAlerts')}
                    />
                  }
                  label="Suspicious Activity Alerts"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="System Settings" 
              avatar={<StorageIcon color="primary" />}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={handleSettingChange('maintenanceMode')}
                      color="warning"
                    />
                  }
                  label="Maintenance Mode"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.debugMode}
                      onChange={handleSettingChange('debugMode')}
                    />
                  }
                  label="Debug Mode"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.cacheEnabled}
                      onChange={handleSettingChange('cacheEnabled')}
                    />
                  }
                  label="Cache Enabled"
                />

                <TextField
                  label="API Rate Limit (requests/minute)"
                  type="number"
                  value={settings.apiRateLimit}
                  onChange={handleTextChange('apiRateLimit')}
                  fullWidth
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="System Information" 
              avatar={<ApiIcon color="primary" />}
              action={
                <IconButton onClick={() => window.location.reload()}>
                  <RefreshIcon />
                </IconButton>
              }
            />
            <CardContent>
              <List>
                {systemInfo.map((info, index) => (
                  <ListItem key={index} divider={index < systemInfo.length - 1}>
                    <ListItemText primary={info.label} />
                    <ListItemSecondaryAction>
                      <Chip
                        label={info.value}
                        color={info.status as any || 'default'}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Data Management" />
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Export user data, system logs, and configuration backups
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => setExportDialog(true)}
                >
                  Export Data
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  component="label"
                >
                  Import Configuration
                  <input type="file" hidden accept=".json,.csv" />
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => handleSaveSettings()}
                >
                  Backup Settings
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setError('Clear cache functionality would be implemented here')}
                >
                  Clear Cache
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSaveSettings}
              sx={{ minWidth: 200 }}
            >
              Save All Settings
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)}>
        <DialogTitle>Export Data</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            What data would you like to export?
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
            <Button variant="outlined" onClick={() => handleExportData('Users')}>
              Export All Users
            </Button>
            <Button variant="outlined" onClick={() => handleExportData('Activity Logs')}>
              Export Activity Logs
            </Button>
            <Button variant="outlined" onClick={() => handleExportData('System Configuration')}>
              Export System Configuration
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;