import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Alert,
    Button,
    Paper,
    Fade,
} from '@mui/material';
import {
    Star as StarIcon,
    ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAllProducts } from '../../api/products';

const Products: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllProducts();
            setProducts(data || []);
        } catch (err) {
            setError('Failed to load products');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number, currency: string = '$') => {
        return `${currency}${price.toFixed(2)}`;
    };

    const getProductImage = (product: any, index: number) => {
        if (product.image && product.image.startsWith('http')) {
            return product.image;
        }
        // Use emoji as fallback
        const emojis = ['🎧', '⌚', '⌨️', '📷', '💻', '📱', '🎮', '📺', '🖥️', '⚡'];
        return emojis[index % emojis.length];
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} />
                    <Typography sx={{ mt: 2 }}>Loading products...</Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button variant="outlined" onClick={fetchProducts}>
                    Try Again
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Fade in timeout={800}>
                <Box>
                    {/* Header */}
                    <Paper sx={{ p: 4, mb: 4, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <Typography variant="h3" fontWeight="bold" gutterBottom>
                            All Products
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>
                            Discover our complete collection ({products.length} products)
                        </Typography>
                    </Paper>

                    {products.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary">
                                No products available at the moment
                            </Typography>
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {products.map((product, index) => {
                                const productId = product._id || product.id;
                                const productName = product.title || product.name;
                                const productPrice = product.price;
                                const productRating = product.rating || 4.5;

                                return (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={productId}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    transform: 'translateY(-8px)',
                                                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                                },
                                            }}
                                            onClick={() => navigate(`/product/${productId}`)}
                                        >
                                            <Box sx={{ position: 'relative' }}>
                                                <CardMedia
                                                    component="div"
                                                    sx={{
                                                        height: 200,
                                                        background: product.image && product.image.startsWith('http')
                                                            ? `url(${product.image})`
                                                            : `linear-gradient(45deg, ${index % 2 === 0 ? '#2563eb' : '#7c3aed'} 30%, #f5f5f9 90%)`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '4rem',
                                                        color: 'white',
                                                    }}
                                                >
                                                    {(!product.image || !product.image.startsWith('http')) && getProductImage(product, index)}
                                                </CardMedia>

                                                {product.stock < 10 && product.stock > 0 && (
                                                    <Chip
                                                        label="Limited Stock"
                                                        color="warning"
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            left: 8,
                                                            fontWeight: 'bold',
                                                        }}
                                                    />
                                                )}

                                                {product.stock === 0 && (
                                                    <Chip
                                                        label="Out of Stock"
                                                        color="error"
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            left: 8,
                                                            fontWeight: 'bold',
                                                        }}
                                                    />
                                                )}
                                            </Box>

                                            <CardContent>
                                                <Typography variant="h6" fontWeight="medium" noWrap gutterBottom>
                                                    {productName}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <StarIcon sx={{ color: '#fbbf24', fontSize: 16, mr: 0.5 }} />
                                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                                        {productRating}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ({Math.floor(Math.random() * 1000)} reviews)
                                                    </Typography>
                                                </Box>

                                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                                    {formatPrice(productPrice, product.currency)}
                                                </Typography>

                                                {product.brand && (
                                                    <Chip
                                                        label={product.brand}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ mt: 1 }}
                                                    />
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </Box>
            </Fade>
        </Container>
    );
};

export default Products;