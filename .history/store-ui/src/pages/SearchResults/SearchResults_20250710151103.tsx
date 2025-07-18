import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Card, CardContent,
  CardActionArea, Paper, CircularProgress, Alert, Chip
} from '@mui/material';
import { searchProducts, Product } from '../../api/products';

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const query = searchParams.get('q');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
        const result = await searchProducts(searchQuery, 20);
        if (result) {
          setProducts(result);
        } else {
          setError('No products found.');
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Something went wrong while searching.');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, category]);

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {category ? `${category} Products` : 'Search Results'}
        </Typography>

        {query && (
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            Results for: <strong>"{query}"</strong>
          </Typography>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Searching products...</Typography>
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : products.length === 0 ? (
          <Alert severity="info">No products found.</Alert>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <Card
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                >
                  <CardActionArea onClick={() => handleProductClick(product._id)}>
                    <Box sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                      <img
                        src={product.image || '/placeholder.jpg'}
                        alt={product.title}
                        style={{
                          width: '100%',
                          maxWidth: '150px',
                          height: '150px',
                          objectFit: 'contain',
                          borderRadius: '4px'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.jpg';
                        }}
                      />
                    </Box>
                    <CardContent>
                      <Typography variant="h6" gutterBottom noWrap title={product.title}>
                        {product.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.brand}
                      </Typography>
                      <Chip label={product.category} size="small" variant="outlined" sx={{ mt: 1 }} />
                      <Typography variant="h6" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                        {product.currency}{product.price}
                      </Typography>
                      {product.stock <= 0 && (
                        <Typography variant="body2" color="error">
                          Out of Stock
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default SearchResults;
