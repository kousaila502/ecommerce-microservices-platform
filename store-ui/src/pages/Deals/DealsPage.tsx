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
    LocalOffer as OfferIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAllDeals, seedDeals, Deal } from '../../api/deals';

const DealsPage: React.FC = () => {
    const navigate = useNavigate();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to get deals
            let dealsData = await getAllDeals();

            // If no deals found, seed some sample data
            if (!dealsData || dealsData.length === 0) {
                console.log('No deals found, seeding sample data...');
                const seeded = await seedDeals();
                if (seeded) {
                    // Retry getting deals after seeding
                    dealsData = await getAllDeals();
                }
            }

            setDeals(dealsData || []);
        } catch (err) {
            setError('Failed to load deals');
            console.error('Error fetching deals:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number, currency: string = '$') => {
        return `${currency}${price.toFixed(2)}`;
    };

    const getDiscountPercentage = (deal: Deal) => {
        if (deal.originalPrice && deal.originalPrice > deal.price) {
            return Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100);
        }
        return deal.discount || 0;
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} />
                    <Typography sx={{ mt: 2 }}>Loading deals...</Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button variant="outlined" onClick={fetchDeals}>
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
                    <Paper sx={{ p: 4, mb: 4, textAlign: 'center', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                        <OfferIcon sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h3" fontWeight="bold" gutterBottom>
                            Special Deals
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>
                            Amazing discounts on selected products ({deals.length} deals available)
                        </Typography>
                    </Paper>

                    {deals.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary">
                                No deals available at the moment
                            </Typography>
                            <Button variant="contained" sx={{ mt: 2 }} onClick={fetchDeals}>
                                Check Again
                            </Button>
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {deals.map((deal, index) => {
                                const discountPercentage = getDiscountPercentage(deal);

                                return (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={deal.dealId}>
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
                                            onClick={() => navigate(`/product/${deal.productId}`)}
                                        >
                                            <Box sx={{ position: 'relative' }}>
                                                <CardMedia
                                                    component="div"
                                                    sx={{
                                                        height: 200,
                                                        background: deal.image && deal.image.startsWith('http')
                                                            ? `url(${deal.image})`
                                                            : `linear-gradient(45deg, #dc2626 30%, #f5f5f9 90%)`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '4rem',
                                                        color: 'white',
                                                    }}
                                                >
                                                    {(!deal.image || !deal.image.startsWith('http')) && '🔥'}
                                                </CardMedia>

                                                {discountPercentage > 0 && (
                                                    <Chip
                                                        label={`${discountPercentage}% OFF`}
                                                        color="error"
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            left: 8,
                                                            fontWeight: 'bold',
                                                            fontSize: '0.8rem',
                                                        }}
                                                    />
                                                )}

                                                {!deal.isActive && (
                                                    <Chip
                                                        label="Expired"
                                                        color="default"
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            fontWeight: 'bold',
                                                        }}
                                                    />
                                                )}
                                            </Box>

                                            <CardContent>
                                                <Typography variant="h6" fontWeight="medium" noWrap gutterBottom>
                                                    {deal.title}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        mb: 2,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}
                                                >
                                                    {deal.shortDescription || deal.description}
                                                </Typography>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <StarIcon sx={{ color: '#fbbf24', fontSize: 16, mr: 0.5 }} />
                                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                                        {deal.rating}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                                        {formatPrice(deal.price, deal.currency)}
                                                    </Typography>
                                                    {deal.originalPrice && deal.originalPrice > deal.price && (
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{ textDecoration: 'line-through' }}
                                                        >
                                                            {formatPrice(deal.originalPrice, deal.currency)}
                                                        </Typography>
                                                    )}
                                                </Box>

                                                {deal.department && (
                                                    <Chip
                                                        label={deal.department}
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

export default DealsPage;