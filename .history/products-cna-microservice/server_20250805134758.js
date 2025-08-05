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

// Load initial data function (updated for Mongoose)
/*const loadData = async () => {
  try {
    console.log('Loading initial data...');
    
    // Handle deals (keep existing method if deals aren't converted to Mongoose)
    const dbConnect = dbo.getDb();
    
    // Clear and load deals
      await new Promise((resolve, reject) => {
      dbConnect.collection('deals', function (err, collection) {
        if (err) return reject(err);
        
        collection.deleteMany({}, function (err, result) {
          if (err) return reject(err);
          console.log("Deals collection cleared:", result);
          resolve();
        });
      });
    });
    
    await new Promise((resolve, reject) => {
      dbConnect
        .collection('deals')
        .insertMany(deals.deals, (err, result) => {
          if (err) return reject(err);
          console.log('Deals loaded:', result.insertedCount);
          resolve();
        });
    });
    
    // Load products using Mongoose
    await ProductService.loadInitialData(products.products);
    console.log('All data loaded successfully!');
    
  } catch (error) {
    console.error('Error loading data:', error);
  }
};*/


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
    //await loadData();
    
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