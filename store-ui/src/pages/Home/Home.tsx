// src/pages/Home/Home.tsx - WOW UI IMPROVEMENTS WITH MIXED CATEGORIES
import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Paper,
  IconButton,
  Fade,
  Slide,
  Zoom,
  Grow,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  LocalOffer as OfferIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  ArrowForward as ArrowIcon,
  FlashOn as FlashIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Visibility as VisibilityIcon,
  FiberNew as NewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { productsUrl, searchUrl, apiUrl } from '../../api/config';
import Deals from '../../components/Deals/Deals';

// Real tech category icons mapping
const categoryIcons: { [key: string]: string } = {
  'Cameras': '📷',
  'Gaming Consoles': '🎮',
  'Headphones & Speakers': '🎧',
  'Laptops': '💻',
  'Smart TVs': '📺',
  'Smart Watches': '⌚',
  'Smartphones': '📱',
  'Tablets': '📱'
};

const categoryGradients: { [key: string]: string } = {
  'Cameras': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'Gaming Consoles': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'Headphones & Speakers': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'Laptops': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'Smart TVs': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'Smart Watches': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'Smartphones': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'Tablets': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
};

// Fallback products in case API fails
const fallbackProducts = [
  {
    id: 1,
    name: 'Premium Wireless Headphones',
    price: 299.99,
    originalPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    rating: 4.8,
    reviews: 1234,
    category: 'Headphones & Speakers',
    badge: 'Best Seller',
    badgeColor: 'success',
  },
  {
    id: 2,
    name: 'Smart Fitness Watch',
    price: 249.99,
    originalPrice: 349.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    rating: 4.6,
    reviews: 890,
    category: 'Smart Watches',
    badge: 'New Arrival',
    badgeColor: 'info',
  },
  {
    id: 3,
    name: 'Gaming Console Pro',
    price: 499.99,
    originalPrice: 599.99,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop',
    rating: 4.9,
    reviews: 567,
    category: 'Gaming Consoles',
    badge: 'Hot Deal',
    badgeColor: 'error',
  },
  {
    id: 4,
    name: 'Professional Camera',
    price: 899.99,
    originalPrice: 1199.99,
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
    rating: 4.7,
    reviews: 234,
    category: 'Cameras',
    badge: 'Limited',
    badgeColor: 'warning',
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryScrollPosition, setCategoryScrollPosition] = useState(0);

  // Shuffle array utility
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    setVisible(true);
    fetchCategories();
    fetchMixedProducts();
  }, []);

  // Fetch real categories from API
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log('Fetching categories from:', apiUrl.products('categories'));

      const response = await axios.get(apiUrl.products('categories'), {
        timeout: 10000
      });

      console.log('Categories response:', response.data);

      if (response.data.success && Array.isArray(response.data.data)) {
        const categoryData = response.data.data.map((categoryName: string) => ({
          name: categoryName,
          icon: categoryIcons[categoryName] || '📦',
          gradient: categoryGradients[categoryName] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          deals: `${Math.floor(Math.random() * 50) + 10}+ Items`
        }));
        setCategories(categoryData);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories
      setCategories([
        { name: 'Smartphones', icon: '📱', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', deals: '45+ Items' },
        { name: 'Laptops', icon: '💻', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', deals: '30+ Items' },
        { name: 'Cameras', icon: '📷', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', deals: '25+ Items' },
        { name: 'Gaming Consoles', icon: '🎮', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', deals: '20+ Items' },
        { name: 'Smart Watches', icon: '⌚', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', deals: '35+ Items' },
        { name: 'Smart TVs', icon: '📺', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', deals: '15+ Items' },
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch products from different categories for variety
  const fetchMixedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching mixed products from different categories');

      // Array to store products from different categories
      let mixedProducts: any[] = [];
      
      // Try to fetch from specific categories first
      const categoriesToFetch = ['Smartphones', 'Laptops', 'Cameras', 'Gaming Consoles', 'Smart Watches', 'Headphones & Speakers'];
      
      for (const category of categoriesToFetch) {
        try {
          const response = await axios.get(apiUrl.products(`products/category/${encodeURIComponent(category)}`), {
            params: { limit: 2 }, // Get 2 products from each category
            timeout: 8000
          });

          if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
            const categoryProducts = response.data.data.map((product: any) => ({
              ...product,
              category: category
            }));
            mixedProducts = [...mixedProducts, ...categoryProducts];
          }
        } catch (categoryError) {
          console.log(`No products found for category ${category}, continuing...`);
        }
      }

      // If we don't have enough mixed products, get from general endpoint
      if (mixedProducts.length < 8) {
        try {
          const response = await axios.get(apiUrl.products('products'), {
            params: { limit: 12 },
            timeout: 10000
          });

          let products = [];
          if (response.data.success && Array.isArray(response.data.data)) {
            products = response.data.data;
          }

          // Add remaining products
          const additionalProducts = products.slice(0, 8 - mixedProducts.length);
          mixedProducts = [...mixedProducts, ...additionalProducts];
        } catch (generalError) {
          console.log('General products fetch failed, using fallback');
        }
      }

      if (mixedProducts.length > 0) {
        // Randomize and take 8 products for 2 rows
        const finalProducts = shuffleArray(mixedProducts).slice(0, 8);
        setFeaturedProducts(finalProducts);
      } else {
        // Use fallback with mixed categories
        setFeaturedProducts(shuffleArray(fallbackProducts));
      }

    } catch (error) {
      console.error('Error fetching mixed products:', error);
      setError('Failed to load products');
      setFeaturedProducts(shuffleArray(fallbackProducts));
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/search?category=${category.toLowerCase()}`);
  };

  const handleProductClick = (productId: number | string) => {
    navigate(`/product/${productId}`);
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    const container = document.getElementById('categories-container');
    if (container) {
      const scrollAmount = 300;
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getProductImage = (product: any, index: number) => {
    if (product.image && (product.image.startsWith('http') || product.image.startsWith('https'))) {
      return product.image;
    }
    
    // Better fallback images based on category
    const categoryImages: { [key: string]: string } = {
      'Smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
      'Laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
      'Cameras': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
      'Gaming Consoles': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop',
      'Smart Watches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      'Headphones & Speakers': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
      'Smart TVs': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop',
      'Tablets': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop'
    };

    return categoryImages[product.category] || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&sig=${index}`;
  };

  const getBadgeForProduct = (product: any, index: number) => {
    if (product.badge) return { label: product.badge, color: product.badgeColor };

    if (product.rating >= 4.8) return { label: 'Best Seller', color: 'success' };
    if (product.stock < 10) return { label: 'Limited', color: 'warning' };
    if (index % 4 === 0) return { label: 'Hot Deal', color: 'error' };
    if (index % 4 === 1) return { label: 'New', color: 'info' };
    return { label: 'Featured', color: 'primary' };
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Enhanced Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 6, md: 10 },
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3,
          }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Slide direction="right" in={visible} timeout={800}>
                <Box>
                  <Typography
                    variant="h1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                      fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                      background: 'linear-gradient(45deg, #ffffff, #e2e8f0)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 4px 20px rgba(255,255,255,0.1)',
                    }}
                  >
                    Welcome to TechMart
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      mb: 4, 
                      opacity: 0.9,
                      fontSize: { xs: '1.2rem', md: '1.5rem' },
                      textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    }}
                  >
                    Discover premium tech products with amazing deals
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        '&:hover': { 
                          bgcolor: 'rgba(255,255,255,0.25)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        },
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        transition: 'all 0.3s ease',
                      }}
                      startIcon={<FlashIcon />}
                      onClick={() => navigate('/deals')}
                    >
                      Shop Flash Deals
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'rgba(255,255,255,0.3)',
                        color: 'white',
                        backdropFilter: 'blur(10px)',
                        '&:hover': { 
                          borderColor: 'white', 
                          bgcolor: 'rgba(255,255,255,0.1)',
                          transform: 'translateY(-2px)',
                        },
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        transition: 'all 0.3s ease',
                      }}
                      endIcon={<ArrowIcon />}
                      onClick={() => navigate('/search')}
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
                    position: 'relative',
                    '& .hero-icon': {
                      fontSize: { xs: '8rem', md: '12rem', lg: '15rem' },
                      opacity: 0.15,
                      animation: 'bounce 3s infinite',
                      filter: 'drop-shadow(0 10px 20px rgba(255,255,255,0.1))',
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
        {/* Horizontal Scrolling Categories */}
        <Fade in={visible} timeout={1000}>
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              textAlign="center" 
              gutterBottom
              sx={{ 
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Shop by Category
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
              Explore our premium tech collection
            </Typography>

            {categoriesLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={30} />
              </Box>
            ) : (
              <Box sx={{ position: 'relative' }}>
                {/* Left Scroll Button */}
                <IconButton
                  sx={{
                    position: 'absolute',
                    left: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    bgcolor: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    '&:hover': {
                      bgcolor: 'white',
                      boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
                    },
                  }}
                  onClick={() => scrollCategories('left')}
                >
                  <ChevronLeftIcon />
                </IconButton>

                {/* Categories Container */}
                <Box
                  id="categories-container"
                  sx={{
                    display: 'flex',
                    gap: 3,
                    overflowX: 'auto',
                    scrollBehavior: 'smooth',
                    py: 2,
                    px: 2,
                    '&::-webkit-scrollbar': {
                      display: 'none',
                    },
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                  }}
                >
                  {categories.map((category, index) => (
                    <Card
                      key={category.name}
                      sx={{
                        minWidth: 200,
                        cursor: 'pointer',
                        background: category.gradient,
                        color: 'white',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: 'scale(1)',
                        '&:hover': {
                          transform: 'scale(1.05) translateY(-8px)',
                          boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                        },
                        borderRadius: 4,
                        overflow: 'hidden',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(255,255,255,0.05)',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        },
                        '&:hover::before': {
                          opacity: 1,
                        },
                      }}
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 3, px: 2 }}>
                        <Box
                          sx={{
                            fontSize: '3rem',
                            mb: 2,
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                          }}
                        >
                          {category.icon}
                        </Box>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold" 
                          gutterBottom
                          sx={{ 
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            fontSize: '1rem',
                          }}
                        >
                          {category.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            opacity: 0.9,
                            fontWeight: 'medium',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          }}
                        >
                          {category.deals}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {/* Right Scroll Button */}
                <IconButton
                  sx={{
                    position: 'absolute',
                    right: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    bgcolor: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    '&:hover': {
                      bgcolor: 'white',
                      boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
                    },
                  }}
                  onClick={() => scrollCategories('right')}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        </Fade>

        {/* Enhanced Featured Products - Mixed Categories */}
        <Slide direction="up" in={visible} timeout={1200}>
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
              <TrendingIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography 
                variant="h4" 
                fontWeight="bold"
                sx={{ 
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Featured Products
              </Typography>
            </Box>

            {error && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.error.main, 0.1), textAlign: 'center' }}>
                <Typography color="error" variant="body2">
                  {error} - Showing sample products
                </Typography>
              </Paper>
            )}

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress size={50} />
                <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
                  Loading amazing products...
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {featuredProducts.map((product, index) => {
                  const badge = getBadgeForProduct(product, index);
                  const productId = product._id || product.id;
                  const productName = product.title || product.name;
                  const productPrice = product.price;
                  const productRating = product.rating || (4.2 + Math.random() * 0.6);

                  return (
                    <Grid item xs={12} sm={6} md={3} key={`${productId}-${index}`}>
                      <Zoom in={visible} timeout={1000 + index * 150}>
                        <Card
                          sx={{
                            height: '100%',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderRadius: 3,
                            overflow: 'hidden',
                            backgroundColor: 'white',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            '&:hover': {
                              transform: 'translateY(-12px) scale(1.02)',
                              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                              '& .product-actions': {
                                opacity: 1,
                                transform: 'translateY(0)',
                              },
                              '& .product-image': {
                                transform: 'scale(1.05)',
                              },
                            },
                          }}
                          onClick={() => handleProductClick(productId)}
                        >
                          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                            <CardMedia
                              component="img"
                              className="product-image"
                              sx={{
                                height: 220,
                                objectFit: 'cover',
                                transition: 'transform 0.4s ease',
                              }}
                              image={getProductImage(product, index)}
                              alt={productName}
                              onError={(e: any) => {
                                e.target.src = `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&sig=${index}`;
                              }}
                            />

                            {/* Enhanced Badge */}
                            <Chip
                              label={badge.label}
                              color={badge.color as any}
                              size="small"
                              icon={badge.label === 'New' ? <NewIcon fontSize="small" /> : undefined}
                              sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                fontWeight: 'bold',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                backdropFilter: 'blur(10px)',
                              }}
                            />

                            {/* Enhanced Action Buttons */}
                            <Box
                              className="product-actions"
                              sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                opacity: 0,
                                transform: 'translateY(-10px)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                              }}
                            >
                              <IconButton
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.95)',
                                  backdropFilter: 'blur(10px)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                  '&:hover': { 
                                    bgcolor: 'white', 
                                    color: 'error.main',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Add to favorites functionality
                                }}
                              >
                                <FavoriteIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.95)',
                                  backdropFilter: 'blur(10px)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                  '&:hover': { 
                                    bgcolor: 'white', 
                                    color: 'primary.main',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Add to cart functionality
                                }}
                              >
                                <CartIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.95)',
                                  backdropFilter: 'blur(10px)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                  '&:hover': { 
                                    bgcolor: 'white', 
                                    color: 'info.main',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Quick view functionality
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Box>

                            {/* Category Tag */}
                            {product.category && (
                              <Chip
                                label={product.category}
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  bottom: 12,
                                  right: 12,
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  backdropFilter: 'blur(10px)',
                                }}
                              />
                            )}
                          </Box>

                          <CardContent sx={{ p: 3 }}>
                            <Typography 
                              variant="h6" 
                              fontWeight="bold" 
                              gutterBottom
                              sx={{ 
                                fontSize: '1.1rem',
                                lineHeight: 1.3,
                                height: '2.6em',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                mb: 2,
                              }}
                            >
                              {productName}
                            </Typography>

                            {/* Enhanced Rating */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box sx={{ display: 'flex', mr: 1 }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <StarIcon 
                                    key={star}
                                    sx={{ 
                                      fontSize: 16,
                                      color: star <= Math.floor(productRating) 
                                        ? '#fbbf24' 
                                        : star === Math.ceil(productRating) && productRating % 1 > 0
                                          ? '#fbbf24'
                                          : '#e5e7eb',
                                      opacity: star === Math.ceil(productRating) && productRating % 1 > 0 ? 0.5 : 1,
                                    }} 
                                  />
                                ))}
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                {productRating.toFixed(1)} ({product.reviews || Math.floor(Math.random() * 500 + 50)})
                              </Typography>
                            </Box>

                            {/* Enhanced Price */}
                            <Box sx={{ mb: 3 }}>
                              <Typography 
                                variant="h5" 
                                color="primary.main" 
                                fontWeight="bold"
                                sx={{ fontSize: '1.4rem' }}
                              >
                                {formatPrice(productPrice)}
                              </Typography>
                              {product.originalPrice && product.originalPrice > productPrice && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ textDecoration: 'line-through' }}
                                  >
                                    {formatPrice(product.originalPrice)}
                                  </Typography>
                                  <Chip
                                    label={`Save ${Math.round(((product.originalPrice - productPrice) / product.originalPrice) * 100)}%`}
                                    size="small"
                                    color="success"
                                    sx={{ 
                                      fontSize: '0.7rem', 
                                      fontWeight: 'bold',
                                      height: 20,
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>

                            {/* Enhanced Add to Cart Button */}
                            <Button
                              fullWidth
                              variant="contained"
                              size="large"
                              startIcon={<CartIcon />}
                              sx={{
                                borderRadius: 2,
                                py: 1.2,
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #5a67d8, #68319b)',
                                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                  transform: 'translateY(-1px)',
                                },
                                transition: 'all 0.3s ease',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Add to cart functionality
                              }}
                            >
                              Add to Cart
                            </Button>

                            {/* Stock Info */}
                            {product.stock !== undefined && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  display: 'block',
                                  textAlign: 'center',
                                  mt: 1,
                                  color: product.stock > 10 ? 'success.main' : 'warning.main',
                                  fontWeight: 'medium',
                                }}
                              >
                                {product.stock > 0 
                                  ? `${product.stock} in stock` 
                                  : 'Out of stock'
                                }
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Zoom>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            {/* Enhanced View All Button */}
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowIcon />}
                onClick={handleViewAllProducts}
                sx={{
                  borderRadius: 3,
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a67d8, #68319b)',
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                View All Products
              </Button>
            </Box>
          </Box>
        </Slide>

        {/* Enhanced Deals Section */}
        <Fade in={visible} timeout={1400}>
          <Box sx={{ mb: 6 }}>
            <Box sx={{ 
              p: 4, 
              borderRadius: 4, 
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
            }}>
              <Deals />
            </Box>
          </Box>
        </Fade>

        {/* Enhanced Special Offers */}
        <Fade in={visible} timeout={1500}>
          <Paper
            sx={{
              p: { xs: 4, md: 6 },
              mb: 6,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              textAlign: 'center',
              borderRadius: 6,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm10 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              }
            }}
          >
            <OfferIcon sx={{ fontSize: { xs: 60, md: 80 }, mb: 2, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '2rem', md: '3rem' },
                textShadow: '0 4px 8px rgba(0,0,0,0.2)',
              }}
            >
              Special Weekend Offer!
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4, 
                opacity: 0.95,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              Get up to 70% off on selected premium tech items
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.25)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                },
                borderRadius: 3,
                transition: 'all 0.3s ease',
              }}
              onClick={() => navigate('/deals')}
            >
              Shop Now & Save Big
            </Button>
          </Paper>
        </Fade>

        {/* New Newsletter Section */}
        <Fade in={visible} timeout={1600}>
          <Paper
            sx={{
              p: { xs: 4, md: 6 },
              mb: 6,
              textAlign: 'center',
              borderRadius: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Stay Updated with Latest Deals
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Subscribe to get exclusive offers and new product updates
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center',
              flexWrap: 'wrap',
              maxWidth: 500,
              mx: 'auto',
            }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  borderRadius: 3,
                  px: 4,
                }}
              >
                Subscribe Now
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Home;