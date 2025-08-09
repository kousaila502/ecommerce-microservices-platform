import axiosClient, { apiUrl } from "./config"

// Define Deal interfaces to match your backend
export interface Deal {
    dealId: number;
    productId: number;
    variantSku: string;
    department: string;
    thumbnail: string;
    image: string;
    title: string;
    description: string;
    shortDescription: string;
    price: number;
    originalPrice?: number;
    currency: string;
    rating: number;
    discount?: number;
    isActive: boolean;
    startDate: string;
    endDate?: string;
    lastUpdated: string;
}

export interface DealsResponse {
    success: boolean;
    data: Deal[];
    count: number;
    message?: string;
}

export interface DealResponse {
    success: boolean;
    data: Deal;
    message?: string;
}

// Get all deals with filters
export const getAllDeals = async (params?: {
    limit?: number;
    department?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
}): Promise<Deal[] | null> => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.department) queryParams.append('department', params.department);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
        if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());

        const response = await axiosClient.get(apiUrl.products(`deals?${queryParams.toString()}`));

        if (response.data.success) {
            return response.data.data;
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching deals:', error);
        return null;
    }
};

// Get deal by ID
export const getDealById = async (dealId: number): Promise<Deal | null> => {
    try {
        const response = await axiosClient.get(apiUrl.products(`deals/${dealId}`));

        if (response.data.success) {
            return response.data.data;
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching deal:', error);
        return null;
    }
};

// Search deals
export const searchDeals = async (searchTerm: string, limit?: number): Promise<Deal[] | null> => {
    try {
        const response = await axiosClient.get(apiUrl.products(`deals/search/${encodeURIComponent(searchTerm)}?limit=${limit || 20}`));

        if (response.data.success) {
            return response.data.data;
        }
        return response.data;
    } catch (error) {
        console.error('Error searching deals:', error);
        return null;
    }
};

// Get top rated deals
export const getTopRatedDeals = async (limit?: number): Promise<Deal[] | null> => {
    try {
        const response = await axiosClient.get(apiUrl.products(`deals/top-rated?limit=${limit || 10}`));

        if (response.data.success) {
            return response.data.data;
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching top rated deals:', error);
        return null;
    }
};

// Get recent deals
export const getRecentDeals = async (limit?: number): Promise<Deal[] | null> => {
    try {
        const response = await axiosClient.get(apiUrl.products(`deals/recent?limit=${limit || 20}`));

        if (response.data.success) {
            return response.data.data;
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching recent deals:', error);
        return null;
    }
};

// Seed sample deals
export const seedDeals = async (): Promise<boolean> => {
    try {
        const response = await axiosClient.post(apiUrl.products('deals/seed'));
        return response.data.success || response.status === 200;
    } catch (error) {
        console.error('Error seeding deals:', error);
        return false;
    }
};

export default {
    getAllDeals,
    getDealById,
    searchDeals,
    getTopRatedDeals,
    getRecentDeals,
    seedDeals
};