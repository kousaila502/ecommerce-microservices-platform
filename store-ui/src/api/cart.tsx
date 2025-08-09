import axiosClient, { apiUrl } from "./config"

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

// UPDATED: Add item to cart (using apiUrl helper and matching Java endpoints)
export const addToCart = async (userId: number, item: AddToCartPayload, token: string): Promise<string | null> => {
    try {
        // Use apiUrl.cart() helper and query params to match Java controller
        const response = await axiosClient.post(
            apiUrl.cart(`items?productId=${item.productId}&quantity=${item.quantity}`),
            {}, // Empty body since Java uses query params
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (err: any) {
        console.error('Error adding to cart:', err.message);
        if (err.response) {
            console.error('Response status:', err.response.status);
            console.error('Response data:', err.response.data);
        }
        return null;
    }
}

// UPDATED: Get cart (using apiUrl helper)
export const getCart = async (userId: number, token: string): Promise<Cart | null> => {
    try {
        const response = await axiosClient.get(apiUrl.cart(`${userId}`), {
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

// UPDATED: Update item quantity (using apiUrl helper)
export const updateCartItemQuantity = async (
    userId: number,
    productId: number,
    quantity: number,
    token: string
): Promise<string | null> => {
    try {
        const response = await axiosClient.put(
            apiUrl.cart(`items/${productId}?quantity=${quantity}`),
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

// UPDATED: Remove item from cart (using apiUrl helper)
export const removeFromCart = async (
    userId: number,
    productId: number,
    token: string
): Promise<string | null> => {
    try {
        const response = await axiosClient.delete(apiUrl.cart(`items/${productId}`), {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (err: any) {
        console.error('Error removing item from cart:', err.message);
        return null;
    }
}

// UPDATED: Clear entire cart (using apiUrl helper)
export const clearCart = async (userId: number, token: string): Promise<string | null> => {
    try {
        const response = await axiosClient.delete(apiUrl.cart(''), {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (err: any) {
        console.error('Error clearing cart:', err.message);
        return null;
    }
}

// UPDATED: Get cart summary (using apiUrl helper)
export const getCartSummary = async (token: string): Promise<any | null> => {
    try {
        const response = await axiosClient.get(apiUrl.cart('summary'), {
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

// UPDATED: Validate cart (using apiUrl helper)
export const validateCart = async (token: string): Promise<any | null> => {
    try {
        const response = await axiosClient.get(apiUrl.cart('validate'), {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (err: any) {
        console.error('Error validating cart:', err.message);
        return null;
    }
}
