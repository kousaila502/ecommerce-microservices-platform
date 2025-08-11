import axiosClient, { apiUrl, rawOrdersUrl, rawOrdersAdminUrl  } from "./config"

// ✅ ADDED: Enums to match backend exactly
export enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed", 
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}

export enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed", 
    REFUNDED = "refunded"
}

// UPDATED: Order interfaces to match backend model
export interface ShippingAddress {
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

// ✅ FIXED: OrderItem interface matches backend model exactly
export interface OrderItem {
    id: number;
    order_id?: number; // Foreign key (may not always be included in responses)
    
    // Product details (all required in backend)
    product_id: number;
    product_name: string;
    product_sku?: string; // Optional in backend
    product_image?: string; // Optional in backend
    
    // Pricing details (required in backend, API returns as strings)
    unit_price: string | number;
    quantity: number;
    total_price: string | number;
    
    // Product attributes (optional in backend)
    product_attributes?: string;
    
    // Timestamps (required in backend)
    created_at?: string; // May not always be included in responses
    updated_at?: string; // May not always be included in responses
}

// ✅ FIXED: Interface now matches backend model exactly
export interface Order {
    id: number;
    user_id: number;
    
    // Order details (all required in backend)
    order_number: string;
    status: string; // Enum: pending, confirmed, processing, shipped, delivered, cancelled, refunded
    payment_status: string; // Enum: pending, paid, failed, refunded
    
    // Financial details (all required in backend, API returns as strings)
    subtotal: string | number;
    tax_amount: string | number;
    shipping_amount: string | number;
    discount_amount: string | number;
    total_amount: string | number;
    
    // Shipping details (all required in backend)
    shipping_address: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;
    
    // Billing details (optional in backend)
    billing_address?: string;
    billing_city?: string;
    billing_state?: string;
    billing_postal_code?: string;
    billing_country?: string;
    
    // Contact details
    customer_email: string; // Required in backend
    customer_phone?: string; // Optional in backend
    
    // Order tracking (optional in backend)
    notes?: string;
    tracking_number?: string;
    
    // Timestamps (required in backend)
    created_at: string;
    updated_at: string;
    
    // Optional timestamps (set when status changes)
    confirmed_at?: string;
    shipped_at?: string;
    delivered_at?: string;
    cancelled_at?: string;
    
    // Relationships (always present)
    order_items: OrderItem[];
}

export interface CreateOrderPayload {
    shipping_address: ShippingAddress;
    billing_address?: ShippingAddress;
    customer_email: string;
    customer_phone?: string;
    notes?: string;
}

// ✅ UPDATED: Create order
export const createOrder = async (
    payload: CreateOrderPayload,
    token: string
): Promise<Order | null> => {
    try {
        const response = await axiosClient.post(`${rawOrdersUrl}/`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('Create order response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error creating order:', error.response?.data || error.message);
        return null;
    }
};

// ✅ FIXED: Get user's orders with proper URL construction
export const getUserOrders = async (token: string, page: number = 1, size: number = 10): Promise<Order[] | null> => {
    try {
        // ✅ FIXED: Add 'orders/' with trailing slash for query params
        const response = await axiosClient.get(`${rawOrdersUrl}/?page=${page}&size=${size}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log('Orders API Response:', response.data);

        if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.warn('Expected array, got:', response.data);
            return [];
        }
    } catch (error: any) {
        console.error('Error fetching user orders:', error.response?.data || error.message);
        return [];
    }
};

// ✅ FIXED: Get order by ID
export const getOrderById = async (id: number, token: string): Promise<Order | null> => {
    try {
        // ✅ FIXED: Use the working endpoint pattern (without trailing slash works)
        const response = await axiosClient.get(`${rawOrdersUrl}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Order by ID response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching order:', error.response?.data || error.message);
        return null;
    }
};

// ✅ ADMIN: Get all orders
export const getAllOrders = async (token: string, page: number = 1, size: number = 20): Promise<Order[] | null> => {
    try {
        const response = await axiosClient.get(`${rawOrdersAdminUrl}/?page=${page}&size=${size}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('All orders response:', response.data);
        
        if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.warn('Unexpected admin orders response:', response.data);
            return [];
        }
    } catch (error: any) {
        console.error('Error fetching all orders:', error.response?.data || error.message);
        return [];
    }
};

// ✅ ADMIN: Update order status
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

        const response = await axiosClient.put(`${rawOrdersAdminUrl}/${id}/`, payload, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Update order status response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error updating order status:', error.response?.data || error.message);
        return null;
    }
};

// ✅ ADMIN: Get order statistics
export const getOrderStats = async (token: string): Promise<any | null> => {
    try {
        const response = await axiosClient.get(`${rawOrdersAdminUrl}/stats`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Order stats response:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching order stats:', error.response?.data || error.message);
        return null;
    }
};

// ✅ Helper functions for working with orders
export const formatOrderAmount = (amount: string | number): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
};

export const getOrderStatusLabel = (status: string): string => {
    switch (status?.toLowerCase()) {
        case 'pending': return 'Pending';
        case 'confirmed': return 'Confirmed';
        case 'processing': return 'Processing';
        case 'shipped': return 'Shipped';
        case 'delivered': return 'Delivered';
        case 'cancelled': return 'Cancelled';
        case 'refunded': return 'Refunded';
        default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
};

export const getPaymentStatusLabel = (status: string): string => {
    switch (status?.toLowerCase()) {
        case 'pending': return 'Pending';
        case 'paid': return 'Paid';
        case 'failed': return 'Failed';
        case 'refunded': return 'Refunded';
        default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
};

export const parseAmount = (amount: string | number | undefined): number => {
    if (!amount) return 0;
    const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(parsed) ? 0 : parsed;
};

export default {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    getOrderStats,
    formatOrderAmount,
    getOrderStatusLabel,
    getPaymentStatusLabel,
    parseAmount
};