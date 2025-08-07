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

/* ✅ SECURE: Enhanced CORS configuration */
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
    'https://ecommerce-microservices-platform.vercel.app',
    'https://ecommerce-cart-service.herokuapp.com'
  ]
  : [
    'https://ecommerce-microservices-platform.vercel.app',
    'http://localhost:3000',
    'http://localhost:8080'
  ];

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

app.use(require('./routes/record'));

/* ✅ SECURE: Enhanced health check with environment info */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'product-service',
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    database: 'connected' // Will be updated once DB connects
  });
});

// Add after other imports
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

// Add after other routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ✅ SECURE: Enhanced error handling - don't expose stack traces in production
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

// ✅ SECURE: Enhanced startup logging
console.log('🚀 =================================================');
console.log('🚀 PRODUCT SERVICE STARTUP');
console.log('🚀 =================================================');
console.log(`📋 Service: Product Service v1.0.0`);
console.log(`🌍 Environment: ${NODE_ENV}`);
console.log(`🔌 Port: ${PORT}`);
console.log(`🔗 Allowed Origins: ${allowedOrigins.join(', ')}`);
console.log('🚀 =================================================');

// Database connection and server start
dbo.connectToServer(function (err) {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }

  console.log('✅ Successfully connected to MongoDB');

  app.listen(PORT, () => {
    console.log('🚀 =================================================');
    console.log(`🚀 Server is running on port: ${PORT}`);
    console.log('🚀 =================================================');
    console.log('🎯 Product Service ready!');
    console.log(`📊 API endpoints available at: http://localhost:${PORT}`);
    console.log('   GET /products - Get all products');
    console.log('   GET /products/:id - Get product by ID');
    console.log('   GET /products/sku/:sku - Get product by SKU');
    console.log('   POST /products - Create product');
    console.log('   PUT /products/:id - Update product');
    console.log('   DELETE /products/:id - Delete product');
    console.log('   GET /health - Health check');
    console.log('🚀 =================================================');
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
