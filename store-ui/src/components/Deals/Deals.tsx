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
import StarIcon from '@mui/icons-material/Star';
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
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading deals...</Typography>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper elevation={3} sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button onClick={loadDeals} variant="contained">
                    Retry
                </Button>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ pl: 2, pb: 2 }}>
            <Typography variant="h6" sx={{ p: 1, color: 'text.primary' }}>
                Deals of the Day ({deals.length})
            </Typography>
            <Grid container spacing={2}>
                {deals.slice(0, 5).map((deal: Deal) => (
                    <Grid item key={deal.dealId}>
                        <Link
                            component="button"
                            onClick={() => navigate(`/product/${deal.productId}`)}
                            underline="none"
                        >
                            <Card sx={{ width: 250, height: 290 }}>
                                <Box>
                                    <img
                                        src={deal.thumbnail || '/api/placeholder/250/150'}
                                        height="150"
                                        width="250"
                                        alt={deal.title}
                                        style={{ objectFit: 'cover' }}
                                    />
                                </Box>
                                <CardContent sx={{ height: 50 }}>
                                    <Grid container>
                                        <Grid item xs={12}>
                                            <Typography
                                                color="text.secondary"
                                                variant="body2"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {deal.shortDescription || deal.title}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                                <CardActions>
                                    <Grid container>
                                        <Grid item xs={6} sx={{ p: 1, display: 'flex', justifyContent: 'flex-start' }}>
                                            <Typography variant="h6">
                                                {deal.currency} {deal.price}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            <Chip
                                                icon={<StarIcon />}
                                                label={deal.rating}
                                                size="small"
                                                color={deal.rating >= 4 ? 'success' : 'default'}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardActions>
                            </Card>
                        </Link>
                    </Grid>
                ))}
            </Grid>

            {deals.length > 5 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/deals')}
                    >
                        View All Deals ({deals.length})
                    </Button>
                </Box>
            )}
        </Paper>
    )
}

export default Deals