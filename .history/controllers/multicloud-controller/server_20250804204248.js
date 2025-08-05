 const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

const logger = require('./config/logger');
const settings = require('./config/settings');

// Import route handlers
const syncRoutes = require('./routes/sync');
const statusRoutes = require('./routes/status');

// Import platform clients
const RailwayClient = require('./platform-adapters/railway-client');
const RenderClient = require('./platform-adapters/render-client');
const VercelClient = require('./platform-adapters/vercel-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize platform clients
const platformClients = {
  railway: new RailwayClient(),
  render: new RenderClient(),
  vercel: new VercelClient()
};

// Make clients available to routes
app.locals.platformClients = platformClients;

// Routes
app.use('/api/sync', syncRoutes);
app.use('/api/status', statusRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'TechMart Multi-Cloud GitOps Controller',
    description: 'Orchestrates deployments across Railway, Render, and Vercel',
    version: '1.0.0',
    research: 'ESI-SBA Thesis - Multi-Cloud GitOps Implementation',
    endpoints: {
      health: '/health',
      sync: '/api/sync',
      status: '/api/status'
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Automated sync job - runs every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    logger.info('Starting scheduled multi-cloud sync...');
    
    // Sync all platforms
    const syncPromises = [
      platformClients.railway.syncServices(),
      platformClients.render.syncServices(),
      platformClients.vercel.syncDeployments()
    ];
    
    const results = await Promise.allSettled(syncPromises);
    
    results.forEach((result, index) => {
      const platforms = ['railway', 'render', 'vercel'];
      if (result.status === 'fulfilled') {
        logger.info(`${platforms[index]} sync completed successfully`);
      } else {
        logger.error(`${platforms[index]} sync failed:`, result.reason);
      }
    });
    
    logger.info('Scheduled multi-cloud sync completed');
  } catch (error) {
    logger.error('Scheduled sync error:', error);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Multi-Cloud Controller started on port ${PORT}`);
  logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔧 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;