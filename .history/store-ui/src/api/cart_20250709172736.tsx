import axiosClient, { cartUrl } from "./config"

// Define proper types
export interface CartItem {
    productId: string;
    sku: string;
    title: string;
    quantity: number;
    price: number;
    currency: string;
}

export interface Cart {
    customerId: string;
    items: CartItem[];
    totalAmount?: number;
}

export interface AddToCartPayload {
    productId: string;
    sku: string;
    title: string;
    quantity: number;
    price: number;
    currency: string;
}

const addToCart = async (item: AddToCartPayload): Promise<Cart | null> => {
    try {
        const response = await axiosClient.post(`${cartUrl}cart`, {
            customerId: "john@example.com",
            items: [
                {
                    productId: item.productId,
                    sku: item.sku,
                    title: item.title,
                    quantity: item.quantity,
                    price: item.price,
                    currency: item.currency
                }
            ]
        });
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

export const getCart = async (): Promise<Cart | null> => {
    try {
        const response = await axiosClient.get(`${cartUrl}cart/john@example.com`);
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

export default addToCart

export const clearCart = async (userId: number, token: string) => {
  try {
    const response = await axiosClient.delete(`${cartUrl}cart/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err: any) {
    console.error("Failed to clear cart:", err.response?.data || err.message);
    throw err;
  }
};
