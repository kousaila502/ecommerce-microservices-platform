// src/components/AppBar/AppBar.tsx (UPDATED VERSION)
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

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
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
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export default function PrimarySearchAppBar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

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
    navigate('/cart');
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

  const handleProfileClick = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleRegisterClick = () => {
    navigate('/register');
    handleMenuClose();
  };

  const handleLoginClick = () => {
    navigate('/login');
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
          <MenuItem key="welcome" disabled>
            <Typography variant="body2" color="text.secondary">
              Welcome, {user?.name}
            </Typography>
          </MenuItem>,
          <MenuItem key="profile" onClick={() => { navigate('/profile'); handleMenuClose(); }}>
            <AccountCircle sx={{ mr: 1 }} />
            My Profile
          </MenuItem>,
          <MenuItem key="orders" onClick={() => { navigate('/orders'); handleMenuClose(); }}>
            <ReceiptLongIcon sx={{ mr: 1 }} />
            My Orders
          </MenuItem>,
          isAdmin && (
            <MenuItem key="admin-dashboard" onClick={() => { navigate('/admin'); handleMenuClose(); }}>
              <AdminPanelSettingsIcon sx={{ mr: 1 }} />
              Admin Dashboard
            </MenuItem>
          ),
          <MenuItem key="logout" onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} />
            Logout
          </MenuItem>,
        ]
      ) : (
        // Guest user menu
        [
          <MenuItem key="login" onClick={handleLoginClick}>
            <LoginIcon sx={{ mr: 1 }} />
            Sign In
          </MenuItem>,
          <MenuItem key="register" onClick={handleRegisterClick}>
            <PersonAddIcon sx={{ mr: 1 }} />
            Create Account
          </MenuItem>,
        ]
      )}
    </Menu>
  );

  const theme = useTheme();
  const colorMode = React.useContext(ThemeContext);

  const renderThemeToggle = (
    <Box
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconButton sx={{ ml: 0 }} onClick={colorMode.toggleColorMode} color="inherit">
        {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Box>
  );

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
        <MenuItem onClick={handleOrdersClick}>
          <IconButton size="large" color="inherit">
            <ReceiptLongIcon />
          </IconButton>
          <Typography>My Orders</Typography>
        </MenuItem>
      )}
      <MenuItem onClick={handleCartClick}>
        <IconButton
          size="large"
          aria-label="shopping cart"
          color="inherit"
        >
          <Badge badgeContent={1} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <Typography>Cart {!isAuthenticated && '(Login Required)'}</Typography>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <Typography>{isAuthenticated ? 'Profile' : 'Account'}</Typography>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          {/* Removed the non-functional menu icon */}
          <Link href="/" variant="h5" underline="none"
            noWrap
            sx={{ 
              color: 'white', 
              display: 'flex', 
              justifyContent: 'flex-start', 
              alignItems: 'center',
              mr: 2
            }}>
            <img src="logo.png" width="32" height="32" alt="logo" />
            &nbsp;TechMart
          </Link>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ width: { xs: '50%', md: '40%' } }}>
            <form onSubmit={handleSearchSubmit}>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  name="search"
                  placeholder="Search for products ..."
                  inputProps={{ 'aria-label': 'search' }}
                />
              </Search>
            </form>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {renderThemeToggle}
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            {/* Desktop: Show auth status and navigation */}
            {isAuthenticated ? (
              <>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  Welcome, {user?.name}
                </Typography>
                <Button 
                  color="inherit" 
                  onClick={handleOrdersClick}
                  startIcon={<ReceiptLongIcon />}
                  sx={{ mr: 1 }}
                >
                  My Orders
                </Button>
              </>
            ) : (
              <Button 
                color="inherit" 
                onClick={handleLoginClick}
                startIcon={<LoginIcon />}
                sx={{ mr: 1 }}
              >
                Login
              </Button>
            )}
            
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <IconButton
              size="large"
              aria-label="shopping cart"
              color="inherit"
              onClick={handleCartClick}
              title={!isAuthenticated ? 'Login required for cart' : 'View cart'}
            >
              <Badge badgeContent={1} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
}