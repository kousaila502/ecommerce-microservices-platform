import axios from 'axios';

const API = 'http://localhost:8003/orders'; // Adjust if using .env config

export const getUserOrders = (token: string) =>
  axios.get(`${API}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getOrderById = (id: string, token: string) =>
  axios.get(`${API}/user/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getAllOrders = (token: string) =>
  axios.get(`${API}/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateOrderStatus = (
  id: string,
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


