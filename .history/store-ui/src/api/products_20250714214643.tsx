import axiosClient, { productsUrl } from "./config"

// Define proper types
// UPDATED: Product interface for new simplified structure
export interface Product {
    _id: number;           // Changed from string to number
    sku: string;          // Direct SKU field
    title: string;
    description: string;
    price: number;
    currency: string;
    category: string;
    department: string;
    image: string;        // Direct image field
    stock: number;        // Added stock field
    rating: number;
    brand: string;        // Direct brand field
    isActive: boolean;    // Added isActive field
    createdAt: string;
    updatedAt: string;
}

// UPDATED: API Response format
export interface ProductResponse {
    success: boolean;
    data: Product;
    message?: string;
}

export interface ProductsResponse {
    success: boolean;
    data: Product[];
    count: number;
    message?: string;
}

// Get all products with filters
export const getAllProducts = async (params?: {
    limit?: number;
    department?: string;
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
}): Promise<Product[] | null> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.department) queryParams.append('department', params.department);
        if (params?.category) queryParams.append('category', params.category);
        if (params?.brand) queryParams.append('brand', params.brand);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
        if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());

        const response = await axiosClient.get(`${productsUrl}products?${queryParams.toString()}`);
        
        // Handle new response format
        if (response.data.success) {
            return response.data.data;
        } else {
            console.error('Product API error:', response.data);
            return null;
        }
    } catch (err: any) {
        console.error('Error fetching products:', err.message);
        return null;
    }
}

// Get product by ID
export const getProductById = async (id: number): Promise<Product | null> => {
    try {
        const response = await axiosClient.get(`${productsUrl}/${id}`);
        
        // Handle new response format
        if (response.data.success) {
            return response.data.data;
        } else {
            console.error('Product API error:', response.data);
            return null;
        }
    } catch (err: any) {
        console.error('Error fetching product:', err.message);
        return null;
    }
}

// Get product by SKU (UPDATED for new response format)
export const getProductBySku = async (sku: string): Promise<Product | null> => {
    try {
        const response = await axiosClient.get(`${productsUrl}/sku/${sku}`);
        
        // Handle new response format
        if (response.data.success) {
            return response.data.data;
        } else {
            console.error('Product API error:', response.data);
            return null;
        }
    } catch (err: any) {
        console.error('Error fetching product by SKU:', err.message);
        return null;
    }
}

// Search products
export const searchProducts = async (searchTerm: string, limit?: number): Promise<Product[] | null> => {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('search', searchTerm);
        if (limit) queryParams.append('limit', limit.toString());

        const response = await axiosClient.get(`${productsUrl}?${queryParams.toString()}`);
        
        if (response.data.success) {
            return response.data.data;
        } else {
            console.error('Search API error:', response.data);
            return null;
        }
    } catch (err: any) {
        console.error('Error searching products:', err.message);
        return null;
    }
}

// Get products by department
export const getProductsByDepartment = async (department: string, limit?: number): Promise<Product[] | null> => {
    return getAllProducts({ department, limit });
}

export default { getAllProducts, getProductById, getProductBySku, searchProducts, getProductsByDepartment };
