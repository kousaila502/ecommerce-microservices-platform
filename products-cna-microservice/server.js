require('dotenv').config({ path: './.env' });

const deals = require('./data/deals');
const products = require('./data/products');
const express = require('express');
const cors = require('cors');

// Get MongoDB/Mongoose connection
const dbo = require('./db/conn');
const ProductService = require('./services/productService');

const PORT = process.env.PORT || 3001;
const app = express();

/* ✅ Step 1: Configure secure CORS */
const allowedOrigins = [
  'https://ecommerce-microservices-platform.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(require('./routes/record'));

/* ✅ Step 2: Add /health check route */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'product-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Global error handling
app.use(function (err, _req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Database connection and server start
dbo.connectToServer(function (err) {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }

  console.log('Successfully connected to MongoDB');

  app.listen(PORT, async () => {
    console.log(`Server is running on port: ${PORT}`);

    console.log('🚀 Product Service ready!');
    console.log(`📊 Your API endpoints available at https://ecommerce-product-service-56575270905a.herokuapp.com or http://localhost:${PORT}`);
    console.log('   GET /products - Get all products');
    console.log('   GET /products/:id - Get product by ID');
    console.log('   GET /products/sku/:sku - Get product by SKU');
    console.log('   POST /products - Create product');
    console.log('   PUT /products/:id - Update product');
    console.log('   DELETE /products/:id - Delete product');
    console.log('   GET /health - Health check'); // ✅ Added info
  });
});
