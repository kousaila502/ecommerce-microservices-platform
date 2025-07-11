// src/components/Cart/CartSidebar.tsx (FIXED VERSION - SIMPLIFIED)
import React, { useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Badge,
  Alert,
  CircularProgress,
  Fade,
} from '@mui/material';
import {
  Close as CloseIcon,
  ShoppingCart as CartIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingBag as CheckoutIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
  onCartUpdate?: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ open, onClose, onCartUpdate }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { 
    cart, 
    loading, 
    error, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    refreshCart 
  } = useCart();

  // Refresh cart when sidebar opens
  useEffect(() => {
    if (open && isAuthenticated) {
      refreshCart();
    }
  }, [open, isAuthenticated, refreshCart]);

  const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
    try {
      await updateCartItem(productId, newQuantity);
      onCartUpdate?.();
    } catch (err: any) {
      console.error('Failed to update quantity:', err.message);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    try {
      await removeFromCart(productId);
      onCartUpdate?.();
    } catch (err: any) {
      console.error('Failed to remove item:', err.message);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      onCartUpdate?.();
    } catch (err: any) {
      console.error('Failed to clear cart:', err.message);
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/cart'); // Go to full cart page for checkout
  };

  const handleViewFullCart = () => {
    onClose();
    navigate('/cart');
  };

  if (!isAuthenticated) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100vw', sm: 400 },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          },
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <CartIcon sx={{ fontSize: 64, mb: 2, opacity: 0.7 }} />
          <Typography variant="h5" gutterBottom>
            Sign In Required
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Please sign in to view your shopping cart
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              onClose();
              navigate('/login');
            }}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            }}
          >
            Sign In
          </Button>
        </Box>
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100vw', sm: 420 },
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CartIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              Shopping Cart
            </Typography>
            {cart && cart.items.length > 0 && (
              <Chip 
                label={cart.items.length} 
                size="small" 
                color="primary" 
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <Button onClick={refreshCart} variant="outlined" size="small">
                Retry
              </Button>
            </Box>
          ) : !cart || cart.items.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <CartIcon sx={{ fontSize: 64, mb: 2, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Your cart is empty
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                Add some products to get started
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  onClose();
                  navigate('/');
                }}
                startIcon={<ArrowIcon />}
              >
                Continue Shopping
              </Button>
            </Box>
          ) : (
            <List sx={{ px: 1 }}>
              {cart.items.map((item, index) => (
                <Fade in key={`${item.productId}-${item.sku}`} timeout={300 + index * 100}>
                  <ListItem
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                      '&:hover': { bgcolor: 'action.hover' },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        variant="rounded"
                        sx={{
                          width: 60,
                          height: 60,
                          bgcolor: 'primary.main',
                          fontSize: '0.8rem',
                        }}
                      >
                        {item.title.substring(0, 2)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="medium" noWrap>
                          {item.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            SKU: {item.sku}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary.main">
                            ${item.price.toFixed(2)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          disabled={loading}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ mx: 1, minWidth: 20, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          disabled={loading}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={loading}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                </Fade>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Total:
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                ${cart.total.toFixed(2)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleViewFullCart}
                size="small"
              >
                View Cart
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleCheckout}
                startIcon={<CheckoutIcon />}
                size="small"
              >
                Checkout
              </Button>
            </Box>
            
            <Button
              variant="text"
              fullWidth
              onClick={handleClearCart}
              size="small"
              color="error"
              disabled={loading}
            >
              Clear Cart
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CartSidebar;