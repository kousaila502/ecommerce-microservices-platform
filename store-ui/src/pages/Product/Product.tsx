// src/pages/Product/Product.tsx (ENHANCED PROFESSIONAL VERSION)
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
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';

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

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const { addToCart: addToCartContext } = useCart();

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [addingToCart, setAddingToCart] = React.useState(false);
  const [buyingNow, setBuyingNow] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);
  const [isFavorite, setIsFavorite] = React.useState(false);
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
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      severity: 'success'
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product?.title,
        text: product?.description,
        url: window.location.href,
      });
    } catch (err) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      setSnackbar({
        open: true,
        message: 'Product link copied to clipboard!',
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
      const item: AddToCartPayload = {
        productId: product._id,
        sku: product.sku,
        title: product.title,
        quantity,
        price: product.price,
        currency: product.currency
      };

      const result = await addToCart(user.id, item, token);
      if (result) {
        try {
          await addToCartContext({
            productId: product._id,
            sku: product.sku,
            title: product.title,
            price: product.price,
            currency: product.currency,
            quantity,
          });
        } catch (contextError) {
          console.warn('Cart context update failed:', contextError);
        }
        
        setSnackbar({
          open: true,
          message: `Added ${quantity} item(s) to cart!`,
          severity: 'success'
        });
      } else {
        setError('Failed to add item to cart.');
        setSnackbar({
          open: true,
          message: 'Failed to add item to cart',
          severity: 'error'
        });
      }
    } catch (err) {
      setError('Error adding item to cart.');
      setSnackbar({
        open: true,
        message: 'Error adding item to cart',
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
      const item: AddToCartPayload = {
        productId: product._id,
        sku: product.sku,
        title: product.title,
        quantity,
        price: product.price,
        currency: product.currency
      };

      if (token) {
        const result = await addToCart(user.id, item, token);
        if (result) {
          navigate('/cart', { 
            state: { 
              buyNow: true,
              directPurchase: true
            } 
          });
        } else {
          setSnackbar({
            open: true,
            message: 'Failed to process purchase',
            severity: 'error'
          });
        }
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error processing purchase',
        severity: 'error'
      });
    } finally {
      setBuyingNow(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStockLevel = () => {
    if (!product) return 'unknown';
    if (product.stock === 0) return 'out';
    if (product.stock <= 5) return 'low';
    return 'good';
  };

  const getStockColor = () => {
    const level = getStockLevel();
    switch (level) {
      case 'out': return 'error';
      case 'low': return 'warning';
      case 'good': return 'success';
      default: return 'default';
    }
  };

  const calculateStockPercentage = () => {
    if (!product) return 0;
    const maxStock = 100; // Assume max stock for visualization
    return Math.min((product.stock / maxStock) * 100, 100);
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading product details...
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Go Back
        </Button>
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Go Back
        </Button>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>Product not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 3, '&:hover': { transform: 'translateX(-4px)' } }}
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
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
          }}
        >
          <Grid container spacing={0}>
            {/* Product Image Section */}
            <Grid item xs={12} md={6}>
              <Slide direction="right" in timeout={600}>
                <Box sx={{ 
                  p: 4, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  height: '100%',
                  bgcolor: 'background.paper'
                }}>
                  
                  {/* Product Image */}
                  <Card sx={{ 
                    width: '100%', 
                    maxWidth: 400, 
                    height: 350, 
                    borderRadius: 3,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.50',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      '& .product-image': {
                        transform: 'scale(1.05)',
                      }
                    }
                  }}>
                    {product.image ? (
                      <CardMedia
                        className="product-image"
                        component="img"
                        image={product.image}
                        alt={product.title}
                        sx={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                      />
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        color: 'white',
                        width: '100%'
                      }}>
                        <Typography variant="h1" fontWeight="bold">
                          {product.title.split(' ').map(word => word[0]).join('').substring(0, 2)}
                        </Typography>
                      </Box>
                    )}

                    {/* Stock Badge */}
                    <Chip
                      label={product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      color={getStockColor()}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontWeight: 'bold',
                        bgcolor: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                  </Card>

                  {/* Brand and Rating */}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Rating value={product.rating} precision={0.1} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" fontWeight="medium">
                        ({product.rating.toFixed(1)})
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Product Features */}
                  <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, width: '100%' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <LocalShippingIcon color="primary" sx={{ mb: 0.5 }} />
                          <Typography variant="caption" display="block">Free Shipping</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <SecurityIcon color="primary" sx={{ mb: 0.5 }} />
                          <Typography variant="caption" display="block">Secure Payment</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <AutorenewIcon color="primary" sx={{ mb: 0.5 }} />
                          <Typography variant="caption" display="block">Easy Returns</Typography>
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
                <Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Product Title */}
                  <Typography 
                    variant="h3" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{ 
                      background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      lineHeight: 1.2
                    }}
                  >
                    {product.title}
                  </Typography>

                  {/* Description */}
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    paragraph 
                    sx={{ lineHeight: 1.7, mb: 3 }}
                  >
                    {product.description}
                  </Typography>

                  {/* Price */}
                  <Box sx={{ mb: 3 }}>
                    <Typography 
                      variant="h2" 
                      color="primary.main" 
                      fontWeight="bold"
                      sx={{ mb: 0.5 }}
                    >
                      {product.currency} {product.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Price includes all taxes
                    </Typography>
                  </Box>

                  {/* Stock Status with Progress */}
                  <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <InventoryIcon color={getStockColor()} />
                      <Typography 
                        variant="body1" 
                        color={`${getStockColor()}.main`}
                        fontWeight="medium"
                      >
                        {product.stock > 0 ? `${product.stock} items available` : 'Out of Stock'}
                      </Typography>
                    </Box>
                    {product.stock > 0 && (
                      <LinearProgress
                        variant="determinate"
                        value={calculateStockPercentage()}
                        color={getStockColor()}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    )}
                  </Paper>

                  <Divider sx={{ my: 2 }} />

                  {/* Quantity Selector */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                      Quantity:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Tooltip title="Decrease quantity">
                        <span>
                          <IconButton 
                            onClick={handleMinus} 
                            disabled={quantity <= 1}
                            color="primary"
                            sx={{ 
                              '&:hover': { transform: 'scale(1.1)' },
                              '&:disabled': { opacity: 0.5 }
                            }}
                          >
                            <RemoveCircleIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      
                      <TextField
                        label="Quantity"
                        type="number"
                        size="small"
                        value={quantity}
                        onChange={onQuantityChange}
                        inputProps={{ min: 1, max: product.stock }}
                        sx={{ 
                          width: 100,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }}
                      />
                      
                      <Tooltip title="Increase quantity">
                        <span>
                          <IconButton 
                            onClick={handleAdd}
                            disabled={quantity >= product.stock}
                            color="primary"
                            sx={{ 
                              '&:hover': { transform: 'scale(1.1)' },
                              '&:disabled': { opacity: 0.5 }
                            }}
                          >
                            <AddCircleIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={buyingNow ? <CircularProgress size={20} color="inherit" /> : <PaidIcon />}
                      onClick={handleBuyNow}
                      disabled={buyingNow || product.stock === 0 || !isAuthenticated}
                      sx={{ 
                        py: 1.5,
                        borderRadius: 3,
                        background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #FF5252, #FF7043)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 16px rgba(255,107,107,0.3)',
                        },
                      }}
                    >
                      {buyingNow ? 'Processing...' : 'Buy Now'}
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={addingToCart ? <CircularProgress size={20} /> : <ShoppingCartIcon />}
                      onClick={handleAddToCart}
                      disabled={addingToCart || product.stock === 0}
                      sx={{ 
                        py: 1.5,
                        borderRadius: 3,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 16px rgba(33,150,243,0.2)',
                        },
                      }}
                    >
                      {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </Button>
                  </Stack>

                  {/* Secondary Actions */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                      <IconButton 
                        onClick={handleFavoriteToggle}
                        color={isFavorite ? "error" : "default"}
                        sx={{ 
                          '&:hover': { transform: 'scale(1.2)' },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Share product">
                      <IconButton 
                        onClick={handleShare}
                        color="primary"
                        sx={{ 
                          '&:hover': { transform: 'scale(1.2)' },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Recommended">
                      <IconButton 
                        color="success"
                        sx={{ 
                          '&:hover': { transform: 'scale(1.2)' },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <ThumbUpIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Login prompt for non-authenticated users */}
                  {!isAuthenticated && (
                    <Alert 
                      severity="info" 
                      sx={{ 
                        borderRadius: 2,
                        '& .MuiAlert-message': {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }
                      }}
                    >
                      <Typography variant="body2">
                        Please 
                        <Button 
                          onClick={() => navigate('/login')} 
                          size="small"
                          sx={{ mx: 0.5, textTransform: 'none' }}
                        >
                          sign in
                        </Button> 
                        to add items to cart or make purchases.
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </Slide>
            </Grid>
          </Grid>
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
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductPage;