// src/components/Deals/Deals.tsx - ENHANCED UI
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Avatar,
  Fade,
  Slide,
  Zoom,
  Container,
  Paper,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  LocalOffer as OfferIcon,
  Timer as TimerIcon,
  FlashOn as FlashIcon,
  Favorite as FavoriteIcon,
  ShoppingCart as CartIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
  LocalFireDepartment as FireIcon,
  Bolt as BoltIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled, keyframes } from '@mui/material/styles';

// Animations
const pulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(244, 63, 94, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 63, 94, 0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
`;

// Styled Components
const PulseCard = styled(Card)(({ theme }) => ({
  animation: `${pulse} 2s infinite`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, 
      transparent, 
      rgba(255,255,255,0.2), 
      transparent
    )`,
    animation: `${shimmer} 2s infinite`,
    zIndex: 1,
  },
}));

const CountdownBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ff6b6b, #ee5a6f)',
  color: 'white',
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  textAlign: 'center',
  minWidth: 60,
  fontWeight: 'bold',
}));

const DealBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  left: 12,
  zIndex: 2,
  background: 'linear-gradient(45deg, #ff6b6b, #ffd93d)',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '0.75rem',
  animation: `${pulse} 1.5s infinite`,
  '& .MuiChip-icon': {
    color: 'white',
  },
}));

// Mock deals data - replace with API call
const mockDeals = [
  {
    id: 1,
    title: 'Premium Gaming Headset',
    originalPrice: 299.99,
    salePrice: 149.99,
    discount: 50,
    image: '/api/placeholder/300/200',
    rating: 4.8,
    reviews: 2547,
    soldCount: 234,
    totalStock: 500,
    timeLeft: {
      hours: 12,
      minutes: 34,
      seconds: 56
    },
    badge: 'FLASH SALE',
    featured: true
  },
  {
    id: 2,
    title: 'Wireless Bluetooth Speaker',
    originalPrice: 199.99,
    salePrice: 99.99,
    discount: 50,
    image: '/api/placeholder/300/200',
    rating: 4.6,
    reviews: 1823,
    soldCount: 156,
    totalStock: 300,
    timeLeft: {
      hours: 8,
      minutes: 22,
      seconds: 13
    },
    badge: 'HOT DEAL'
  },
  {
    id: 3,
    title: 'Smart Fitness Tracker',
    originalPrice: 249.99,
    salePrice: 129.99,
    discount: 48,
    image: '/api/placeholder/300/200',
    rating: 4.7,
    reviews: 3421,
    soldCount: 378,
    totalStock: 600,
    timeLeft: {
      hours: 15,
      minutes: 45,
      seconds: 30
    },
    badge: 'LIMITED'
  },
  {
    id: 4,
    title: 'Mechanical Gaming Keyboard',
    originalPrice: 179.99,
    salePrice: 89.99,
    discount: 50,
    image: '/api/placeholder/300/200',
    rating: 4.9,
    reviews: 1156,
    soldCount: 89,
    totalStock: 200,
    timeLeft: {
      hours: 6,
      minutes: 12,
      seconds: 45
    },
    badge: 'ENDING SOON'
  }
];

const Deals: React.FC = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState(mockDeals);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState<{[key: number]: any}>({});

  useEffect(() => {
    // Initialize countdown for each deal
    const initialCountdown: {[key: number]: any} = {};
    deals.forEach(deal => {
      initialCountdown[deal.id] = { ...deal.timeLeft };
    });
    setCountdown(initialCountdown);

    // Update countdown every second
    const timer = setInterval(() => {
      setCountdown(prev => {
        const newCountdown = { ...prev };
        deals.forEach(deal => {
          if (newCountdown[deal.id]) {
            if (newCountdown[deal.id].seconds > 0) {
              newCountdown[deal.id].seconds--;
            } else if (newCountdown[deal.id].minutes > 0) {
              newCountdown[deal.id].minutes--;
              newCountdown[deal.id].seconds = 59;
            } else if (newCountdown[deal.id].hours > 0) {
              newCountdown[deal.id].hours--;
              newCountdown[deal.id].minutes = 59;
              newCountdown[deal.id].seconds = 59;
            }
          }
        });
        return newCountdown;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [deals]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getProgressPercentage = (soldCount: number, totalStock: number) => {
    return (soldCount / totalStock) * 100;
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'FLASH SALE': return '#ff6b6b';
      case 'HOT DEAL': return '#ff8c00';
      case 'LIMITED': return '#9c27b0';
      case 'ENDING SOON': return '#f44336';
      default: return '#2196f3';
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'FLASH SALE': return <FlashIcon />;
      case 'HOT DEAL': return <FireIcon />;
      case 'LIMITED': return <TimerIcon />;
      case 'ENDING SOON': return <BoltIcon />;
      default: return <OfferIcon />;
    }
  };

  const handleDealClick = (dealId: number) => {
    navigate(`/product/${dealId}`);
  };

  return (
    <Box>
      {/* Section Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'error.main',
              width: 56,
              height: 56,
              mr: 2,
              animation: `${pulse} 1.5s infinite`,
            }}
          >
            <FlashIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(45deg, #ff6b6b, #ffd93d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Flash Deals
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Limited time offers - grab them before they're gone!
        </Typography>
        
        {/* Global countdown banner */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            display: 'inline-block',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TimerIcon />
            <Typography variant="h6" fontWeight="bold">
              Deals end in: 23h 59m 30s
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Deals Grid */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card>
                <Skeleton variant="rectangular" width="100%" height={200} />
                <CardContent>
                  <Skeleton variant="text" width="80%" height={32} />
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {deals.map((deal, index) => {
            const progress = getProgressPercentage(deal.soldCount, deal.totalStock);
            const timeLeft = countdown[deal.id] || deal.timeLeft;

            return (
              <Grid item xs={12} sm={6} md={3} key={deal.id}>
                <Zoom in timeout={800 + index * 100}>
                  <div>
                    <Card
                      component={deal.featured ? PulseCard : Card}
                      sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        height: '100%',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-12px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                          '& .deal-actions': {
                            opacity: 1,
                            transform: 'translateY(0)',
                          },
                          '& .deal-image': {
                            transform: 'scale(1.05)',
                          },
                        },
                      }}
                      onClick={() => handleDealClick(deal.id)}
                    >
                      {/* Deal Badge */}
                      <DealBadge
                        icon={getBadgeIcon(deal.badge)}
                        label={deal.badge}
                        sx={{ bgcolor: getBadgeColor(deal.badge) }}
                      />

                      {/* Discount Badge */}
                      <Chip
                        label={`${deal.discount}% OFF`}
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          zIndex: 2,
                          bgcolor: 'success.main',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                        }}
                      />

                      {/* Product Image */}
                      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                        <CardMedia
                          className="deal-image"
                          component="div"
                          sx={{
                            height: 200,
                            background: `linear-gradient(45deg, 
                              ${index % 2 === 0 ? '#ff6b6b' : '#4ecdc4'} 30%, 
                              #f5f5f9 90%
                            )`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '4rem',
                            color: 'white',
                            transition: 'transform 0.3s ease',
                          }}
                        >
                          {['🎧', '🔊', '⌚', '⌨️'][index]}
                        </CardMedia>

                        {/* Hover Actions */}
                        <Box
                          className="deal-actions"
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            opacity: 0,
                            transform: 'translateY(10px)',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            gap: 1,
                          }}
                        >
                          <IconButton
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.9)',
                              '&:hover': { bgcolor: 'white', color: 'error.main' },
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
                              '&:hover': { bgcolor: 'white', color: 'primary.main' },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add to cart
                            }}
                          >
                            <CartIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      <CardContent sx={{ p: 2 }}>
                        {/* Product Title */}
                        <Typography
                          variant="h6"
                          fontWeight="medium"
                          noWrap
                          gutterBottom
                          sx={{ fontSize: '1rem' }}
                        >
                          {deal.title}
                        </Typography>

                        {/* Rating */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <StarIcon sx={{ color: '#fbbf24', fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {deal.rating}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({deal.reviews.toLocaleString()} reviews)
                          </Typography>
                        </Box>

                        {/* Pricing */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography
                              variant="h6"
                              color="error.main"
                              fontWeight="bold"
                              sx={{ fontSize: '1.25rem' }}
                            >
                              {formatPrice(deal.salePrice)}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ textDecoration: 'line-through', fontSize: '0.9rem' }}
                            >
                              {formatPrice(deal.originalPrice)}
                            </Typography>
                          </Box>
                          
                          <Typography variant="caption" color="success.main" fontWeight="bold">
                            Save {formatPrice(deal.originalPrice - deal.salePrice)}
                          </Typography>
                        </Box>

                        {/* Progress Bar */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Sold: {deal.soldCount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(progress)}% claimed
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(90deg, #ff6b6b, #ffd93d)',
                              },
                            }}
                          />
                        </Box>

                        {/* Countdown Timer */}
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <CountdownBox>
                            <Typography variant="body2" fontWeight="bold">
                              {String(timeLeft.hours).padStart(2, '0')}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                              HRS
                            </Typography>
                          </CountdownBox>
                          <CountdownBox>
                            <Typography variant="body2" fontWeight="bold">
                              {String(timeLeft.minutes).padStart(2, '0')}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                              MIN
                            </Typography>
                          </CountdownBox>
                          <CountdownBox>
                            <Typography variant="body2" fontWeight="bold">
                              {String(timeLeft.seconds).padStart(2, '0')}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                              SEC
                            </Typography>
                          </CountdownBox>
                        </Box>
                      </CardContent>
                    </Card>
                  </div>
                </Zoom>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* View All Deals Button */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            background: 'linear-gradient(45deg, #ff6b6b, #ffd93d)',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 'bold',
            fontSize: '1.1rem',
            '&:hover': {
              background: 'linear-gradient(45deg, #ff5252, #ffc107)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 16px rgba(255,107,107,0.3)',
            },
          }}
          startIcon={<FlashIcon />}
          onClick={() => navigate('/deals')}
        >
          View All Flash Deals
        </Button>
      </Box>
    </Box>
  );
};

export default Deals;