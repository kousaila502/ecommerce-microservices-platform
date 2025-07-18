import axios from "axios"

const axiosClient = axios.create();

axiosClient.defaults.headers.common = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}

// All request will wait 10 seconds before timeout (increased from 2 seconds)
axiosClient.defaults.timeout = 10000;

// API URLs for all microservices
export const productsUrl = process.env.REACT_APP_PRODUCTS_URL_BASE || 'http://localhost:3001/'
export const cartUrl = process.env.REACT_APP_CART_URL_BASE || 'http://localhost:8080/'
export const searchUrl = process.env.REACT_APP_SEARCH_URL_BASE || 'http://localhost:4000/'
export const usersUrl = process.env.REACT_APP_USERS_URL_BASE || 'http://localhost:9090/'


export default axiosClient