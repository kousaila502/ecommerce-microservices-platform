require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');

// ✅ SECURE: Validate required environment variables at startup
function validateEnvironment() {
  const required = ['MONGO_URI'];
  const missing = required.filter(env => !process.env[env]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('💡 Please set the following environment variables:');
    missing.forEach(env => console.error(`   - ${env}`));
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
}

// ✅ SECURE: Validate environment before loading other modules
validateEnvironment();

const deals = require('./data/deals');
const products = require('./data/products');

// Get MongoDB/Mongoose connection
const dbo = require('./db/conn');
const ProductService = require('./services/productService');

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const app = express();

/* ✅ SECURE: Dynamic CORS configuration from environment */
const defaultOrigins = process.env.NODE_ENV === 'production'
  ? [
    'https://ecommerce-app-omega-two-64.vercel.app',
    'https://ecommerce-cart-service-f2a908c60d8a.herokuapp.com',
    'https://34.95.5.30.nip.io',
    'http://34.95.5.30.nip.io',
    'https://ecommerce-product-service-56575270905a.herokuapp.com' // Added Heroku prod URL
  ]
  : [
    'https://ecommerce-app-omega-two-64.vercel.app',
    'https://34.95.5.30.nip.io',
    'http://34.95.5.30.nip.io',
    'http://localhost:3000',
    'http://localhost:8080'
  ];

// Use environment variable or defaults
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : defaultOrigins;

console.log('🌐 CORS Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false // ✅ SECURE: Disable credentials for security
}));

// ✅ SECURE: Enhanced JSON parsing with size limits
app.use(express.json({
  limit: '10mb',
  strict: true
}));

// Request logging (development only)
if (NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Async error wrapper for routes
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ================================
// PRODUCT ROUTES & DEALS ROUTES
// ================================
app.use(require('./routes/record'));
app.use(require('./routes/deals'));
// add status endpoint
app.use(require('./routes/status'));

// GET /categories endpoint
app.get('/categories', asyncHandler(async (req, res) => {
  const categories = await ProductService.getDistinctCategories();
  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
}));

app.get('/health', asyncHandler(async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    // Try a simple MongoDB ping
    const mongoose = require('mongoose');
    dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  } catch (err) {
    dbStatus = 'error';
  }

  res.status(200).json({
    status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    service: 'product-service',
    version: '1.1.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      provider: 'MongoDB Atlas'
    },
    platform: 'Heroku',
    features: [
      'Products',
      'Deals',
      'Search',
      'Analytics'
    ]
  });
}));

/* Enhanced health check with actual DB status and service info */
app.get('/health', asyncHandler(async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    // Try a simple MongoDB ping
    const mongoose = require('mongoose');
    dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  } catch (err) {
    dbStatus = 'error';
  }

  res.status(200).json({
    status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    service: 'product-service',
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      provider: 'MongoDB Atlas'
    },
    platform: 'Heroku',
    features: [
      'Products',
      'Deals',
      'Search',
      'Analytics'
    ]
  });
}));

// Add after other imports
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

// Add after other routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling for async routes and unhandled promise rejections
app.use(function (err, _req, res, next) {
  console.error('Server Error:', err.message);

  if (NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  } else {
    console.error(err.stack);
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  }
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// Improved startup logging
function logEndpoints() {
  console.log('🚀 =================================================');
  console.log('🚀 PRODUCT SERVICE STARTUP');
  console.log('🚀 =================================================');
  console.log(`📋 Service: Product Service v1.0.0`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔌 Port: ${PORT}`);
  console.log(`🔗 Allowed Origins: ${allowedOrigins.join(', ')}`);
  console.log('🚀 =================================================');
  console.log('🎯 Product Endpoints:');
  console.log('   GET    /products');
  console.log('   GET    /products/stats');
  console.log('   GET    /products/search/:term');
  console.log('   GET    /products/department/:department');
  console.log('   GET    /products/category/:category');
  console.log('   GET    /products/brand/:brand');
  console.log('   GET    /products/price/:minPrice/:maxPrice');
  console.log('   GET    /products/sku/:sku');
  console.log('   GET    /products/inventory/low-stock');
  console.log('   GET    /products/:id');
  console.log('   POST   /products');
  console.log('   PUT    /products/:id');
  console.log('   DELETE /products/:id');
  console.log('   PATCH  /products/:id/stock');
  console.log('   PATCH  /products/:id/restore');
  console.log('   DELETE /products/:id/hard-delete');
  console.log('   GET    /categories');
  console.log('🎯 Deals Endpoints:');
  console.log('   GET    /deals');
  console.log('   POST   /deals');
  console.log('   POST   /deals/seed');
  console.log('   GET    /deals/stats');
  console.log('   GET    /deals/search/:term');
  console.log('   GET    /deals/department/:department');
  console.log('   GET    /deals/product/:productId');
  console.log('   GET    /deals/price/:minPrice/:maxPrice');
  console.log('   GET    /deals/top-rated');
  console.log('   GET    /deals/recent');
  console.log('   GET    /deals/:id');
  console.log('   PUT    /deals/:id');
  console.log('   DELETE /deals/:id');
  console.log('   PATCH  /deals/:id/restore');
  console.log('   DELETE /deals/:id/hard-delete');
  console.log('🎯 Health & Docs Endpoints:');
  console.log('   GET    /health');
  console.log('   GET    /api-docs');
  console.log('🚀 =================================================');
}

// Database connection and server start
dbo.connectToServer(function (err) {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Successfully connected to MongoDB');

  app.listen(PORT, () => {
    logEndpoints();
    console.log(`🚀 Server is running on port: ${PORT}`);
    console.log('🚀 =================================================');
    console.log('🎯 Product Service ready!');
  });
});

// ✅ SECURE: Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received, shutting down gracefully');
  dbo.closeConnection();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received, shutting down gracefully');
  dbo.closeConnection();
  process.exit(0);
});
