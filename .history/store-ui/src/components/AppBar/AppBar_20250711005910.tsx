// src/components/AppBar/AppBar.tsx (ENHANCED WITH MODERN LOGO & ANIMATIONS)
import * as React from 'react';
import { styled, alpha, useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MoreIcon from '@mui/icons-material/MoreVert';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ThemeContext from "../layout/ThemeContext";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate } from "react-router-dom";
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 10,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  backdrop: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
    transform: 'translateY(-1px)',
  },
  marginRight: theme.spacing(1),
  marginLeft: theme.spacing(1),
  width: '100%',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: 'auto',
    minWidth: '200px',
  },
  [theme.breakpoints.up('md')]: {
    minWidth: '300px',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: alpha(theme.palette.common.white, 0.7),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    fontSize: '0.9rem',
    '&::placeholder': {
      color: alpha(theme.palette.common.white, 0.7),
    },
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.05)',
  },
  '& .logo-icon': {
    fontSize: '2rem',
    marginRight: theme.spacing(1),
    background: 'linear-gradient(45deg, #ffffff, #e2e8f0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    [theme.breakpoints.up('sm')]: {
      fontSize: '2.2rem',
    },
  },
  '& .logo-text': {
    fontSize: '1.2rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    background: 'linear-gradient(45deg, #ffffff, #e2e8f0)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.4rem',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '1.6rem',
    },
  },
}));

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: alpha(theme.palette.common.white, 0.15),
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.2),
    transform: 'translateY(-1px)',
  },
}));

export default function PrimarySearchAppBar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { cartCount, toggleCartSidebar } = useCart();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: any) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    toggleCartSidebar();
  };

  const handleOrdersClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/orders');
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const searchQuery = formData.get('search') as string;
    if (searchQuery && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
    handleMenuClose();
  };

  const handleRegisterClick = () => {
    navigate('/register');
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const menuId = 'primary-search-account-menu';
  
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          mt: 1.5,
          minWidth: 200,
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)',
        },
      }}
    >
      {isAuthenticated ? (
        // Authenticated user menu
        [
          <MenuItem key="welcome" disabled sx={{ py: 2, opacity: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #2563eb, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Box>
              <Typography variant="body2" color="text.secondary" noWrap>
                Welcome, {user?.name || 'User'}
              </Typography>
            </Box>
          </MenuItem>,
          <MenuItem key="profile" onClick={() => { navigate('/profile'); handleMenuClose(); }} sx={{ py: 1.5 }}>
            <AccountCircle sx={{ mr: 2, color: 'primary.main' }} />
            My Profile
          </MenuItem>,
          <MenuItem key="orders" onClick={() => { navigate('/orders'); handleMenuClose(); }} sx={{ py: 1.5 }}>
            <ReceiptLongIcon sx={{ mr: 2, color: 'primary.main' }} />
            My Orders
          </MenuItem>,
          isAdmin && (
            <MenuItem key="admin-dashboard" onClick={() => { navigate('/admin'); handleMenuClose(); }} sx={{ py: 1.5 }}>
              <AdminPanelSettingsIcon sx={{ mr: 2, color: 'warning.main' }} />
              Admin Dashboard
            </MenuItem>
          ),
          <MenuItem key="logout" onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
            <LogoutIcon sx={{ mr: 2 }} />
            Logout
          </MenuItem>,
        ]
      ) : (
        // Guest user menu
        [
          <MenuItem key="login" onClick={handleLoginClick} sx={{ py: 1.5 }}>
            <LoginIcon sx={{ mr: 2, color: 'primary.main' }} />
            Sign In
          </MenuItem>,
          <MenuItem key="register" onClick={handleRegisterClick} sx={{ py: 1.5 }}>
            <PersonAddIcon sx={{ mr: 2, color: 'secondary.main' }} />
            Create Account
          </MenuItem>,
        ]
      )}
    </Menu>
  );

  const theme = useTheme();
  const colorMode = React.useContext(ThemeContext);

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          mt: 1.5,
          minWidth: 200,
        },
      }}
    >
      {isAuthenticated && (
        <MenuItem onClick={handleOrdersClick} sx={{ py: 2 }}>
          <IconButton size="large" color="inherit">
            <ReceiptLongIcon />
          </IconButton>
          <Typography sx={{ ml: 1 }}>My Orders</Typography>
        </MenuItem>
      )}
      <MenuItem onClick={handleCartClick} sx={{ py: 2 }}>
        <IconButton size="large" color="inherit">
          <Badge badgeContent={cartCount || 0} color="error" max={99}>
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <Typography sx={{ ml: 1 }}>
          Cart {!isAuthenticated && '(Login Required)'}
        </Typography>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen} sx={{ py: 2 }}>
        <IconButton size="large" color="inherit">
          <AccountCircle />
        </IconButton>
        <Typography sx={{ ml: 1 }}>
          {isAuthenticated ? 'Profile' : 'Account'}
        </Typography>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={0}>
        <Toolbar 
          sx={{ 
            px: { xs: 1, sm: 2 },
            minHeight: { xs: 64, sm: 70 },
          }}
        >
          {/* Logo - Enhanced with modern design */}
          <LogoContainer onClick={() => navigate('/')}>
            <StorefrontIcon className="logo-icon" />
            <Typography 
              variant="h6" 
              className="logo-text"
              sx={{ 
                display: { xs: 'none', sm: 'block' }
              }}
            >
              TechMart
            </Typography>
          </LogoContainer>
          
          {/* Search - Enhanced with blur effect */}
          <Box sx={{ 
            flexGrow: 1, 
            mx: { xs: 1, sm: 2, md: 3 },
            maxWidth: { xs: '150px', sm: '300px', md: '400px' }
          }}>
            <form onSubmit={handleSearchSubmit}>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  name="search"
                  placeholder="Search products..."
                  inputProps={{ 'aria-label': 'search' }}
                />
              </Search>
            </form>
          </Box>
          
          {/* Theme Toggle - Enhanced animation */}
          <AnimatedIconButton 
            onClick={colorMode.toggleColorMode} 
            color="inherit"
            size="medium"
            sx={{ mr: { xs: 0.5, sm: 1 } }}
          >
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </AnimatedIconButton>
          
          {/* Desktop Navigation - Enhanced buttons */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            {isAuthenticated ? (
              <>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mr: 1,
                    maxWidth: { md: '100px', lg: '120px' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: { xs: 'none', lg: 'block' },
                    opacity: 0.9,
                  }}
                >
                  Hi, {user?.name || 'User'}
                </Typography>
                <AnimatedButton 
                  color="inherit" 
                  onClick={handleOrdersClick}
                  startIcon={<ReceiptLongIcon />}
                  sx={{ mr: 0.5, minWidth: 'auto', px: 2 }}
                  size="small"
                >
                  Orders
                </AnimatedButton>
              </>
            ) : (
              <AnimatedButton 
                color="inherit" 
                onClick={handleLoginClick}
                startIcon={<LoginIcon />}
                sx={{ mr: 1, px: 2 }}
                size="small"
              >
                Login
              </AnimatedButton>
            )}
            
            <AnimatedIconButton
              size="large"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{ ml: 0.5 }}
            >
              <AccountCircle />
            </AnimatedIconButton>
            <AnimatedIconButton
              size="large"
              onClick={handleCartClick}
              color="inherit"
              title={!isAuthenticated ? 'Login required for cart' : 'View cart'}
              sx={{ ml: 0.5 }}
            >
              <Badge 
                badgeContent={cartCount || 0} 
                color="error" 
                max={99}
                sx={{
                  '& .MuiBadge-badge': {
                    background: 'linear-gradient(45deg, #dc2626, #ef4444)',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.7rem',
                  },
                }}
              >
                <ShoppingCartIcon />
              </Badge>
            </AnimatedIconButton>
          </Box>
          
          {/* Mobile Menu Button - Enhanced */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <AnimatedIconButton
              size="large"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </AnimatedIconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
}