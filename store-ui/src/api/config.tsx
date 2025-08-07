import axios from "axios"

const axiosClient = axios.create();

axiosClient.defaults.headers.common = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

// All request will wait 10 seconds before timeout (increased from 2 seconds)
axiosClient.defaults.timeout = 10000;

// API URLs for all microservices
export const productsUrl = process.env.REACT_APP_PRODUCTS_URL_BASE || 'http://localhost:8080/api/products'
export const cartUrl = process.env.REACT_APP_CART_URL_BASE || 'http://localhost:8080/api/cart'
export const searchUrl = process.env.REACT_APP_SEARCH_URL_BASE || 'http://localhost:8080/api/search'
export const usersUrl = process.env.REACT_APP_USERS_URL_BASE || 'http://localhost:8080/api/users'
export const ordersUrl = process.env.REACT_APP_ORDERS_URL_BASE || 'http://localhost:8080/api/orders'
export const adminUrl = process.env.REACT_APP_ADMIN_URL_BASE || 'http://localhost:8080/api/admin';

// Add logging right after the export statements
console.log('🔍 Environment Variables Check:');
console.log('REACT_APP_USERS_URL_BASE:', process.env.REACT_APP_USERS_URL_BASE);
console.log('REACT_APP_PRODUCTS_URL_BASE:', process.env.REACT_APP_PRODUCTS_URL_BASE);
console.log('REACT_APP_CART_URL_BASE:', process.env.REACT_APP_CART_URL_BASE);

console.log('🚀 Final URLs being used:');
console.log('usersUrl:', usersUrl);
console.log('productsUrl:', productsUrl);
console.log('cartUrl:', cartUrl);
console.log('searchUrl:', searchUrl);
console.log('ordersUrl:', ordersUrl);
console.log('adminUrl:', adminUrl);


export default axiosClient