const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'TechMart Multi-Cloud Controller',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'TechMart Multi-Cloud GitOps Controller API',
    version: '1.0.0',
    description: 'Multi-Cloud orchestration and monitoring for e-commerce microservices platform',
    endpoints: {
      health: 'GET /health',
      status: {
        all: 'GET /api/status/all',
        vercel: 'GET /api/status/vercel',
        heroku: 'GET /api/status/heroku', 
        render: 'GET /api/status/render',
        gke: 'GET /api/status/gke',
        grafana: 'GET /api/status/grafana'
      },
      sync: {
        all: 'POST /api/sync/all',
        deploy: 'POST /api/deploy/:platform'
      },
      metrics: 'GET /api/metrics'
    },
    platforms: ['Vercel', 'Heroku', 'Render', 'GKE/ArgoCD', 'Grafana Cloud'],
    author: 'ESI-SBA Thesis Research'
  });
});

// Multi-Cloud Status Endpoint
app.get('/api/status/all', async (req, res) => {
  const startTime = Date.now();
  
  try {
    logger.info('Starting multi-cloud status check');
    
    const platformStatus = {
      timestamp: new Date().toISOString(),
      platforms: {
        frontend: await checkVercelStatus(),
        gateway: await checkGKEStatus(), 
        heroku_services: await checkHerokuStatus(),
        render_service: await checkRenderStatus(),
        monitoring: await checkGrafanaStatus()
      },
      summary: {
        total_platforms: 5,
        healthy_platforms: 0,
        unhealthy_platforms: 0,
        response_time_ms: 0
      }
    };

    // Calculate summary
    Object.values(platformStatus.platforms).forEach(platform => {
      if (platform.status === 'healthy') {
        platformStatus.summary.healthy_platforms++;
      } else {
        platformStatus.summary.unhealthy_platforms++;
      }
    });

    platformStatus.summary.response_time_ms = Date.now() - startTime;
    
    logger.info(`Status check completed in ${platformStatus.summary.response_time_ms}ms`);
    res.json(platformStatus);
  } catch (error) {
    logger.error('Multi-cloud status check failed:', error);
    res.status(500).json({ 
      error: 'Failed to get platform status', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Individual platform status endpoints
app.get('/api/status/vercel', async (req, res) => {
  try {
    const status = await checkVercelStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Vercel status check failed', message: error.message });
  }
});

app.get('/api/status/heroku', async (req, res) => {
  try {
    const status = await checkHerokuStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Heroku status check failed', message: error.message });
  }
});

app.get('/api/status/render', async (req, res) => {
  try {
    const status = await checkRenderStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Render status check failed', message: error.message });
  }
});

app.get('/api/status/gke', async (req, res) => {
  try {
    const status = await checkGKEStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'GKE status check failed', message: error.message });
  }
});

app.get('/api/status/grafana', async (req, res) => {
  try {
    const status = await checkGrafanaStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Grafana status check failed', message: error.message });
  }
});

// Platform sync/orchestration endpoints
app.post('/api/sync/all', async (req, res) => {
  try {
    const syncResults = {
      timestamp: new Date().toISOString(),
      sync_results: {
        heroku: await syncHerokuDeployments(),
        render: await syncRenderDeployment(),
        vercel: await syncVercelDeployment(),
        argocd: await syncArgoCDApps()
      }
    };

    res.json(syncResults);
  } catch (error) {
    res.status(500).json({ 
      error: 'Sync operation failed', 
      message: error.message 
    });
  }
});

// Deployment trigger endpoint
app.post('/api/deploy/:platform', async (req, res) => {
  const { platform } = req.params;
  const { service } = req.body;

  try {
    let result;
    switch (platform.toLowerCase()) {
      case 'heroku':
        result = await triggerHerokuDeploy(service);
        break;
      case 'render':
        result = await triggerRenderDeploy(service);
        break;
      case 'vercel':
        result = await triggerVercelDeploy();
        break;
      case 'argocd':
        result = await triggerArgoCDSync(service);
        break;
      default:
        return res.status(400).json({ error: 'Unknown platform', platform });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: `Deploy failed for ${platform}`, 
      message: error.message 
    });
  }
});

// Metrics collection endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      controller_metrics: {
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
        platform_checks: {
          total_checks: 0,
          successful_checks: 0,
          failed_checks: 0
        }
      },
      platform_metrics: await collectPlatformMetrics()
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to collect metrics', 
      message: error.message 
    });
  }
});

// Platform status check functions
async function checkVercelStatus() {
  const startTime = Date.now();
  try {
    const response = await axios.get('https://ecommerce-microservices-platform.vercel.app/health', {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'User-Agent': 'TechMart-Controller/1.0.0'
      }
    });
    
    return {
      platform: 'Vercel',
      service: 'Frontend (TechMart UI)',
      status: 'healthy',
      response_time_ms: Date.now() - startTime,
      url: 'https://ecommerce-microservices-platform.vercel.app',
      details: 'Frontend application responding',
      last_deployment: response.data.deployment || 'unknown'
    };
  } catch (error) {
    logger.error('Vercel status check failed:', error.message);
    return {
      platform: 'Vercel',
      service: 'Frontend (TechMart UI)',
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      error: error.message,
      url: 'https://ecommerce-microservices-platform.vercel.app'
    };
  }
}

async function checkHerokuStatus() {
  const startTime = Date.now();
  try {
    // Update with your actual Heroku app names
    const apps = [
      process.env.HEROKU_PRODUCT_APP || 'techmart-products-service',
      process.env.HEROKU_CART_APP || 'techmart-cart-service'
    ];
    const results = [];

    for (const appName of apps) {
      try {
        const response = await axios.get(`https://api.heroku.com/apps/${appName}`, {
          headers: {
            'Authorization': `Bearer ${process.env.HEROKU_TOKEN}`,
            'Accept': 'application/vnd.heroku+json; version=3'
          },
          timeout: 10000
        });

        // Check app health
        const healthCheck = await axios.get(`https://${appName}.herokuapp.com/health`, {
          timeout: 5000
        }).catch(() => null);

        results.push({
          app_name: appName,
          status: healthCheck ? 'healthy' : 'unhealthy',
          state: response.data.released_at ? 'running' : 'unknown',
          updated_at: response.data.updated_at,
          web_url: `https://${appName}.herokuapp.com`
        });
      } catch (error) {
        logger.error(`Heroku app ${appName} check failed:`, error.message);
        results.push({
          app_name: appName,
          status: 'unhealthy',
          error: error.message
        });
      }
    }

    return {
      platform: 'Heroku',
      services: results,
      status: results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy',
      response_time_ms: Date.now() - startTime,
      total_apps: results.length
    };
  } catch (error) {
    logger.error('Heroku status check failed:', error.message);
    return {
      platform: 'Heroku',
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      error: error.message
    };
  }
}

async function checkRenderStatus() {
  const startTime = Date.now();
  try {
    const serviceId = process.env.RENDER_SERVICE_ID || 'srv-your-service-id';
    
    const response = await axios.get(`https://api.render.com/v1/services/${serviceId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.RENDER_TOKEN}`
      },
      timeout: 10000
    });

    // Additional health check to the actual service
    let healthStatus = 'unknown';
    if (response.data.service.serviceDetails?.url) {
      try {
        await axios.get(`${response.data.service.serviceDetails.url}/health`, { timeout: 5000 });
        healthStatus = 'healthy';
      } catch {
        healthStatus = 'service_unhealthy';
      }
    }

    return {
      platform: 'Render',
      service: 'Search Service (Elasticsearch)',
      status: response.data.service.state === 'active' && healthStatus === 'healthy' ? 'healthy' : 'unhealthy',
      state: response.data.service.state,
      health_check: healthStatus,
      response_time_ms: Date.now() - startTime,
      url: response.data.service.serviceDetails?.url || 'unknown',
      last_deploy: response.data.service.updatedAt
    };
  } catch (error) {
    logger.error('Render status check failed:', error.message);
    return {
      platform: 'Render',
      service: 'Search Service (Elasticsearch)',
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      error: error.message
    };
  }
}

async function checkGKEStatus() {
  const startTime = Date.now();
  try {
    const gatewayUrl = process.env.GKE_GATEWAY_URL || 'http://34.118.167.199.nip.io';
    
    // Check gateway health
    const response = await axios.get(`${gatewayUrl}/health`, {
      timeout: 10000
    });

    // Try to check individual services
    const services = ['user', 'order'];
    const serviceHealth = [];

    for (const service of services) {
      try {
        const serviceResponse = await axios.get(`${gatewayUrl}/${service}/health`, {
          timeout: 5000
        });
        serviceHealth.push({
          name: `${service}-service`,
          status: 'healthy',
          response: serviceResponse.status
        });
      } catch (error) {
        serviceHealth.push({
          name: `${service}-service`,
          status: 'unhealthy',
          error: error.message
        });
      }
    }

    return {
      platform: 'GKE (Google Kubernetes Engine)',
      services: serviceHealth,
      status: serviceHealth.every(s => s.status === 'healthy') ? 'healthy' : 'partial',
      gateway_url: gatewayUrl,
      response_time_ms: Date.now() - startTime,
      argocd_status: 'synced', // This would require ArgoCD API integration
      namespace: 'techmart-services'
    };
  } catch (error) {
    logger.error('GKE status check failed:', error.message);
    return {
      platform: 'GKE (Google Kubernetes Engine)',
      services: ['User Service', 'Order Service'],
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      error: error.message
    };
  }
}

async function checkGrafanaStatus() {
  const startTime = Date.now();
  try {
    const grafanaUrl = process.env.GRAFANA_URL || 'https://your-instance.grafana.net';
    
    const response = await axios.get(`${grafanaUrl}/api/health`, {
      headers: {
        'Authorization': `Bearer ${process.env.GRAFANA_TOKEN}`
      },
      timeout: 10000
    });

    return {
      platform: 'Grafana Cloud',
      service: 'Monitoring & Observability',
      status: 'healthy',
      response_time_ms: Date.now() - startTime,
      database: response.data.database || 'ok',
      version: response.data.version || 'unknown',
      url: grafanaUrl
    };
  } catch (error) {
    logger.error('Grafana status check failed:', error.message);
    return {
      platform: 'Grafana Cloud',
      service: 'Monitoring & Observability',
      status: 'unhealthy',
      response_time_ms: Date.now() - startTime,
      error: error.message
    };
  }
}

// Sync functions (simplified for thesis demo)
async function syncHerokuDeployments() {
  return { platform: 'Heroku', status: 'synced', message: 'Heroku apps synchronized' };
}

async function syncRenderDeployment() {
  return { platform: 'Render', status: 'synced', message: 'Render service synchronized' };
}

async function syncVercelDeployment() {
  return { platform: 'Vercel', status: 'synced', message: 'Vercel deployment synchronized' };
}

async function syncArgoCDApps() {
  return { platform: 'ArgoCD', status: 'synced', message: 'ArgoCD applications synchronized' };
}

// Deployment trigger functions
async function triggerHerokuDeploy(service) {
  return { platform: 'Heroku', service, status: 'triggered', message: 'Deployment initiated' };
}

async function triggerRenderDeploy(service) {
  return { platform: 'Render', service, status: 'triggered', message: 'Deployment initiated' };
}

async function triggerVercelDeploy() {
  return { platform: 'Vercel', status: 'triggered', message: 'Frontend deployment initiated' };
}

async function triggerArgoCDSync(service) {
  return { platform: 'ArgoCD', service, status: 'triggered', message: 'Application sync initiated' };
}

async function collectPlatformMetrics() {
  return {
    total_services: 5,
    active_deployments: 3,
    avg_response_time_ms: 120,
    total_requests_today: 1247,
    error_rate_percentage: 2.3,
    uptime_percentage: 99.7,
    last_deployment: new Date().toISOString()
  };
}

// Scheduled health checks (runs every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
  logger.info('Running scheduled health checks');
  try {
    const status = await Promise.all([
      checkVercelStatus(),
      checkHerokuStatus(), 
      checkRenderStatus(),
      checkGKEStatus(),
      checkGrafanaStatus()
    ]);
    
    const healthyCount = status.filter(s => s.status === 'healthy').length;
    logger.info(`Health check completed: ${healthyCount}/${status.length} platforms healthy`);
  } catch (error) {
    logger.error('Scheduled health check failed:', error);
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully'); 
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`TechMart Multi-Cloud Controller running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info(`API Documentation: http://localhost:${PORT}/api`);
  logger.info(`Status API: http://localhost:${PORT}/api/status/all`);
});

module.exports = app;