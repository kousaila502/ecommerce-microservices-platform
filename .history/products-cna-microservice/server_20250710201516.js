// server.js - Updated to use Mongoose
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

app.use(cors());
app.use(express.json());
app.use(require('./routes/record'));

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
  
  // Start the Express server
  app.listen(PORT, async () => {
    console.log(`Server is running on port: ${PORT}`);
    
    // Load initial data
    await loadData();
    
    console.log('🚀 Product Service ready!');
    console.log(`📊 API endpoints available at http://localhost:${PORT}`);
    console.log('   GET /products - Get all products');
    console.log('   GET /products/:id - Get product by ID');
    console.log('   GET /products/sku/:sku - Get product by SKU');
    console.log('   POST /products - Create product');
    console.log('   PUT /products/:id - Update product');
    console.log('   DELETE /products/:id - Delete product');
  });
});