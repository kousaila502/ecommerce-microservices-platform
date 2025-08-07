import axios from "axios"

const axiosClient = axios.create();

axiosClient.defaults.headers.common = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

// All request will wait 10 seconds before timeout (increased from 2 seconds)
axiosClient.defaults.timeout = 10000;

// API URLs for all microservices - UPDATED TO LIVE SYSTEM URLS
export const productsUrl = process.env.REACT_APP_PRODUCTS_URL_BASE || 'https://ecommerce-product-service-56575270905a.herokuapp.com/'
export const cartUrl = process.env.REACT_APP_CART_URL_BASE || 'https://ecommerce-cart-service-f2a908c60d8a.herokuapp.com/'
export const searchUrl = process.env.REACT_APP_SEARCH_URL_BASE || 'https://ecommerce-microservices-platform.onrender.com/'
export const usersUrl = process.env.REACT_APP_USERS_URL_BASE || 'http://34.118.167.199.nip.io/user/'
export const ordersUrl = process.env.REACT_APP_ORDERS_URL_BASE || 'http://34.118.167.199.nip.io/order/'
export const adminUrl = process.env.REACT_APP_ADMIN_URL_BASE || 'http://34.118.167.199.nip.io/admin/';

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