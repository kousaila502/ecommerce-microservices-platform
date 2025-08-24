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
    Skeleton,
    IconButton,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    Pagination,
    Breadcrumbs,
    Link,
    Tooltip,
    Badge,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Slider,
    Checkbox,
    FormGroup,
    FormControlLabel,
    useTheme,
    alpha,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Star as StarIcon,
    ShoppingCart as CartIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    ViewModule as GridIcon,
    ViewList as ListIcon,
    Sort as SortIcon,
    Clear as ClearIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Visibility as ViewIcon,
    TrendingUp as TrendingIcon,
    LocalOffer as OfferIcon,
    Inventory as StockIcon,
    Category as CategoryIcon,
    MonetizationOn as PriceIcon,
    BrandingWatermark as BrandIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllProducts } from '../../api/products';

// Sort options
const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
];

const itemsPerPageOptions = [12, 24, 36, 48];

const Products: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    
    // States
    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    
    // Filter and view states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('relevance');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [itemsPerPage, setItemsPerPage] = useState(12);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    
    // Filter states
    const [priceRange, setPriceRange] = useState<number[]>([0, 2000]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [minRating, setMinRating] = useState(0);
    
    // Derived states
    const [categories, setCategories] = useState<string[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [priceRangeMax, setPriceRangeMax] = useState(2000);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        applyFiltersAndSort();
    }, [products, searchTerm, sortBy, priceRange, selectedCategories, selectedBrands, inStockOnly, minRating]);

    useEffect(() => {
        setCurrentPage(1); // Reset page when filters change
    }, [searchTerm, sortBy, priceRange, selectedCategories, selectedBrands, inStockOnly, minRating]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllProducts();
            
            if (data && data.length > 0) {
                setProducts(data);
                
                // Extract unique categories and brands
                const uniqueCategories = Array.from(new Set(data.map((p: any) => p.category).filter(Boolean)));
                const uniqueBrands = Array.from(new Set(data.map((p: any) => p.brand).filter(Boolean)));
                setCategories(uniqueCategories);
                setBrands(uniqueBrands);
                
                // Set price range max
                const maxPrice = Math.max(...data.map((p: any) => p.price));
                setPriceRangeMax(maxPrice);
                setPriceRange([0, maxPrice]);
            } else {
                setProducts([]);
            }
        } catch (err) {
            setError('Failed to load products');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSort = () => {
        let filtered = [...products];

        // Apply search filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.title?.toLowerCase().includes(term) ||
                product.brand?.toLowerCase().includes(term) ||
                product.category?.toLowerCase().includes(term)
            );
        }

        // Apply price range filter
        filtered = filtered.filter(product => 
            product.price >= priceRange[0] && product.price <= priceRange[1]
        );

        // Apply category filter
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(product => 
                selectedCategories.includes(product.category)
            );
        }

        // Apply brand filter
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(product => 
                selectedBrands.includes(product.brand)
            );
        }

        // Apply stock filter
        if (inStockOnly) {
            filtered = filtered.filter(product => product.stock > 0);
        }

        // Apply rating filter
        if (minRating > 0) {
            filtered = filtered.filter(product => (product.rating || 0) >= minRating);
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
                filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                break;
            case 'popular':
                // Sort by a combination of rating and stock (popularity proxy)
                filtered.sort((a, b) => ((b.rating || 0) * b.stock) - ((a.rating || 0) * a.stock));
                break;
            default:
                // Keep original order for relevance
                break;
        }

        setFilteredProducts(filtered);
    };

    const toggleFavorite = (productId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        const newFavorites = new Set(favorites);
        if (newFavorites.has(productId)) {
            newFavorites.delete(productId);
        } else {
            newFavorites.add(productId);
        }
        setFavorites(newFavorites);
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setPriceRange([0, priceRangeMax]);
        setSelectedCategories([]);
        setSelectedBrands([]);
        setInStockOnly(false);
        setMinRating(0);
        setSortBy('relevance');
    };

    const formatPrice = (price: number, currency: string = '$') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency === '$' ? 'USD' : 'USD'
        }).format(price);
    };

    const getProductImage = (product: any, index: number) => {
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
            'Smart TVs': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop',
            'Tablets': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop'
        };

        return categoryImages[product.category] || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&sig=${index}`;
    };

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (searchTerm.trim()) count++;
        if (priceRange[0] > 0 || priceRange[1] < priceRangeMax) count++;
        if (selectedCategories.length > 0) count++;
        if (selectedBrands.length > 0) count++;
        if (inStockOnly) count++;
        if (minRating > 0) count++;
        return count;
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

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Header Skeleton */}
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3, mb: 4 }} />
                
                {/* Controls Skeleton */}
                <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                    <Grid container spacing={3}>
                        {Array.from(new Array(4)).map((_, i) => (
                            <Grid item xs={12} sm={6} md={3} key={i}>
                                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
                            </Grid>
                        ))}
                    </Grid>
                </Paper>

                {/* Products Skeleton */}
                <Grid container spacing={3}>
                    {Array.from(new Array(12)).map((_, index) => (
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
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button variant="contained" onClick={fetchProducts}>
                            Try Again
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/')}>
                            Go Home
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="xl">
                {/* Breadcrumbs */}
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link 
                        component="button" 
                        variant="body2" 
                        onClick={() => navigate('/')}
                        sx={{ textDecoration: 'none' }}
                    >
                        Home
                    </Link>
                    <Typography variant="body2" color="text.primary">
                        All Products
                    </Typography>
                </Breadcrumbs>

                <Fade in timeout={800}>
                    <Box>
                        {/* Enhanced Header */}
                        <Paper sx={{ 
                            p: 4, 
                            mb: 4, 
                            textAlign: 'center', 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                            color: 'white',
                            borderRadius: 4,
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                            }
                        }}>
                            <Typography variant="h2" fontWeight="bold" gutterBottom sx={{ position: 'relative', zIndex: 1 }}>
                                All Products
                            </Typography>
                            <Typography variant="h5" sx={{ opacity: 0.9, position: 'relative', zIndex: 1 }}>
                                Discover our complete collection
                            </Typography>
                            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2, position: 'relative', zIndex: 1 }}>
                                <Chip 
                                    icon={<CategoryIcon />} 
                                    label={`${categories.length} Categories`} 
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                                />
                                <Chip 
                                    icon={<StockIcon />} 
                                    label={`${filteredProducts.length} Products`} 
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
                                />
                            </Stack>
                        </Paper>

                        {/* Controls Section */}
                        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                            <Grid container spacing={3} alignItems="center">
                                {/* Search */}
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon />
                                                </InputAdornment>
                                            ),
                                            endAdornment: searchTerm && (
                                                <InputAdornment position="end">
                                                    <IconButton 
                                                        onClick={() => setSearchTerm('')}
                                                        size="small"
                                                    >
                                                        <ClearIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ borderRadius: 2 }}
                                    />
                                </Grid>

                                {/* Sort */}
                                <Grid item xs={12} sm={6} md={2}>
                                    <FormControl fullWidth>
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

                                {/* Items per page */}
                                <Grid item xs={12} sm={6} md={2}>
                                    <FormControl fullWidth>
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

                                {/* View Mode */}
                                <Grid item xs={12} sm={6} md={2}>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                                            onClick={() => setViewMode('grid')}
                                            sx={{ minWidth: 'auto', p: 1.5 }}
                                        >
                                            <GridIcon />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'contained' : 'outlined'}
                                            onClick={() => setViewMode('list')}
                                            sx={{ minWidth: 'auto', p: 1.5 }}
                                        >
                                            <ListIcon />
                                        </Button>
                                    </Stack>
                                </Grid>

                                {/* Filter Button */}
                                <Grid item xs={12} sm={6} md={2}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<FilterIcon />}
                                        onClick={() => setFilterDrawerOpen(true)}
                                        sx={{
                                            position: 'relative',
                                            py: 1.5,
                                        }}
                                    >
                                        Filters
                                        {getActiveFiltersCount() > 0 && (
                                            <Badge 
                                                badgeContent={getActiveFiltersCount()} 
                                                color="primary" 
                                                sx={{
                                                    position: 'absolute',
                                                    top: -5,
                                                    right: -5,
                                                }}
                                            />
                                        )}
                                    </Button>
                                </Grid>
                            </Grid>

                            {/* Active Filters Display */}
                            {getActiveFiltersCount() > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                                        <Typography variant="body2" color="text.secondary">
                                            Active filters:
                                        </Typography>
                                        {searchTerm && (
                                            <Chip 
                                                label={`Search: "${searchTerm}"`}
                                                onDelete={() => setSearchTerm('')}
                                                size="small"
                                                color="primary"
                                            />
                                        )}
                                        {selectedCategories.map(category => (
                                            <Chip 
                                                key={category}
                                                label={`Category: ${category}`}
                                                onDelete={() => setSelectedCategories(prev => prev.filter(c => c !== category))}
                                                size="small"
                                                color="primary"
                                            />
                                        ))}
                                        <Button 
                                            size="small" 
                                            onClick={clearAllFilters}
                                            startIcon={<ClearIcon />}
                                        >
                                            Clear All
                                        </Button>
                                    </Stack>
                                </Box>
                            )}
                        </Paper>

                        {/* Results Count */}
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
                            Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                        </Typography>

                        {filteredProducts.length === 0 ? (
                            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                                <Typography variant="h5" gutterBottom>
                                    No products found
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                    Try adjusting your filters or search terms
                                </Typography>
                                <Button variant="contained" onClick={clearAllFilters}>
                                    Clear All Filters
                                </Button>
                            </Paper>
                        ) : (
                            <>
                                {/* Products Grid */}
                                <Grid container spacing={3}>
                                    {currentProducts.map((product, index) => {
                                        const productId = product._id || product.id;
                                        const productName = product.title || product.name;
                                        const productPrice = product.price;
                                        const productRating = product.rating || (4.2 + Math.random() * 0.6);
                                        const isFav = favorites.has(productId);

                                        return (
                                            <Grid 
                                                item 
                                                xs={12} 
                                                sm={viewMode === 'list' ? 12 : 6} 
                                                md={viewMode === 'list' ? 12 : 4} 
                                                lg={viewMode === 'list' ? 12 : 3} 
                                                key={productId}
                                            >
                                                <Card
                                                    sx={{
                                                        height: '100%',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        borderRadius: 3,
                                                        overflow: 'hidden',
                                                        position: 'relative',
                                                        '&:hover': {
                                                            transform: 'translateY(-8px)',
                                                            boxShadow: '0 16px 32px rgba(0,0,0,0.15)',
                                                            '& .product-actions': {
                                                                opacity: 1,
                                                                transform: 'translateY(0)',
                                                            },
                                                        },
                                                    }}
                                                    onClick={() => navigate(`/product/${productId}`)}
                                                >
                                                    <Box sx={{ position: 'relative' }}>
                                                        <CardMedia
                                                            component="img"
                                                            sx={{
                                                                height: viewMode === 'list' ? 150 : 220,
                                                                objectFit: 'cover',
                                                            }}
                                                            image={getProductImage(product, index)}
                                                            alt={productName}
                                                            onError={(e: any) => {
                                                                e.target.src = `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&sig=${index}`;
                                                            }}
                                                        />

                                                        {/* Stock Badges */}
                                                        <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                                                            {product.stock === 0 ? (
                                                                <Chip
                                                                    label="Out of Stock"
                                                                    color="error"
                                                                    size="small"
                                                                    sx={{ fontWeight: 'bold' }}
                                                                />
                                                            ) : product.stock <= 5 ? (
                                                                <Chip
                                                                    label={`Only ${product.stock} left!`}
                                                                    color="warning"
                                                                    size="small"
                                                                    sx={{ fontWeight: 'bold' }}
                                                                />
                                                            ) : (
                                                                <Chip
                                                                    label="In Stock"
                                                                    color="success"
                                                                    size="small"
                                                                />
                                                            )}
                                                        </Box>

                                                        {/* Popular/Rating Badge */}
                                                        {productRating >= 4.5 && (
                                                            <Chip
                                                                label="⭐ Top Rated"
                                                                color="info"
                                                                size="small"
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 12,
                                                                    right: 12,
                                                                    fontWeight: 'bold',
                                                                }}
                                                            />
                                                        )}

                                                        {/* Action Buttons */}
                                                        <Box
                                                            className="product-actions"
                                                            sx={{
                                                                position: 'absolute',
                                                                bottom: 12,
                                                                right: 12,
                                                                opacity: 0,
                                                                transform: 'translateY(10px)',
                                                                transition: 'all 0.3s ease',
                                                                display: 'flex',
                                                                gap: 1,
                                                            }}
                                                        >
                                                            <Tooltip title={isFav ? "Remove from favorites" : "Add to favorites"}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => toggleFavorite(productId, e)}
                                                                    sx={{
                                                                        bgcolor: 'rgba(255,255,255,0.95)',
                                                                        '&:hover': { 
                                                                            bgcolor: 'white', 
                                                                            color: 'error.main',
                                                                            transform: 'scale(1.1)',
                                                                        },
                                                                    }}
                                                                >
                                                                    {isFav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Quick view">
                                                                <IconButton
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: 'rgba(255,255,255,0.95)',
                                                                        '&:hover': { 
                                                                            bgcolor: 'white', 
                                                                            color: 'primary.main',
                                                                            transform: 'scale(1.1)',
                                                                        },
                                                                    }}
                                                                >
                                                                    <ViewIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
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
                                                            }}
                                                        >
                                                            {productName}
                                                        </Typography>

                                                        {/* Brand & Category */}
                                                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                                            {product.brand && (
                                                                <Chip
                                                                    label={product.brand}
                                                                    variant="outlined"
                                                                    size="small"
                                                                    sx={{ fontSize: '0.7rem' }}
                                                                />
                                                            )}
                                                            <Chip
                                                                label={product.category}
                                                                variant="outlined"
                                                                size="small"
                                                                color="primary"
                                                                sx={{ fontSize: '0.7rem' }}
                                                            />
                                                        </Stack>

                                                        {/* Rating */}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <Box sx={{ display: 'flex', mr: 1 }}>
                                                                {renderStars(productRating)}
                                                            </Box>
                                                            <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                                                {productRating.toFixed(1)} ({Math.floor(Math.random() * 500) + 50})
                                                            </Typography>
                                                        </Box>

                                                        {/* Price */}
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <Typography variant="h5" color="primary.main" fontWeight="bold">
                                                                {formatPrice(productPrice, product.currency)}
                                                            </Typography>
                                                            
                                                            <IconButton
                                                                color="primary"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // Add to cart functionality
                                                                }}
                                                                sx={{
                                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                    '&:hover': {
                                                                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                                                                        transform: 'scale(1.1)',
                                                                    }
                                                                }}
                                                            >
                                                                <CartIcon />
                                                            </IconButton>
                                                        </Box>

                                                        {/* Stock Info */}
                                                        <Typography 
                                                            variant="caption" 
                                                            sx={{ 
                                                                display: 'block',
                                                                mt: 1,
                                                                color: product.stock > 10 ? 'success.main' : product.stock > 0 ? 'warning.main' : 'error.main',
                                                                fontWeight: 'medium',
                                                            }}
                                                        >
                                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                                </Grid>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                                            <Stack spacing={2} alignItems="center">
                                                <Typography variant="body2" color="text.secondary">
                                                    Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                                                </Typography>
                                                <Pagination
                                                    count={totalPages}
                                                    page={currentPage}
                                                    onChange={handlePageChange}
                                                    color="primary"
                                                    size="large"
                                                    showFirstButton
                                                    showLastButton
                                                    sx={{
                                                        '& .MuiPaginationItem-root': {
                                                            borderRadius: 2,
                                                        }
                                                    }}
                                                />
                                            </Stack>
                                        </Paper>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </Fade>

                {/* Filter Drawer */}
                <Drawer
                    anchor="right"
                    open={filterDrawerOpen}
                    onClose={() => setFilterDrawerOpen(false)}
                    PaperProps={{
                        sx: { width: 350, p: 3 }
                    }}
                >
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Filters
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="body2">
                                {getActiveFiltersCount()} active filter{getActiveFiltersCount() !== 1 ? 's' : ''}
                            </Typography>
                            <Button size="small" onClick={clearAllFilters} startIcon={<ClearIcon />}>
                                Clear All
                            </Button>
                        </Stack>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Price Range */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PriceIcon /> Price Range
                        </Typography>
                        <Box sx={{ px: 2 }}>
                            <Slider
                                value={priceRange}
                                onChange={(_, newValue) => setPriceRange(newValue as number[])}
                                valueLabelDisplay="auto"
                                min={0}
                                max={priceRangeMax}
                                step={10}
                                valueLabelFormat={(value) => `${value}`}
                                marks={[
                                    { value: 0, label: '$0' },
                                    { value: priceRangeMax / 2, label: `${Math.round(priceRangeMax / 2)}` },
                                    { value: priceRangeMax, label: `${priceRangeMax}` },
                                ]}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                            ${priceRange[0]} - ${priceRange[1]}
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Categories */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CategoryIcon /> Categories
                        </Typography>
                        <FormGroup>
                            {categories.map(category => (
                                <FormControlLabel
                                    key={category}
                                    control={
                                        <Checkbox
                                            checked={selectedCategories.includes(category)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCategories([...selectedCategories, category]);
                                                } else {
                                                    setSelectedCategories(selectedCategories.filter(c => c !== category));
                                                }
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2">
                                            {category} ({products.filter(p => p.category === category).length})
                                        </Typography>
                                    }
                                />
                            ))}
                        </FormGroup>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Brands */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BrandIcon /> Brands
                        </Typography>
                        <FormGroup sx={{ maxHeight: 200, overflowY: 'auto' }}>
                            {brands.map(brand => (
                                <FormControlLabel
                                    key={brand}
                                    control={
                                        <Checkbox
                                            checked={selectedBrands.includes(brand)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedBrands([...selectedBrands, brand]);
                                                } else {
                                                    setSelectedBrands(selectedBrands.filter(b => b !== brand));
                                                }
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2">
                                            {brand} ({products.filter(p => p.brand === brand).length})
                                        </Typography>
                                    }
                                />
                            ))}
                        </FormGroup>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Rating Filter */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StarIcon /> Minimum Rating
                        </Typography>
                        <FormGroup>
                            {[4, 3, 2, 1].map(rating => (
                                <FormControlLabel
                                    key={rating}
                                    control={
                                        <Checkbox
                                            checked={minRating === rating}
                                            onChange={(e) => {
                                                setMinRating(e.target.checked ? rating : 0);
                                            }}
                                        />
                                    }
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ display: 'flex' }}>
                                                {renderStars(rating)}
                                            </Box>
                                            <Typography variant="body2">& up</Typography>
                                        </Box>
                                    }
                                />
                            ))}
                        </FormGroup>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Stock Filter */}
                    <Box>
                        <Typography variant="h6" gutterBottom fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StockIcon /> Availability
                        </Typography>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={inStockOnly}
                                    onChange={(e) => setInStockOnly(e.target.checked)}
                                />
                            }
                            label="In stock only"
                        />
                    </Box>
                </Drawer>
            </Container>
        </Box>
    );
};

export default Products;