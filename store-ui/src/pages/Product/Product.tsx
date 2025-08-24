// src/pages/Product/Product.tsx (ULTRA-ENHANCED PROFESSIONAL VERSION)
import * as React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, Product } from "../../api/products";
import { addToCart, AddToCartPayload } from "../../api/cart";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";

// MUI
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Fade from '@mui/material/Fade';
import Slide from '@mui/material/Slide';
import Zoom from '@mui/material/Zoom';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Avatar from '@mui/material/Avatar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import ButtonGroup from '@mui/material/ButtonGroup';
import useTheme from '@mui/material/styles/useTheme';
import { alpha } from '@mui/material/styles';

// Icons
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaidIcon from '@mui/icons-material/Paid';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import InventoryIcon from '@mui/icons-material/Inventory';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedIcon from '@mui/icons-material/Verified';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import TimerIcon from '@mui/icons-material/Timer';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, token, isAuthenticated } = useAuth();
  const { addToCart: addToCartContext } = useCart();

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [addingToCart, setAddingToCart] = React.useState(false);
  const [buyingNow, setBuyingNow] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);
  const [imageZoomed, setImageZoomed] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const onQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 1)) setQuantity(value);
  };

  const handleAdd = () => {
    if (quantity < (product?.stock || 1)) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleMinus = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    setSnackbar({
      open: true,
      message: isFavorite ? 'Removed from wishlist ❤️' : 'Added to wishlist! ❤️',
      severity: 'success'
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product?.title,
        text: `Check out this amazing product: ${product?.title}`,
        url: window.location.href,
      });
    } catch (err) {
      navigator.clipboard.writeText(window.location.href);
      setSnackbar({
        open: true,
        message: '🔗 Product link copied to clipboard!',
        severity: 'success'
      });
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!product || !user || !token) return;

    setAddingToCart(true);
    try {
      await addToCartContext({
        productId: product._id,
        sku: product.sku,
        title: product.title,
        price: product.price,
        currency: product.currency,
        quantity,
      });

      setSnackbar({
        open: true,
        message: `🛒 Added ${quantity} item(s) to cart successfully!`,
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: '❌ Error adding item to cart',
        severity: 'error'
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!product || !user) return;

    setBuyingNow(true);
    try {
      await addToCartContext({
        productId: product._id,
        sku: product.sku,
        title: product.title,
        price: product.price,
        currency: product.currency,
        quantity,
      });

      navigate('/cart', {
        state: {
          buyNow: true,
          directPurchase: true
        }
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: '❌ Error processing purchase',
        severity: 'error'
      });
    } finally {
      setBuyingNow(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStockLevel = () => {
    if (!product) return 'unknown';
    if (product.stock === 0) return 'out';
    if (product.stock <= 5) return 'low';
    if (product.stock <= 20) return 'medium';
    return 'high';
  };

  const getStockColor = (): 'error' | 'warning' | 'info' | 'success' => {
    const level = getStockLevel();
    switch (level) {
      case 'out': return 'error';
      case 'low': return 'warning';
      case 'medium': return 'info';
      case 'high': return 'success';
      default: return 'info';
    }
  };

  const getStockMessage = () => {
    const level = getStockLevel();
    switch (level) {
      case 'out': return 'Out of Stock';
      case 'low': return 'Only few left!';
      case 'medium': return 'Limited Stock';
      case 'high': return 'In Stock';
      default: return 'Stock Unknown';
    }
  };

  const calculateStockPercentage = () => {
    if (!product) return 0;
    const maxStock = 100;
    return Math.min((product.stock / maxStock) * 100, 100);
  };

  const calculateSavings = () => {
    // Remove this function since originalPrice doesn't exist
    return 0;
  };

  const getProductImage = () => {
    if (product?.image && product.image.startsWith('http')) {
      return product.image;
    }
    
    // Category-based fallback images
    const categoryImages: { [key: string]: string } = {
      'Smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop',
      'Laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop',
      'Cameras': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&h=500&fit=crop',
      'Gaming Consoles': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=500&fit=crop',
      'Smart Watches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
      'Headphones & Speakers': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    };

    return categoryImages[product?.category || ''] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop';
  };

  React.useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is missing');
        setLoading(false);
        return;
      }

      try {
        const productId = parseInt(id);
        const result = await getProductById(productId);
        if (result) {
          setProduct(result);
        } else {
          setError('Product not found');
        }
      } catch {
        setError('Error loading product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Loading Skeleton */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3, mb: 2 }} />
              <Stack direction="row" spacing={1}>
                {Array.from(new Array(4)).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" width={80} height={60} sx={{ borderRadius: 1 }} />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" width="80%" height={60} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="40%" height={50} sx={{ mb: 3 }} />
              <Skeleton variant="rectangular" height={100} sx={{ mb: 3, borderRadius: 2 }} />
              <Stack spacing={2}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Go Back
        </Button>
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error || 'Product not found'}
          </Alert>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link 
            component="button" 
            variant="body2" 
            onClick={() => navigate('/')}
            sx={{ textDecoration: 'none' }}
          >
            Home
          </Link>
          <Link 
            component="button" 
            variant="body2" 
            onClick={() => navigate('/products')}
            sx={{ textDecoration: 'none' }}
          >
            Products
          </Link>
          <Typography variant="body2" color="text.primary">
            {product.category}
          </Typography>
          <Typography variant="body2" color="text.primary" noWrap sx={{ maxWidth: 200 }}>
            {product.title}
          </Typography>
        </Breadcrumbs>

        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ 
            mb: 4,
            '&:hover': { transform: 'translateX(-4px)' },
            transition: 'transform 0.2s ease',
          }}
        >
          Back to Products
        </Button>

        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              mb: 4,
            }}
          >
            <Grid container spacing={0}>
              {/* Product Image Section */}
              <Grid item xs={12} md={6}>
                <Slide direction="right" in timeout={600}>
                  <Box sx={{ p: 4, bgcolor: 'background.paper' }}>
                    {/* Main Product Image */}
                    <Card sx={{
                      width: '100%',
                      height: 500,
                      borderRadius: 3,
                      mb: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'zoom-in',
                      '&:hover': {
                        '& .product-image': {
                          transform: 'scale(1.05)',
                        },
                        '& .zoom-overlay': {
                          opacity: 1,
                        }
                      }
                    }}>
                      <CardMedia
                        className="product-image"
                        component="img"
                        image={getProductImage()}
                        alt={product.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease'
                        }}
                        onClick={() => setImageZoomed(true)}
                      />

                      {/* Zoom Overlay */}
                      <Box
                        className="zoom-overlay"
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          bgcolor: 'rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        }}
                      >
                        <ZoomInIcon sx={{ fontSize: 48, color: 'white' }} />
                      </Box>

                      {/* Product Badges */}
                      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
                        <Stack spacing={1}>
                          {product.stock === 0 ? (
                            <Chip label="Out of Stock" color="error" size="small" />
                          ) : product.stock <= 5 ? (
                            <Chip 
                              label={`Only ${product.stock} left!`} 
                              color="warning" 
                              size="small"
                              icon={<TimerIcon />}
                            />
                          ) : (
                            <Chip label="In Stock" color="success" size="small" />
                          )}
                          
                          {product.rating >= 4.5 && (
                            <Chip 
                              label="Top Rated" 
                              color="info" 
                              size="small"
                              icon={<TrendingUpIcon />}
                            />
                          )}
                        </Stack>
                      </Box>

                      {/* Discount Badge - Removed since originalPrice doesn't exist */}
                      {false && (
                        <Chip
                          label={`Save ${calculateSavings()}%`}
                          color="error"
                          size="small"
                          icon={<LocalOfferIcon />}
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                          }}
                        />
                      )}
                    </Card>

                    {/* Thumbnail Images */}
                    <Stack direction="row" spacing={1} sx={{ overflowX: 'auto' }}>
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Card
                          key={index}
                          sx={{
                            minWidth: 80,
                            height: 80,
                            borderRadius: 2,
                            cursor: 'pointer',
                            border: index === 0 ? 2 : 1,
                            borderColor: index === 0 ? 'primary.main' : 'divider',
                            '&:hover': { borderColor: 'primary.main' }
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={getProductImage()}
                            alt={`${product.title} view ${index + 1}`}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Card>
                      ))}
                    </Stack>

                    {/* Product Trust Indicators */}
                    <Paper sx={{ p: 3, mt: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <LocalShippingIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="caption" display="block" fontWeight="bold">
                              Free Shipping
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Orders over $50
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <SecurityIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="caption" display="block" fontWeight="bold">
                              Secure Payment
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              SSL Protected
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <AutorenewIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="caption" display="block" fontWeight="bold">
                              Easy Returns
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              30-day policy
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                </Slide>
              </Grid>

              {/* Product Details Section */}
              <Grid item xs={12} md={6}>
                <Slide direction="left" in timeout={800}>
                  <Box sx={{ p: 4, height: '100%' }}>
                    {/* Brand and Verified Badge */}
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      {product.brand && (
                        <Chip
                          label={product.brand}
                          color="primary"
                          variant="outlined"
                          icon={<VerifiedIcon />}
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                      <Chip
                        label={product.category}
                        variant="outlined"
                        size="small"
                      />
                    </Stack>

                    {/* Product Title */}
                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      gutterBottom
                      sx={{
                        fontSize: { xs: '1.8rem', md: '2.5rem' },
                        background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: 1.2,
                        mb: 2,
                      }}
                    >
                      {product.title}
                    </Typography>

                    {/* Rating and Reviews */}
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                      <Rating value={product.rating} precision={0.1} readOnly />
                      <Typography variant="body1" fontWeight="medium">
                        {product.rating?.toFixed(1)} out of 5
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({Math.floor(Math.random() * 500) + 50} reviews)
                      </Typography>
                      <Chip 
                        label="Bestseller" 
                        color="success" 
                        size="small" 
                        icon={<ThumbUpIcon />}
                      />
                    </Stack>

                    {/* Price Section */}
                    <Paper sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 3 }}>
                      <Stack direction="row" alignItems="baseline" spacing={2}>
                        <Typography
                          variant="h2"
                          color="success.main"
                          fontWeight="bold"
                          sx={{ fontSize: '2.5rem' }}
                        >
                          ${product.price}
                        </Typography>
                        {/* Removed originalPrice section since it doesn't exist */}
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Price includes all taxes • Free shipping on orders over $50
                      </Typography>
                    </Paper>

                    {/* Stock Status */}
                    <Paper sx={{ 
                      p: 2, 
                      mb: 3, 
                      bgcolor: alpha(theme.palette[getStockColor()].main, 0.1),
                      border: 1,
                      borderColor: alpha(theme.palette[getStockColor()].main, 0.3),
                      borderRadius: 2 
                    }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <InventoryIcon color={getStockColor() as any} />
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            color={`${getStockColor()}.main`}
                            fontWeight="bold"
                          >
                            {getStockMessage()}
                          </Typography>
                          {product.stock > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              {product.stock} units available
                            </Typography>
                          )}
                        </Box>
                        {product.stock > 0 && product.stock <= 20 && (
                          <Chip 
                            label="Hurry!" 
                            color="warning" 
                            size="small"
                            icon={<TimerIcon />}
                          />
                        )}
                      </Stack>
                      {product.stock > 0 && (
                        <LinearProgress
                          variant="determinate"
                          value={calculateStockPercentage()}
                          color={getStockColor() as any}
                          sx={{ height: 8, borderRadius: 4, mt: 1 }}
                        />
                      )}
                    </Paper>

                    {/* Description */}
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                      sx={{ lineHeight: 1.8, mb: 3 }}
                    >
                      {product.description || "Experience premium quality and exceptional performance with this carefully crafted product. Designed with attention to detail and built to exceed expectations."}
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    {/* Quantity Selector */}
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Quantity:
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <ButtonGroup variant="outlined" size="large">
                          <IconButton
                            onClick={handleMinus}
                            disabled={quantity <= 1}
                            sx={{ borderRadius: '12px 0 0 12px' }}
                          >
                            <RemoveCircleIcon />
                          </IconButton>
                          
                          <TextField
                            size="small"
                            value={quantity}
                            onChange={onQuantityChange}
                            inputProps={{ 
                              min: 1, 
                              max: product.stock,
                              style: { textAlign: 'center', width: 60 }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 0,
                                '& fieldset': {
                                  borderLeft: 'none',
                                  borderRight: 'none',
                                }
                              }
                            }}
                          />
                          
                          <IconButton
                            onClick={handleAdd}
                            disabled={quantity >= product.stock}
                            sx={{ borderRadius: '0 12px 12px 0' }}
                          >
                            <AddCircleIcon />
                          </IconButton>
                        </ButtonGroup>

                        <Typography variant="body2" color="text.secondary">
                          Max: {product.stock} units
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Action Buttons */}
                    <Stack spacing={2} sx={{ mb: 3 }}>
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        startIcon={buyingNow ? <CircularProgress size={20} color="inherit" /> : <PaidIcon />}
                        onClick={handleBuyNow}
                        disabled={buyingNow || product.stock === 0 || !isAuthenticated}
                        sx={{
                          py: 2,
                          borderRadius: 3,
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #FF5252, #FF7043)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 24px rgba(255,107,107,0.4)',
                          },
                          '&:disabled': {
                            background: alpha(theme.palette.grey[400], 0.5),
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {buyingNow ? 'Processing...' : 'Buy Now - Fast Checkout'}
                      </Button>

                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        startIcon={addingToCart ? <CircularProgress size={20} /> : <ShoppingCartIcon />}
                        onClick={handleAddToCart}
                        disabled={addingToCart || product.stock === 0}
                        sx={{
                          py: 2,
                          borderRadius: 3,
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 24px rgba(33,150,243,0.3)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
                      </Button>
                    </Stack>

                    {/* Secondary Actions */}
                    <Stack direction="row" spacing={2} sx={{ mb: 3 }} justifyContent="center">
                      <Tooltip title={isFavorite ? "Remove from wishlist" : "Add to wishlist"}>
                        <IconButton
                          onClick={handleFavoriteToggle}
                          color={isFavorite ? "error" : "default"}
                          size="large"
                          sx={{
                            bgcolor: alpha(theme.palette.grey[100], 0.5),
                            '&:hover': { 
                              transform: 'scale(1.1)',
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Share this product">
                        <IconButton
                          onClick={handleShare}
                          size="large"
                          sx={{
                            bgcolor: alpha(theme.palette.grey[100], 0.5),
                            '&:hover': { 
                              transform: 'scale(1.1)',
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Compare products">
                        <IconButton
                          size="large"
                          sx={{
                            bgcolor: alpha(theme.palette.grey[100], 0.5),
                            '&:hover': { 
                              transform: 'scale(1.1)',
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <CompareArrowsIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Need help?">
                        <IconButton
                          size="large"
                          sx={{
                            bgcolor: alpha(theme.palette.grey[100], 0.5),
                            '&:hover': { 
                              transform: 'scale(1.1)',
                              bgcolor: alpha(theme.palette.warning.main, 0.1),
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <HelpOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    {/* Quick Actions */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <Button
                          variant="text"
                          startIcon={<GroupIcon />}
                          fullWidth
                          sx={{ justifyContent: 'flex-start' }}
                        >
                          View Similar Products
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="text"
                          startIcon={<SupportAgentIcon />}
                          fullWidth
                          sx={{ justifyContent: 'flex-start' }}
                        >
                          Contact Support
                        </Button>
                      </Grid>
                    </Grid>

                    {/* Login prompt for non-authenticated users */}
                    {!isAuthenticated && (
                      <Alert
                        severity="info"
                        sx={{
                          borderRadius: 3,
                          '& .MuiAlert-message': {
                            width: '100%'
                          }
                        }}
                      >
                        <Typography variant="body2">
                          Please{' '}
                          <Button
                            onClick={() => navigate('/login')}
                            size="small"
                            sx={{ mx: 0.5, textTransform: 'none', fontWeight: 'bold' }}
                          >
                            sign in
                          </Button>
                          to purchase items or add them to your cart.
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </Slide>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Product Details Tabs */}
        <Fade in timeout={1000}>
          <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  }
                }}
              >
                <Tab label="Product Details" />
                <Tab label="Specifications" />
                <Tab label="Reviews" />
                <Tab label="Shipping & Returns" />
                <Tab label="FAQ" />
              </Tabs>
            </Box>

            <Box sx={{ p: 4 }}>
              <TabPanel value={activeTab} index={0}>
                {/* Product Details */}
                <Grid container spacing={4}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      Product Overview
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                      {product.description || "This premium product combines cutting-edge technology with exceptional design. Crafted with attention to detail and built to deliver outstanding performance, it represents the perfect balance of functionality and style."}
                    </Typography>
                    
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                      Key Features
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                        <ListItemText primary="Premium Quality Materials" secondary="Built to last with high-grade components" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                        <ListItemText primary="Advanced Technology" secondary="Latest innovations for optimal performance" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                        <ListItemText primary="User-Friendly Design" secondary="Intuitive interface and ergonomic construction" />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
                        <ListItemText primary="Warranty Included" secondary="Comprehensive coverage for peace of mind" />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Product Information
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">SKU</Typography>
                          <Typography variant="body1" fontWeight="medium">{product.sku}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                          <Typography variant="body1" fontWeight="medium">{product.category}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Brand</Typography>
                          <Typography variant="body1" fontWeight="medium">{product.brand || 'Premium Brand'}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Availability</Typography>
                          <Typography variant="body1" fontWeight="medium" color={product.stock > 0 ? 'success.main' : 'error.main'}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                {/* Specifications */}
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Technical Specifications
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem divider>
                        <ListItemText primary="Model" secondary={product.title} />
                      </ListItem>
                      <ListItem divider>
                        <ListItemText primary="SKU" secondary={product.sku} />
                      </ListItem>
                      <ListItem divider>
                        <ListItemText primary="Category" secondary={product.category} />
                      </ListItem>
                      <ListItem divider>
                        <ListItemText primary="Brand" secondary={product.brand || 'Premium Brand'} />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem divider>
                        <ListItemText primary="Weight" secondary="Optimized for portability" />
                      </ListItem>
                      <ListItem divider>
                        <ListItemText primary="Dimensions" secondary="Compact and ergonomic" />
                      </ListItem>
                      <ListItem divider>
                        <ListItemText primary="Material" secondary="Premium quality materials" />
                      </ListItem>
                      <ListItem divider>
                        <ListItemText primary="Warranty" secondary="1-year manufacturer warranty" />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                {/* Reviews */}
                <Box sx={{ mb: 4 }}>
                  <Stack direction="row" spacing={4} alignItems="center">
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h2" fontWeight="bold" color="primary.main">
                        {product.rating?.toFixed(1)}
                      </Typography>
                      <Rating value={product.rating} precision={0.1} readOnly size="large" />
                      <Typography variant="body2" color="text.secondary">
                        Based on {Math.floor(Math.random() * 500) + 50} reviews
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <Stack key={stars} direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ minWidth: 60 }}>
                            {stars} stars
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 7 : stars === 2 ? 2 : 1} 
                            sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                            {stars === 5 ? '70%' : stars === 4 ? '20%' : stars === 3 ? '7%' : stars === 2 ? '2%' : '1%'}
                          </Typography>
                        </Stack>
                      ))}
                    </Box>
                  </Stack>
                </Box>

                {/* Sample Reviews */}
                <Stack spacing={3}>
                  {[
                    { name: 'John D.', rating: 5, comment: 'Excellent product! Exceeded my expectations in every way.', date: '2 days ago' },
                    { name: 'Sarah M.', rating: 4, comment: 'Great quality and fast shipping. Highly recommended!', date: '1 week ago' },
                    { name: 'Mike R.', rating: 5, comment: 'Outstanding build quality and performance. Worth every penny.', date: '2 weeks ago' },
                  ].map((review, index) => (
                    <Paper key={index} sx={{ p: 3, borderRadius: 3 }}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {review.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {review.name}
                            </Typography>
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography variant="caption" color="text.secondary">
                              {review.date}
                            </Typography>
                          </Stack>
                          <Typography variant="body1">
                            {review.comment}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                {/* Shipping & Returns */}
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Shipping Information
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon><LocalShippingIcon color="primary" /></ListItemIcon>
                        <ListItemText 
                          primary="Free Standard Shipping" 
                          secondary="On orders over $50 (5-7 business days)" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><FlashOnIcon color="warning" /></ListItemIcon>
                        <ListItemText 
                          primary="Express Shipping" 
                          secondary="$9.99 (2-3 business days)" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><TimerIcon color="error" /></ListItemIcon>
                        <ListItemText 
                          primary="Next Day Delivery" 
                          secondary="$19.99 (Order by 2 PM)" 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Returns & Exchanges
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon><AutorenewIcon color="success" /></ListItemIcon>
                        <ListItemText 
                          primary="30-Day Return Policy" 
                          secondary="Free returns on all orders" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><SecurityIcon color="info" /></ListItemIcon>
                        <ListItemText 
                          primary="Satisfaction Guarantee" 
                          secondary="100% money-back guarantee" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><SupportAgentIcon color="primary" /></ListItemIcon>
                        <ListItemText 
                          primary="Customer Support" 
                          secondary="24/7 support for all inquiries" 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={activeTab} index={4}>
                {/* FAQ */}
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Frequently Asked Questions
                </Typography>
                <Stack spacing={2}>
                  {[
                    { q: 'What is the warranty period?', a: 'This product comes with a 1-year manufacturer warranty covering defects and malfunctions.' },
                    { q: 'Is international shipping available?', a: 'Yes, we ship worldwide. International shipping rates and delivery times vary by location.' },
                    { q: 'Can I return the product if I\'m not satisfied?', a: 'Absolutely! We offer a 30-day return policy with free returns on all orders.' },
                    { q: 'How do I track my order?', a: 'Once your order ships, you\'ll receive a tracking number via email to monitor your package.' },
                    { q: 'Are there volume discounts available?', a: 'Yes, we offer bulk pricing for orders of 10+ units. Contact our sales team for details.' },
                  ].map((faq, index) => (
                    <Accordion key={index} sx={{ borderRadius: 2, '&:before': { display: 'none' } }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {faq.q}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body1" color="text.secondary">
                          {faq.a}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </TabPanel>
            </Box>
          </Paper>
        </Fade>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ 
              width: '100%', 
              borderRadius: 3,
              fontSize: '1rem',
              '& .MuiAlert-icon': {
                fontSize: '1.5rem',
              }
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ProductPage;