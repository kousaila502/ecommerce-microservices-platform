import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import { useNavigate } from 'react-router-dom';
import { searchProducts, SearchResponse } from '../../api/search';

const SearchResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const query = searchParams.get('q');
  
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      setError('');
      
      try {
        let searchQuery = query || '';
        
        // If it's a category search without query, use category name as query
        if (category && !query) {
          searchQuery = category;
        }
        
        // If both category and query exist, search for the query term
        if (category && query) {
          searchQuery = query;
        }
        
        if (!searchQuery.trim()) {
          setError('Please provide a search term');
          setLoading(false);
          return;
        }

        console.log(`Performing search for: "${searchQuery}" ${category ? `in category: ${category}` : ''}`);
        
        const result = await searchProducts(searchQuery, category || undefined);
        
        if (result) {
          setSearchResponse(result);
          
          // Log results for debugging
          console.log(`Search completed: ${result.total} results found`);
          if (result.products.length > 0) {
            console.log('Sample product:', result.products[0]);
          }
        } else {
          setError('Failed to search products. Make sure the Search microservice is running on port 4000 and Elasticsearch is accessible.');
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Search service is not available. Please ensure the Search microservice and Elasticsearch are running.');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [category, query]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Searching products...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {error}
          <br />
          <strong>Make sure:</strong>
          <ul>
            <li>Search microservice is running: <code>cd search-cna-microservice && npm start</code></li>
            <li>Elasticsearch is running on port 9200</li>
            <li>Search service is accessible at http://localhost:4000</li>
            <li>Elasticsearch has product data indexed</li>
          </ul>
          <br />
          <strong>Debug steps:</strong>
          <ul>
            <li>Test: <code>curl http://localhost:4000/</code></li>
            <li>Test: <code>curl "http://localhost:4000/_search"</code></li>
            <li>Test: <code>curl "http://localhost:4000/_cat/indices"</code></li>
          </ul>
        </Alert>
      </Box>
    );
  }

  const products = searchResponse?.products || [];
  const total = searchResponse?.total || 0;

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {category ? `${category} Products` : 'Search Results'}
          </Typography>
          
          {query && (
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
              Search results for: <strong>"{query}"</strong>
              {category && ` in category: ${category}`}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip 
              label={`${total} result${total !== 1 ? 's' : ''} found`} 
              color="primary" 
              variant="outlined" 
            />
            {category && (
              <Chip 
                label={`Category: ${category}`} 
                color="secondary" 
                variant="filled" 
                size="small"
              />
            )}
          </Box>
        </Box>

        {/* Results Section */}
        {products.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              No products found {category ? `in ${category} category` : 'for your search'}
            </Typography>
            <Typography variant="body2">
              {query && `No results for "${query}". `}
              Try different search terms or browse other categories.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Suggestions:</strong>
              </Typography>
              <ul>
                <li>Check your spelling</li>
                <li>Try more general terms</li>
                <li>Browse categories from the homepage</li>
                <li>Make sure products are indexed in Elasticsearch</li>
              </ul>
            </Box>
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {products.map((product: any) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                <Card sx={{ height: '100%', cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardActionArea 
                    onClick={() => handleProductClick(product._id)}
                    sx={{ height: '100%' }}
                  >
                    <Box sx={{ p: 2, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
                      <img 
                        src={product.thumbnail || '/placeholder.jpg'}
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
                        {product.title || 'Unknown Product'}
                      </Typography>
                      
                      {product.brand && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Brand: {product.brand}
                        </Typography>
                      )}
                      
                      {product.category && (
                        <Chip 
                          label={product.category} 
                          size="small" 
                          variant="outlined" 
                          sx={{ mb: 1 }} 
                        />
                      )}
                      
                      <Typography variant="h5" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                        {product.currency || '$'}{product.price || '0.00'}
                      </Typography>
                      
                      {product.rating && product.rating > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            ⭐ {product.rating}
                          </Typography>
                        </Box>
                      )}
                      
                      {product.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 1, 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {product.description}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Footer Actions */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {products.length} of {total} results
          </Typography>
          
          {products.length === 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate('/')}
              >
                ← Back to Homepage
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default SearchResults;