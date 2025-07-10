import axiosClient, { productsUrl } from "./config"

// Define proper types
export interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    thumbnail: string;
    rating: number;
    attributes: {
        brand: string;
    };
    variants: Array<{
        sku: string;
    }>;
}

const getProductByVariantSku = async (id: string | undefined): Promise<Product | null> => {
    if (!id) {
        console.error('Product ID is required');
        return null;
    }

    try {
        const response = await axiosClient.get(`${productsUrl}products/sku/${id}`);
        return response.data;
    } catch (err: any) {
        console.error('Error fetching product:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
        return null;
    }
}

export default getProductByVariantSku