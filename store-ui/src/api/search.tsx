import axiosClient, { searchUrl } from "./config"

// Define search result types for Elasticsearch
export interface SearchProduct {
    _id: string;
    _source: {
        title: string;
        description: string;
        price: number;
        currency: string;
        thumbnail: string;
        category: string;
        brand?: string;
        rating?: number;
    };
}

export interface ElasticsearchResponse {
    hits: {
        total: {
            value: number;
        };
        hits: SearchProduct[];
    };
}

export interface SearchResponse {
    products: any[];
    total: number;
    query: string;
    page?: number;
    limit?: number;
}

// Search products by query using Elasticsearch syntax
export const searchProducts = async (query: string, category?: string): Promise<SearchResponse | null> => {
    if (!query.trim()) {
        console.error('Search query is required');
        return null;
    }

    try {
        // Try different Elasticsearch endpoints
        const endpoints = [
            `${searchUrl}_search?q=${encodeURIComponent(query)}`,
            `${searchUrl}products/_search?q=${encodeURIComponent(query)}`,
            `${searchUrl}product/_search?q=${encodeURIComponent(query)}`,
            `${searchUrl}items/_search?q=${encodeURIComponent(query)}`,
        ];

        let response = null;
        let lastError = null;

        // Try each endpoint until one works
        for (const endpoint of endpoints) {
            try {
                console.log(`Trying endpoint: ${endpoint}`);
                response = await axiosClient.get(endpoint);
                
                // If we get here, the request succeeded
                console.log('Successful endpoint:', endpoint);
                console.log('Response data:', response.data);
                break;
            } catch (err: any) {
                console.log(`Endpoint ${endpoint} failed:`, err.message);
                lastError = err;
                continue;
            }
        }

        if (!response) {
            throw lastError || new Error('All search endpoints failed');
        }

        // Check if response is Elasticsearch format
        const data = response.data;
        
        if (data.hits) {
            // Parse Elasticsearch response
            const esResponse: ElasticsearchResponse = data;
            
            const products = esResponse.hits.hits.map((hit: SearchProduct) => ({
                _id: hit._id,
                title: hit._source?.title || 'Unknown Product',
                description: hit._source?.description || '',
                price: hit._source?.price || 0,
                currency: hit._source?.currency || '$',
                thumbnail: hit._source?.thumbnail || '/placeholder.jpg',
                category: hit._source?.category || '',
                brand: hit._source?.brand || '',
                rating: hit._source?.rating || 0,
            }));

            return {
                products: products,
                total: esResponse.hits.total?.value || 0,
                query: query
            };
        } else if (Array.isArray(data)) {
            // Handle array response
            return {
                products: data,
                total: data.length,
                query: query
            };
        } else if (data.products) {
            // Handle custom API response
            return {
                products: data.products,
                total: data.total || data.products.length,
                query: query
            };
        } else {
            // Unknown response format
            console.log('Unexpected response format:', data);
            return {
                products: [],
                total: 0,
                query: query
            };
        }

    } catch (err: any) {
        console.error('Error searching products:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
        
        // Return empty results instead of null for better UX
        return {
            products: [],
            total: 0,
            query: query
        };
    }
}

// Get search suggestions (basic implementation)
export const getSearchSuggestions = async (query: string): Promise<string[] | null> => {
    if (!query.trim() || query.length < 2) {
        return [];
    }

    try {
        // Use Elasticsearch suggest API or basic search
        const response = await axiosClient.get(`${searchUrl}_search?q=${encodeURIComponent(query)}&size=5`);
        
        // Extract suggestions from search results
        const data = response.data;
        if (data.hits && data.hits.hits) {
            const suggestions = data.hits.hits.map((hit: SearchProduct) => 
                hit._source?.title || ''
            ).filter((title: string) => title.length > 0);
            return suggestions.slice(0, 5);
        }
        
        return [];
    } catch (err: any) {
        console.error('Error getting search suggestions:', err.message);
        return [];
    }
}

export default searchProducts