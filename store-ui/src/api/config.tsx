import axios from "axios"

const axiosClient = axios.create();

axiosClient.defaults.headers.common = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

// All request will wait 10 seconds before timeout (increased from 2 seconds)
axiosClient.defaults.timeout = 10000;

// 🧹 Clean URL Builder Function
const buildUrl = (baseUrl: string, path: string): string => {
  const cleanBase = baseUrl.replace(/\/+$/, ''); // Remove trailing slashes
  const cleanPath = path.replace(/^\/+/, '');    // Remove leading slashes
  return `${cleanBase}/${cleanPath}`;
};

// API URLs for all microservices - SECURE HTTPS ENDPOINTS
const rawProductsUrl = process.env.REACT_APP_PRODUCTS_URL_BASE || 'https://ecommerce-product-service-56575270905a.herokuapp.com';
const rawCartUrl = process.env.REACT_APP_CART_URL_BASE || 'https://ecommerce-cart-service-f2a908c60d8a.herokuapp.com';
const rawSearchUrl = process.env.REACT_APP_SEARCH_URL_BASE || 'https://ecommerce-microservices-platform.onrender.com';
const rawUsersUrl = process.env.REACT_APP_USERS_URL_BASE || 'https://34.95.5.30.nip.io/user';
const rawOrdersUrl = process.env.REACT_APP_ORDERS_URL_BASE || 'https://34.95.5.30.nip.io/order';
const rawAdminUrl = process.env.REACT_APP_ADMIN_URL_BASE || 'https://34.95.5.30.nip.io/admin';

// 🚀 Exported Clean URLs (no trailing slashes)
export const productsUrl = rawProductsUrl.replace(/\/+$/, '');
export const cartUrl = rawCartUrl.replace(/\/+$/, '');
export const searchUrl = rawSearchUrl.replace(/\/+$/, '');
export const usersUrl = rawUsersUrl.replace(/\/+$/, '');
export const ordersUrl = rawOrdersUrl.replace(/\/+$/, '');
export const adminUrl = rawAdminUrl.replace(/\/+$/, '');

// 🛠️ URL Builder Helper (Export this for consistent usage)
export const apiUrl = {
  users: (path: string) => buildUrl(usersUrl, path),
  admin: (path: string) => buildUrl(adminUrl, path),
  orders: (path: string) => buildUrl(ordersUrl, path),
  cart: (path: string) => buildUrl(cartUrl, path),
  products: (path: string) => buildUrl(productsUrl, path),
  search: (path: string) => buildUrl(searchUrl, path),
};

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