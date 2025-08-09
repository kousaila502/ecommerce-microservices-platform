import axiosClient, { apiUrl } from "./config"

// UPDATED: Order interfaces
export interface ShippingAddress {
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

export interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    product_sku: string;
    unit_price: number;
    quantity: number;
    total_price: number;
}

export interface Order {
    id: number;
    user_id: number;
    order_number: string;
    status: string;
    payment_status: string;
    subtotal: number;
    tax_amount: number;
    shipping_amount: number;
    total_amount: number;
    shipping_address: string;
    shipping_city: string;
    customer_email: string;
    customer_phone?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    order_items: OrderItem[];
}

export interface CreateOrderPayload {
    shipping_address: ShippingAddress;
    billing_address?: ShippingAddress;
    customer_email: string;
    customer_phone?: string;
    notes?: string;
}

// UPDATED: Create order (using apiUrl helper correctly)
export const createOrder = async (
    payload: CreateOrderPayload,
    token: string
): Promise<Order | null> => {
    try {
        const response = await axiosClient.post(apiUrl.orders(''), payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error creating order:', error.response?.data || error.message);
        return null;
    }
};

// Get user's orders (using apiUrl helper correctly)
export const getUserOrders = async (token: string, page: number = 1, size: number = 10): Promise<Order[] | null> => {
    try {
        const response = await axiosClient.get(apiUrl.orders(`?page=${page}&size=${size}`), {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error fetching user orders:', error.response?.data || error.message);
        return null;
    }
};

// Get order by ID (FIXED: use apiUrl.orders() correctly)
export const getOrderById = async (id: number, token: string): Promise<Order | null> => {
    try {
        const response = await axiosClient.get(apiUrl.orders(`${id}`), {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error fetching order:', error.response?.data || error.message);
        return null;
    }
};

// ADMIN: Get all orders (FIXED: use apiUrl.orders() correctly)
export const getAllOrders = async (token: string, page: number = 1, size: number = 20): Promise<Order[] | null> => {
    try {
        const response = await axiosClient.get(apiUrl.orders(`admin?page=${page}&size=${size}`), {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error fetching all orders:', error.response?.data || error.message);
        return null;
    }
};

// ADMIN: Update order status (FIXED: use apiUrl.orders() correctly)
export const updateOrderStatus = async (
    id: number,
    status: string,
    token: string,
    trackingNumber?: string,
    notes?: string
): Promise<Order | null> => {
    try {
        const payload: any = { status };
        if (trackingNumber) payload.tracking_number = trackingNumber;
        if (notes) payload.notes = notes;

        const response = await axiosClient.put(apiUrl.orders(`${id}`), payload, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error updating order status:', error.response?.data || error.message);
        return null;
    }
};

// ADMIN: Get order statistics (FIXED: use apiUrl.orders() correctly)
export const getOrderStats = async (token: string): Promise<any | null> => {
    try {
        const response = await axiosClient.get(apiUrl.orders('admin/stats'), {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error: any) {
        console.error('Error fetching order stats:', error.response?.data || error.message);
        return null;
    }
};

export default {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    getOrderStats
};
