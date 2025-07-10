import * as React from 'react';
import { useParams } from "react-router-dom";
import getProductByVariantSku, { Product } from "../../api/products"
import addToCart, { AddToCartPayload } from "../../api/cart"
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Typography, Alert, CircularProgress } from '@mui/material';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaidIcon from '@mui/icons-material/Paid';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TextField from '@mui/material/TextField';
import { useNavigate } from "react-router-dom";

const ProductPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = React.useState<Product | null>(null);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string>('');
    const [addingToCart, setAddingToCart] = React.useState<boolean>(false);
    const [quantity, setQuantity] = React.useState<number>(1);

    const onQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (value > 0) {
            setQuantity(value);
        }
    };

    const handleAdd = () => setQuantity(prev => prev + 1);
    
    const handleMinus = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;

        setAddingToCart(true);
        
        const item: AddToCartPayload = {
            productId: product._id,
            sku: product.variants[0]?.sku || '',
            title: product.title,
            quantity: quantity,
            price: product.price,
            currency: product.currency
        };

        try {
            const result = await addToCart(item);
            if (result) {
                console.log('Added to cart:', result);
                navigate('/cart');
            } else {
                setError('Failed to add item to cart');
            }
        } catch (err) {
            setError('Error adding to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    // Fetch product on component mount
    React.useEffect(() => {
        const fetchProduct = async () => {
            if (!id) {
                setError('Product ID is missing');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const result = await getProductByVariantSku(id);
                if (result) {
                    setProduct(result);
                } else {
                    setError('Product not found');
                }
            } catch (err) {
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
                        <Grid container direction="column"
                            justifyContent="center"
                            alignItems="center">
                            <Grid item>
                                <Typography variant="h5">{product.title}</Typography>
                            </Grid>
                            <Grid item>
                                <img 
                                    src={product.thumbnail} 
                                    width="200" 
                                    alt={product.title}
                                    style={{ maxWidth: '100%', height: 'auto' }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Grid container direction="column">
                            <Grid item sx={{ p: 1 }}>
                                <Typography variant="h6">{product.attributes?.brand}</Typography>
                            </Grid>
                            <Grid item sx={{ p: 1 }}>
                                <Typography>{product.description}</Typography>
                            </Grid>
                            <Grid item sx={{ p: 1 }}>
                                <Typography variant="h6">
                                    {product.currency} {product.price}
                                </Typography>
                            </Grid>
                            <Grid item sx={{ p: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography>Rating</Typography>
                                    <Chip icon={<StarIcon />} label={product.rating} />
                                </Box>
                            </Grid>
                            <Grid item sx={{ p: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconButton 
                                        color="primary" 
                                        aria-label="decrement" 
                                        onClick={handleMinus}
                                        disabled={quantity <= 1}
                                    >
                                        <RemoveCircleIcon />
                                    </IconButton>
                                    <TextField
                                        sx={{ width: '8ch' }}
                                        required
                                        id="quantity"
                                        label="Quantity"
                                        size="small"
                                        type="number"
                                        onChange={onQuantityChange}
                                        value={quantity}
                                        inputProps={{ min: 1 }}
                                    />
                                    <IconButton 
                                        color="primary" 
                                        aria-label="increment" 
                                        onClick={handleAdd}
                                    >
                                        <AddCircleIcon />
                                    </IconButton>
                                </Box>
                            </Grid>
                            <Grid item sx={{ p: 1 }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button 
                                        variant="outlined" 
                                        startIcon={<PaidIcon />}
                                    >
                                        Buy Now
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        startIcon={<ShoppingCartIcon />} 
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                    >
                                        {addingToCart ? 'Adding...' : 'Add to Cart'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default ProductPage;