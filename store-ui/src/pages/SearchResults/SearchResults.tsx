import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  IconButton,
  Divider,
  Stack,
  Breadcrumbs,
  Link,
  Container,
  useTheme,
  alpha,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Star as StarIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  ArrowBack as BackIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { searchProducts, Product } from '../../api/products';

// Sort options
const sortOptions = [
  { value: 'relevance', label: 'Best Match' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'newest', label: 'Newest First' },
];

// Items per page options
const itemsPerPageOptions = [12, 24, 36, 48];

// Price range filters
const priceRanges = [
  { value: 'all', label: 'All Prices' },
  { value: '0-50', label: 'Under $50' },
  { value: '50-100', label: '$50 - $100' },
  { value: '100-250', label: '$100 - $250' },
  { value: '250-500', label: '$250 - $500' },
  { value: '500-1000', label: '$500 - $1000' },
  { value: '1000+', label: 'Over $1000' },
];

const SearchResults = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const category = searchParams.get('category');
  const query = searchParams.get('q');
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(query || '');
  
  // Filter and sort states
  const [sortBy, setSortBy] = useState('relevance');
  const [priceFilter, setPriceFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(currentPage);

  // Stats
  const [totalResults, setTotalResults] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    performSearch();
  }, [query, category]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, sortBy, priceFilter, page]);

  const performSearch = async () => {
    setLoading(true);
    setError('');

    let searchQuery = query || category || '';
    if (!searchQuery.trim()) {
      setError('Please provide a search term.');
      setLoading(false);
      return;
    }

    try {
      const result = await searchProducts(searchQuery, 100); // Get more results for filtering
      if (result && result.length > 0) {
        setProducts(result);
        setTotalResults(result.length);
        
        // Extract unique categories and brands for filters
        const categorySet = new Set(result.map(p => p.category).filter(Boolean));
        const brandSet = new Set(result.map(p => p.brand).filter(Boolean));
        const uniqueCategories = Array.from(categorySet);
        const uniqueBrands = Array.from(brandSet);
        setCategories(uniqueCategories);
        setBrands(uniqueBrands);
      } else {
        setProducts([]);
        setTotalResults(0);
        setError('No products found.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Something went wrong while searching.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    // Apply price filter
    if (priceFilter !== 'all') {
      if (priceFilter === '1000+') {
        filtered = filtered.filter(p => p.price >= 1000);
      } else {
        const [min, max] = priceFilter.split('-').map(Number);
        filtered = filtered.filter(p => p.price >= min && p.price <= max);
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime());
        break;
      default:
        // Keep original order for relevance
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim(), page: '1' });
      setPage(1);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    setSearchParams(prev => ({ ...Object.fromEntries(prev), page: value.toString() }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSortBy('relevance');
    setPriceFilter('all');
    setPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} sx={{ fontSize: 16, color: '#fbbf24' }} />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIcon key={i} sx={{ fontSize: 16, color: '#fbbf24', opacity: 0.5 }} />);
      } else {
        stars.push(<StarIcon key={i} sx={{ fontSize: 16, color: '#e5e7eb' }} />);
      }
    }
    return stars;
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const getProductImage = (product: Product, index: number) => {
    if (product.image && product.image.startsWith('http')) {
      return product.image;
    }
    
    // Category-based fallback images
    const categoryImages: { [key: string]: string } = {
      'Smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
      'Laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
      'Cameras': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
      'Gaming Consoles': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop',
      'Smart Watches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
      'Headphones & Speakers': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    };

    return categoryImages[product.category] || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&sig=${index}`;
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link 
              component="button" 
              variant="body2" 
              onClick={() => navigate('/')}
              sx={{ textDecoration: 'none' }}
            >
              Home
            </Link>
            <Typography variant="body2" color="text.primary">
              {category ? `${category} Products` : 'Search Results'}
            </Typography>
          </Breadcrumbs>

          {/* Back Button */}
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: 3 }}
          >
            Back
          </Button>

          {/* Title and Search */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {category ? `${category} Products` : 'Search Results'}
                </Typography>
                {query && (
                  <Typography variant="body1" color="text.secondary">
                    Results for: <strong>"{query}"</strong>
                  </Typography>
                )}
                {!loading && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {filteredProducts.length} of {totalResults} products
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchInput && (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setSearchInput('')} size="small">
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ borderRadius: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  sx={{ ml: 2, py: 1.75, px: 3, borderRadius: 2 }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {loading ? (
          <Box sx={{ py: 8 }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={50} />
              <Typography variant="h6">Searching products...</Typography>
            </Stack>
            {/* Loading Skeletons */}
            <Grid container spacing={3} sx={{ mt: 4 }}>
              {Array.from(new Array(8)).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card sx={{ borderRadius: 3 }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={30} width="80%" />
                      <Skeleton variant="text" height={20} width="60%" />
                      <Skeleton variant="text" height={25} width="40%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : error ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Button variant="contained" onClick={() => navigate('/')}>
              Return Home
            </Button>
          </Paper>
        ) : products.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h5" gutterBottom>
              No products found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search terms or browse our categories
            </Typography>
            <Button variant="contained" onClick={() => navigate('/')}>
              Browse Categories
            </Button>
          </Paper>
        ) : (
          <>
            {/* Filters and Controls */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Sort By"
                      startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} />}
                    >
                      {sortOptions.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Price Range</InputLabel>
                    <Select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      label="Price Range"
                    >
                      {priceRanges.map(range => (
                        <MenuItem key={range.value} value={range.value}>
                          {range.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Per Page</InputLabel>
                    <Select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      label="Per Page"
                    >
                      {itemsPerPageOptions.map(option => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      onClick={() => setViewMode('grid')}
                      color={viewMode === 'grid' ? 'primary' : 'default'}
                      sx={{ border: 1, borderColor: viewMode === 'grid' ? 'primary.main' : 'divider' }}
                    >
                      <GridViewIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => setViewMode('list')}
                      color={viewMode === 'list' ? 'primary' : 'default'}
                      sx={{ border: 1, borderColor: viewMode === 'list' ? 'primary.main' : 'divider' }}
                    >
                      <ListViewIcon />
                    </IconButton>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    startIcon={<ClearIcon />}
                    fullWidth
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Active Filters */}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {priceFilter !== 'all' && (
                  <Chip
                    label={`Price: ${priceRanges.find(r => r.value === priceFilter)?.label}`}
                    onDelete={() => setPriceFilter('all')}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
                {sortBy !== 'relevance' && (
                  <Chip
                    label={`Sort: ${sortOptions.find(s => s.value === sortBy)?.label}`}
                    onDelete={() => setSortBy('relevance')}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Stack>
            </Paper>

            {/* Products Grid */}
            <Grid container spacing={3}>
              {currentProducts.map((product, index) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={viewMode === 'list' ? 12 : 6} 
                  md={viewMode === 'list' ? 12 : 4} 
                  lg={viewMode === 'list' ? 12 : 3} 
                  key={product._id}
                >
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: 3,
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                        '& .product-actions': {
                          opacity: 1,
                          transform: 'translateY(0)',
                        },
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        sx={{
                          height: viewMode === 'list' ? 150 : 200,
                          objectFit: 'cover',
                        }}
                        image={getProductImage(product, index)}
                        alt={product.title}
                        onError={(e: any) => {
                          e.target.src = `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&sig=${index}`;
                        }}
                      />

                      {/* Stock Badge */}
                      {product.stock <= 10 && product.stock > 0 && (
                        <Chip
                          label="Low Stock"
                          size="small"
                          color="warning"
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
                          size="small"
                          color="error"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            fontWeight: 'bold',
                          }}
                        />
                      )}

                      {/* Action Buttons */}
                      <Box
                        className="product-actions"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
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

                    <CardActionArea onClick={() => handleProductClick(product._id)}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold" 
                          gutterBottom
                          sx={{
                            fontSize: '1rem',
                            lineHeight: 1.3,
                            height: '2.6em',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                          title={product.title}
                        >
                          {product.title}
                        </Typography>

                        {product.brand && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {product.brand}
                          </Typography>
                        )}

                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                          <Chip 
                            label={product.category} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        </Stack>

                        {/* Rating */}
                        {product.rating && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ display: 'flex', mr: 1 }}>
                              {renderStars(product.rating)}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              ({product.rating.toFixed(1)})
                            </Typography>
                          </Box>
                        )}

                        {/* Price */}
                        <Typography 
                          variant="h6" 
                          color="primary" 
                          fontWeight="bold"
                          sx={{ fontSize: '1.2rem' }}
                        >
                          {formatPrice(product.price)}
                        </Typography>

                        {/* Stock */}
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mt: 1,
                            color: product.stock > 10 ? 'success.main' : product.stock > 0 ? 'warning.main' : 'error.main'
                          }}
                        >
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Stack spacing={2} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Showing {startIndex + 1} - {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                    </Typography>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                    />
                  </Stack>
                </Paper>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default SearchResults;