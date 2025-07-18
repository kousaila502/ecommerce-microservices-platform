// src/components/Admin/UserDetailsModal.tsx (NEW FILE)
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, Grid, Card, CardContent, Chip, Avatar,
  List, ListItem, ListItemText, Divider, Alert, CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  AdminPanelSettings as AdminIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

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

interface Session {
  id: number;
  user_id: number;
  login_time: string;
  logout_time?: string;
  ip_address?: string;
  is_active: boolean;
}

interface UserDetailsModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ open, user, onClose }) => {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchUserSessions();
    }
  }, [open, user]);

  const fetchUserSessions = async () => {
    if (!token || !user) return;

    try {
      setLoadingSessions(true);
      const response = await fetch(`${adminUrl}/${user.id}/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Failed to fetch user sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
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

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: user.role === 'admin' ? 'warning.main' : 'primary.main' }}>
            {user.role === 'admin' ? <AdminIcon /> : <PersonIcon />}
          </Avatar>
          <Box>
            <Typography variant="h6">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              User ID: {user.id}
            </Typography>
          </Box>
          <Chip
            label={user.status}
            color={getStatusColor(user.status) as any}
            sx={{ ml: 'auto' }}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <List>
                  <ListItem>
                    <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText 
                      primary="Email" 
                      secondary={user.email}
                    />
                    {user.is_email_verified && (
                      <CheckCircle sx={{ color: 'success.main' }} />
                    )}
                  </ListItem>
                  <ListItem>
                    <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText 
                      primary="Mobile" 
                      secondary={user.mobile}
                    />
                  </ListItem>
                  <ListItem>
                    <AdminIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText 
                      primary="Role" 
                      secondary={user.role}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Details */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Details
                </Typography>
                <List>
                  <ListItem>
                    <ScheduleIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText 
                      primary="Created" 
                      secondary={formatDate(user.created_at)}
                    />
                  </ListItem>
                  <ListItem>
                    <ScheduleIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <ListItemText 
                      primary="Last Login" 
                      secondary={user.last_login ? formatDate(user.last_login) : 'Never'}
                    />
                  </ListItem>
                  {user.blocked_at && (
                    <ListItem>
                      <BlockIcon sx={{ mr: 2, color: 'error.main' }} />
                      <ListItemText 
                        primary="Blocked At" 
                        secondary={formatDate(user.blocked_at)}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Block Reason (if blocked) */}
          {user.blocked_reason && (
            <Grid item xs={12}>
              <Alert severity="warning">
                <Typography variant="body2" fontWeight="medium">
                  Block Reason:
                </Typography>
                <Typography variant="body2">
                  {user.blocked_reason}
                </Typography>
              </Alert>
            </Grid>
          )}

          {/* Active Sessions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Active Sessions
                </Typography>
                {loadingSessions ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : sessions.length > 0 ? (
                  <List>
                    {sessions.map((session, index) => (
                      <React.Fragment key={session.id}>
                        <ListItem>
                          <ListItemText
                            primary={`Session ${session.id}`}
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  Login: {formatDate(session.login_time)}
                                </Typography>
                                {session.ip_address && (
                                  <Typography variant="body2">
                                    IP: {session.ip_address}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <Chip
                            label={session.is_active ? 'Active' : 'Ended'}
                            color={session.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </ListItem>
                        {index < sessions.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No active sessions found
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailsModal;