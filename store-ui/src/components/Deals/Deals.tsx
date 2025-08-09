import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Fade from '@mui/material/Fade';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getAllDeals, seedDeals, Deal } from '../../api/deals';

const Deals = () => {
    const navigate = useNavigate();

    const [deals, setDeals] = useState<Deal[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadDeals = async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to get deals
            let dealsData = await getAllDeals({ limit: 10 });

            // If no deals found, seed some sample data
            if (!dealsData || dealsData.length === 0) {
                console.log('No deals found, seeding sample data...');
                const seeded = await seedDeals();
                if (seeded) {
                    // Retry getting deals after seeding
                    dealsData = await getAllDeals({ limit: 10 });
                }
            }

            if (dealsData) {
                setDeals(dealsData);
            } else {
                setError('Failed to load deals');
            }
        } catch (err: any) {
            setError('Error loading deals: ' + err.message);
            console.error('Error loading deals:', err);
        } finally {
            setLoading(false);
        }
    }

    // run on load
    useEffect(() => {
        loadDeals()
    }, [])

    if (loading) {
        return (
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <CircularProgress size={40} />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                    Loading amazing deals...
                </Typography>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 4,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                </Alert>
                <Button 
                    onClick={loadDeals} 
                    variant="contained" 
                    size="large"
                    sx={{ borderRadius: 2 }}
                >
                    Try Again
                </Button>
            </Paper>
        );
    }

    return (
        <Box>
            {/* Section Header */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <LocalOfferIcon 
                        sx={{ 
                            fontSize: 32, 
                            color: 'primary.main', 
                            mr: 1.5,
                            transform: 'rotate(-15deg)'
                        }} 
                    />
                    <Typography 
                        variant="h4" 
                        fontWeight="bold"
                        sx={{ 
                            background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Today's Best Deals
                    </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    Limited time offers you don't want to miss ({deals.length} available)
                </Typography>
            </Box>

            {/* Deals Grid */}
            <Grid container spacing={3}>
                {deals.slice(0, 5).map((deal: Deal, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={2.4} key={deal.dealId}>
                        <Fade in timeout={600 + index * 100}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                                        borderColor: 'primary.main',
                                        '& .deal-actions': {
                                            opacity: 1,
                                            transform: 'translateY(0)',
                                        },
                                        '& .deal-image': {
                                            transform: 'scale(1.05)',
                                        },
                                    },
                                }}
                                onClick={() => navigate(`/product/${deal.productId}`)}
                            >
                                {/* Image Container */}
                                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                                    <Box
                                        className="deal-image"
                                        component="img"
                                        src={deal.thumbnail || '/api/placeholder/300/200'}
                                        alt={deal.title}
                                        sx={{
                                            width: '100%',
                                            height: 180,
                                            objectFit: 'cover',
                                            transition: 'transform 0.3s ease',
                                        }}
                                    />
                                    
                                    {/* Rating Badge */}
                                    <Chip
                                        icon={<StarIcon sx={{ fontSize: 16 }} />}
                                        label={deal.rating}
                                        size="small"
                                        color={deal.rating >= 4.5 ? 'success' : deal.rating >= 4 ? 'primary' : 'default'}
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            left: 12,
                                            fontWeight: 'bold',
                                            bgcolor: 'rgba(255,255,255,0.95)',
                                            backdropFilter: 'blur(4px)',
                                        }}
                                    />

                                    {/* Hover Actions */}
                                    <Box
                                        className="deal-actions"
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            opacity: 0,
                                            transform: 'translateY(-10px)',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1,
                                        }}
                                    >
                                        <IconButton
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.9)',
                                                '&:hover': { 
                                                    bgcolor: 'white', 
                                                    color: 'error.main',
                                                    transform: 'scale(1.1)'
                                                },
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Add to favorites
                                            }}
                                        >
                                            <FavoriteIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.9)',
                                                '&:hover': { 
                                                    bgcolor: 'white', 
                                                    color: 'primary.main',
                                                    transform: 'scale(1.1)'
                                                },
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Add to cart
                                            }}
                                        >
                                            <ShoppingCartIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>

                                {/* Content */}
                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                    <Typography
                                        variant="body2"
                                        color="text.primary"
                                        fontWeight="medium"
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            lineHeight: 1.4,
                                            minHeight: '2.8em',
                                            mb: 2,
                                        }}
                                    >
                                        {deal.shortDescription || deal.title}
                                    </Typography>

                                    {/* Price */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Typography 
                                            variant="h6" 
                                            fontWeight="bold"
                                            color="primary.main"
                                            sx={{ fontSize: '1.1rem' }}
                                        >
                                            {deal.currency} {deal.price}
                                        </Typography>
                                        
                                        {/* Deal Badge */}
                                        <Chip
                                            label="Deal"
                                            size="small"
                                            sx={{
                                                bgcolor: 'error.main',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '0.7rem',
                                                height: 20,
                                            }}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Fade>
                    </Grid>
                ))}
            </Grid>

            {/* View All Button */}
            {deals.length > 5 && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate('/deals')}
                        sx={{
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1976D2, #0288D1)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 16px rgba(33,150,243,0.3)',
                            },
                        }}
                    >
                        View All {deals.length} Deals
                    </Button>
                </Box>
            )}
        </Box>
    )
}

export default Deals