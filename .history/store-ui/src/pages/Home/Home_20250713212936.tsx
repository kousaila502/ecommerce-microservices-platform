// src/pages/Home/Home.tsx (EXAMPLE OF ENHANCED ANIMATIONS)
import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  Chip,
  Paper,
  Avatar,
  IconButton,
  Fade,
  Slide,
  Zoom,
  Grow,
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  LocalOffer as OfferIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  ArrowForward as ArrowIcon,
  FlashOn as FlashIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const categories = [
  { name: 'Electronics', icon: '💻', color: '#2563eb', deals: '50+ Deals' },
  { name: 'Fashion', icon: '👕', color: '#7c3aed', deals: '30+ Deals' },
  { name: 'Home', icon: '🏠', color: '#059669', deals: '25+ Deals' },
  { name: 'Sports', icon: '⚽', color: '#dc2626', deals: '20+ Deals' },
  { name: 'Books', icon: '📚', color: '#d97706', deals: '15+ Deals' },
  { name: 'Toys', icon: '🧸', color: '#ec4899', deals: '35+ Deals' },
];

const featuredProducts = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    price: 299.99,
    originalPrice: 399.99,
    image: '/api/placeholder/300/200',
    rating: 4.8,
    reviews: 1234,
    badge: 'Best Seller',
    badgeColor: 'success',
  },
  {
    id: 2,
    name: 'Smart Fitness Watch',
    price: 249.99,
    originalPrice: 349.99,
    image: '/api/placeholder/300/200',
    rating: 4.6,
    reviews: 890,
    badge: 'New Arrival',
    badgeColor: 'info',
  },
  {
    id: 3,
    name: 'Gaming Mechanical Keyboard',
    price: 159.99,
    originalPrice: 199.99,
    image: '/api/placeholder/300/200',
    rating: 4.9,
    reviews: 567,
    badge: 'Hot Deal',
    badgeColor: 'error',
  },
  {
    id: 4,
    name: 'Professional Camera Lens',
    price: 899.99,
    originalPrice: 1199.99,
    image: '/api/placeholder/300/200',
    rating: 4.7,
    reviews: 234,
    badge: 'Limited',
    badgeColor: 'warning',
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleCategoryClick = (category: string) => {
    navigate(`/search?category=${category.toLowerCase()}`);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Slide direction="right" in={visible} timeout={800}>
                <Box>
                  <Typography
                    variant="h2"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      background: 'linear-gradient(45deg, #ffffff, #e2e8f0)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Welcome to kousaila
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                    Discover amazing products at unbeatable prices
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        borderRadius: 3,
                      }}
                      startIcon={<FlashIcon />}
                    >
                      Shop Flash Deals
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'rgba(255,255,255,0.3)',
                        color: 'white',
                        '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                        borderRadius: 3,
                      }}
                      endIcon={<ArrowIcon />}
                    >
                      Explore Categories
                    </Button>
                  </Box>
                </Box>
              </Slide>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in={visible} timeout={1000}>
                <Box
                  sx={{
                    textAlign: 'center',
                    '& .hero-icon': {
                      fontSize: '15rem',
                      opacity: 0.1,
                      animation: 'bounce 3s infinite',
                    },
                  }}
                >
                  <div className="hero-icon">🛒</div>
                </Box>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Categories Section */}
        <Fade in={visible} timeout={1000}>
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
              Shop by Category
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
              Explore our wide range of products
            </Typography>
            
            <Grid container spacing={3}>
              {categories.map((category, index) => (
                <Grid item xs={6} sm={4} md={2} key={category.name}>
                  <Grow in={visible} timeout={800 + index * 100}>
                    <Card
                      sx={{
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                        },
                      }}
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      <CardContent sx={{ py: 3 }}>
                        <Box
                          sx={{
                            fontSize: '3rem',
                            mb: 1,
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
                          }}
                        >
                          {category.icon}
                        </Box>
                        <Typography variant="h6" fontWeight="medium" gutterBottom>
                          {category.name}
                        </Typography>
                        <Chip
                          label={category.deals}
                          size="small"
                          sx={{
                            bgcolor: category.color,
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* Featured Products */}
        <Slide direction="up" in={visible} timeout={1200}>
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
              <TrendingIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" fontWeight="bold">
                Trending Products
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {featuredProducts.map((product, index) => (
                <Grid item xs={12} sm={6} md={3} key={product.id}>
                  <Zoom in={visible} timeout={1000 + index * 150}>
                    <Card
                      sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          '& .product-actions': {
                            opacity: 1,
                            transform: 'translateY(0)',
                          },
                        },
                      }}
                      onClick={() => handleProductClick(product.id)}
                    >
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="div"
                          sx={{
                            height: 200,
                            background: `linear-gradient(45deg, ${
                              index % 2 === 0 ? '#2563eb' : '#7c3aed'
                            } 30%, #f5f5f9 90%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '4rem',
                            color: 'white',
                          }}
                        >
                          {index % 4 === 0 ? '🎧' : index % 4 === 1 ? '⌚' : index % 4 === 2 ? '⌨️' : '📷'}
                        </CardMedia>
                        
                        <Chip
                          label={product.badge}
                          color={product.badgeColor as any}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            fontWeight: 'bold',
                          }}
                        />
                        
                        <Box
                          className="product-actions"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
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
                              '&:hover': { bgcolor: 'white', color: 'error.main' },
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
                          >
                            <CartIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <CardContent>
                        <Typography variant="h6" fontWeight="medium" noWrap gutterBottom>
                          {product.name}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <StarIcon sx={{ color: '#fbbf24', fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2" sx={{ mr: 1 }}>
                            {product.rating}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({product.reviews} reviews)
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" color="primary.main" fontWeight="bold">
                            ${product.price}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textDecoration: 'line-through' }}
                          >
                            ${product.originalPrice}
                          </Typography>
                          <Chip
                            label={`${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF`}
                            size="small"
                            color="error"
                            sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowIcon />}
                onClick={() => navigate('/search')}
                sx={{ borderRadius: 3 }}
              >
                View All Products
              </Button>
            </Box>
          </Box>
        </Slide>

        {/* Special Offers */}
        <Fade in={visible} timeout={1500}>
          <Paper
            sx={{
              p: 4,
              mb: 6,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              textAlign: 'center',
              borderRadius: 4,
            }}
          >
            <OfferIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Special Weekend Offer!
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              Get up to 70% off on selected items
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                borderRadius: 3,
              }}
            >
              Shop Now
            </Button>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Home;