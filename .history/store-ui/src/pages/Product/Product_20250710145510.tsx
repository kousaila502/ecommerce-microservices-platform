import * as React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, Product } from "../../api/products";
import { addToCart, AddToCartPayload } from "../../api/cart";
import { useAuth } from "../../contexts/AuthContext";


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
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaidIcon from '@mui/icons-material/Paid';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TextField from '@mui/material/TextField';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [addingToCart, setAddingToCart] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);

  const onQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) setQuantity(value);
  };

  const handleAdd = () => setQuantity(prev => prev + 1);
  const handleMinus = () => quantity > 1 && setQuantity(prev => prev - 1);

  const handleAddToCart = async () => {
    if (!product || !user) return;

    setAddingToCart(true);
    const item: AddToCartPayload = {
      productId: product._id,
      sku: product.sku,
      title: product.title,
      quantity,
      price: product.price,
      currency: product.currency
    };

    try {
      const result = await addToCart(user.id, item, user.token);
      if (result) {
        navigate('/cart');
      } else {
        setError('Failed to add item to cart.');
      }
    } catch (err) {
      setError('Error adding item to cart.');
    } finally {
      setAddingToCart(false);
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">Product not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Paper elevation={3}>
        <Grid container>
          <Grid item xs={12} md={4} sx={{ p: 2 }}>
            <Grid container direction="column" alignItems="center">
              <Typography variant="h5">{product.title}</Typography>
              <img
                src={product.image}
                width="200"
                alt={product.title}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Grid>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container direction="column" sx={{ p: 2 }}>
              <Typography variant="h6">{product.brand}</Typography>
              <Typography sx={{ mb: 1 }}>{product.description}</Typography>
              <Typography variant="h6" color="primary">
                {product.currency} {product.price}
              </Typography>
              <Typography variant="body1" color={product.stock > 0 ? 'green' : 'error'}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography>Rating</Typography>
                <Chip icon={<StarIcon />} label={product.rating.toFixed(1)} />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <IconButton onClick={handleMinus} disabled={quantity <= 1}>
                  <RemoveCircleIcon />
                </IconButton>
                <TextField
                  label="Quantity"
                  type="number"
                  size="small"
                  value={quantity}
                  onChange={onQuantityChange}
                  inputProps={{ min: 1 }}
                />
                <IconButton onClick={handleAdd}>
                  <AddCircleIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button variant="outlined" startIcon={<PaidIcon />}>
                  Buy Now
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProductPage;
