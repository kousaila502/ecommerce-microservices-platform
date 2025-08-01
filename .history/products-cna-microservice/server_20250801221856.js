// server.js - Updated to use Mongoose


const express = require('express');
const cors = require('cors');

// Import your data
const { products } = require('./data/products');
const deals = require('./data/deals');

// Import Product model (you need this line!)
const Product = require('./models/Product'); // Add this import

// Get MongoDB/Mongoose connection
const dbo = require('./db/conn');
const ProductService = require('./services/productService');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://ecommerce-microservices-platform.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(require('./routes/record'));

app.post('/seed', async (req, res) => {
  try {
    console.log('Starting seed process...');
    console.log(`Found ${products.length} products to insert`);
    
    // Clear existing products (optional)
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert all products from your products.js file
    const result = await Product.insertMany(products);
    
    res.json({
      message: "Products seeded successfully!",
      count: result.length,
      products: result.slice(0, 3) // Show first 3 products only
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ 
      error: "Failed to seed products",
      details: error.message 
    });
  }
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