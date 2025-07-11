// src/pages/Product/Product.tsx (ENHANCED VERSION - BASED ON YOUR EXISTING CODE)
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

// Icons
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaidIcon from '@mui/icons-material/Paid';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import InventoryIcon from '@mui/icons-material/Inventory';

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
  const [snackbar, setSnackbar] = React.useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });

  const onQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) setQuantity(value);
  };

  const handleAdd = () => setQuantity(prev => prev + 1);
  const handleMinus = () => quantity > 1 && setQuantity(prev => prev - 1);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!product || !user || !token) return;

    setAddingToCart(true);
    try {
      // Use your existing API structure
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
        // Also update the cart context for sidebar
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
          // Fallback: if context fails, just show success for API call
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
      // Add to cart first, then redirect to cart for checkout
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
          // Redirect to cart with buy now flag
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
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Product not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={800}>
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Grid container>
            {/* Product Image Section */}
            <Grid item xs={12} md={5}>
              <Slide direction="right" in timeout={600}>
                <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                  <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
                    {product.title}
                  </Typography>
                  
                  <Card sx={{ 
                    width: '100%', 
                    maxWidth: 350, 
                    height: 300, 
                    borderRadius: 2,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.50'
                  }}>
                    {product.image ? (
                      <CardMedia
                        component="img"
                        image={product.image}
                        alt={product.title}
                        sx={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        bgcolor: 'primary.light',
                        color: 'white'
                      }}>
                        <Typography variant="h2" fontWeight="bold">
                          {product.title.split(' ').map(word => word[0]).join('').substring(0, 2)}
                        </Typography>
                      </Box>
                    )}
                  </Card>

                  {/* Brand Chip */}
                  {product.brand && (
                    <Chip 
                      label={product.brand} 
                      color="primary" 
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  )}
                </Box>
              </Slide>
            </Grid>

            {/* Product Details Section */}
            <Grid item xs={12} md={7}>
              <Slide direction="left" in timeout={800}>
                <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Description */}
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.6 }}>
                    {product.description}
                  </Typography>

                  {/* Price */}
                  <Typography 
                    variant="h3" 
                    color="primary.main" 
                    fontWeight="bold" 
                    sx={{ mb: 2 }}
                  >
                    {product.currency} {product.price}
                  </Typography>

                  {/* Stock Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <InventoryIcon color={product.stock > 0 ? 'success' : 'error'} />
                    <Typography 
                      variant="body1" 
                      color={product.stock > 0 ? 'success.main' : 'error.main'}
                      fontWeight="medium"
                    >
                      {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                    </Typography>
                  </Box>

                  {/* Rating */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <Rating value={product.rating} precision={0.1} readOnly />
                    <Typography variant="body2" color="text.secondary">
                      ({product.rating.toFixed(1)})
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Quantity Selector */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Quantity:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton 
                        onClick={handleMinus} 
                        disabled={quantity <= 1}
                        color="primary"
                      >
                        <RemoveCircleIcon />
                      </IconButton>
                      <TextField
                        label="Qty"
                        type="number"
                        size="small"
                        value={quantity}
                        onChange={onQuantityChange}
                        inputProps={{ min: 1, max: product.stock }}
                        sx={{ width: 80 }}
                      />
                      <IconButton 
                        onClick={handleAdd}
                        disabled={quantity >= product.stock}
                        color="primary"
                      >
                        <AddCircleIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={buyingNow ? <CircularProgress size={20} /> : <PaidIcon />}
                      onClick={handleBuyNow}
                      disabled={buyingNow || product.stock === 0 || !isAuthenticated}
                      sx={{ flex: 1 }}
                    >
                      {buyingNow ? 'Processing...' : 'Buy Now'}
                    </Button>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={addingToCart ? <CircularProgress size={20} /> : <ShoppingCartIcon />}
                      onClick={handleAddToCart}
                      disabled={addingToCart || product.stock === 0}
                      sx={{ flex: 1 }}
                    >
                      {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </Button>
                  </Box>

                  {/* Additional Actions */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <IconButton color="primary" sx={{ '&:hover': { transform: 'scale(1.1)' } }}>
                      <FavoriteIcon />
                    </IconButton>
                    <IconButton color="primary" sx={{ '&:hover': { transform: 'scale(1.1)' } }}>
                      <ShareIcon />
                    </IconButton>
                  </Box>

                  {/* Features */}
                  <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalShippingIcon color="primary" fontSize="small" />
                          <Typography variant="body2">Free Shipping</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SecurityIcon color="primary" fontSize="small" />
                          <Typography variant="body2">Secure Payment</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Login prompt for non-authenticated users */}
                  {!isAuthenticated && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Please <Button onClick={() => navigate('/login')} size="small">sign in</Button> to add items to cart or make purchases.
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductPage;