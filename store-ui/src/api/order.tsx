import axios from 'axios';

const API = 'http://localhost:8003/orders'; // You can move this to .env config later

export const getUserOrders = (token: string) =>
  axios.get(`${API}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getOrderById = (id: number, token: string) =>
  axios.get(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAllOrders = (token: string) =>
  axios.get(`${API}/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateOrderStatus = (
  id: number,
  status: string,
  token: string
) =>
  axios.put(
    `${API}/admin/${id}`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

// ✅ FIXED: remove userId from payload — it’s extracted from JWT
export const createOrder = async (
  payload: {
    items: {
      productId: string;
      title: string;
      sku: string;
      quantity: number;
      price: number;
      currency: string;
    }[];
    total: number;
    currency: string;
  },
  token: string
) => {
  try {
    const response = await axios.post(`${API}/`, payload, {
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
