import axiosClient, { cartUrl } from "./config"

// UPDATED: Cart interfaces for new structure
export interface CartItem {
    productId: number;    // Changed from string to number
    sku: string;
    title: string;
    quantity: number;
    price: number;
    currency: string;
}

export interface Cart {
    userId: number;       // Changed from customerId to userId
    items: CartItem[];
    total: number;        // Changed from totalAmount
    currency: string;
}

export interface AddToCartPayload {
    productId: number;    // Changed from string to number
    sku: string;
    title: string;
    quantity: number;
    price: number;
    currency: string;
}

// UPDATED: Add item to cart (with proper authentication)
export const addToCart = async (userId: number, item: AddToCartPayload, token: string): Promise<string | null> => {
    try {
        const response = await axiosClient.post(`${cartUrl}/${userId}/items`, item, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data; // Should return success message
    } catch (err: any) {
        console.error('Error adding to cart:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
        return null;
    }
}

// UPDATED: Get cart (with proper authentication)
export const getCart = async (userId: number, token: string): Promise<Cart | null> => {
    try {
        const response = await axiosClient.get(`${cartUrl}/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (err: any) {
        console.error('Error fetching cart:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
        return null;
    }
}

// UPDATED: Update item quantity
export const updateCartItemQuantity = async (
    userId: number, 
    productId: number, 
    quantity: number, 
    token: string
): Promise<string | null> => {
    try {
        const response = await axiosClient.put(
            `${cartUrl}/${userId}/items/${productId}?quantity=${quantity}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (err: any) {
        console.error('Error updating cart item:', err.message);
        return null;
    }
}

// UPDATED: Remove item from cart
export const removeFromCart = async (
    userId: number, 
    productId: number, 
    token: string
): Promise<string | null> => {
    try {
        const response = await axiosClient.delete(`${cartUrl}/${userId}/items/${productId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (err: any) {
        console.error('Error removing from cart:', err.message);
        return null;
    }
}

// Clear entire cart
export const clearCart = async (userId: number, token: string): Promise<string | null> => {
    try {
        const response = await axiosClient.delete(`${cartUrl}cart/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (err: any) {
        console.error("Failed to clear cart:", err.response?.data || err.message);
        return null;
    }
};

// Get cart summary
export const getCartSummary = async (userId: number, token: string): Promise<{itemCount: number, total: number, currency: string} | null> => {
    try {
        const response = await axiosClient.get(`${cartUrl}cart/${userId}/summary`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (err: any) {
        console.error('Error fetching cart summary:', err.message);
        return null;
    }
}

export default { addToCart, getCart, updateCartItemQuantity, removeFromCart, clearCart, getCartSummary };
