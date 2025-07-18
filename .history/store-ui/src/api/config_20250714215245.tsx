import axios from "axios"

const axiosClient = axios.create();

axiosClient.defaults.headers.common = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

// All request will wait 10 seconds before timeout (increased from 2 seconds)
axiosClient.defaults.timeout = 10000;

// API URLs for all microservices
export const productsUrl = process.env.REACT_APP_PRODUCTS_URL_BASE || 'http://localhost:8080/api/products/'
export const cartUrl = process.env.REACT_APP_CART_URL_BASE || 'http://localhost:8080/api/cart/'
export const searchUrl = process.env.REACT_APP_SEARCH_URL_BASE || 'http://localhost:8080/api/search/'
export const usersUrl = process.env.REACT_APP_USERS_URL_BASE || 'http://localhost:8080/apiu'
export const ordersUrl = process.env.REACT_APP_ORDERS_URL_BASE || 'http://localhost:8080/api/orders/'

export default axiosClient