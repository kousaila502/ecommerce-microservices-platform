// src/components/AppBar/AppBar.tsx (UPDATED WITH CART SIDEBAR)
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
import ThemeContext from "../layout/ThemeContext";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useNavigate } from "react-router-dom";
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import CartSidebar from '../Cart/CartSidebar';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(1),
  marginLeft: theme.spacing(1),
  width: '100%',
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
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
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
  '& img': {
    width: '28px',
    height: '28px',
    [theme.breakpoints.up('sm')]: {
      width: '32px',
      height: '32px',
    },
  },
  '& .logo-text': {
    fontSize: '1.1rem',
    fontWeight: 600,
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.25rem',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '1.5rem',
    },
  },
}));

export default function PrimarySearchAppBar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { cartCount, toggleCartSidebar, isCartSidebarOpen, closeCartSidebar } = useCart();

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
    >
      {isAuthenticated ? (
        // Authenticated user menu
        [
          <MenuItem key="welcome" disabled sx={{ py: 2 }}>
            <Typography variant="body2" color="text.secondary" noWrap>
              Welcome, {user?.name || 'User'}
            </Typography>
          </MenuItem>,
          <MenuItem key="profile" onClick={() => { navigate('/profile'); handleMenuClose(); }}>
            <AccountCircle sx={{ mr: 2 }} />
            My Profile
          </MenuItem>,
          <MenuItem key="orders" onClick={() => { navigate('/orders'); handleMenuClose(); }}>
            <ReceiptLongIcon sx={{ mr: 2 }} />
            My Orders
          </MenuItem>,
          isAdmin && (
            <MenuItem key="admin-dashboard" onClick={() => { navigate('/admin'); handleMenuClose(); }}>
              <AdminPanelSettingsIcon sx={{ mr: 2 }} />
              Admin Dashboard
            </MenuItem>
          ),
          <MenuItem key="logout" onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 2 }} />
            Logout
          </MenuItem>,
        ]
      ) : (
        // Guest user menu
        [
          <MenuItem key="login" onClick={handleLoginClick}>
            <LoginIcon sx={{ mr: 2 }} />
            Sign In
          </MenuItem>,
          <MenuItem key="register" onClick={handleRegisterClick}>
            <PersonAddIcon sx={{ mr: 2 }} />
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
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar 
            sx={{ 
              px: { xs: 1, sm: 2 },
              minHeight: { xs: 56, sm: 64 },
            }}
          >
            {/* Logo - Responsive sizing */}
            <LogoContainer>
              <Link