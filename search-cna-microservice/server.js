var express = require('express');
var request = require('request');
var cors = require('cors');
require('dotenv').config();

var app = express();

// 🌐 CORS Configuration - Live System Integration
const corsOptions = {
	origin: function (origin, callback) {
		// ✅ SECURE: Environment-specific allowed origins
		const allowedOrigins = getAllowedOrigins();

		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);

		if (allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			console.log(`❌ CORS: Blocked origin ${origin}`);
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: false, // ✅ SECURE: Disable credentials
	methods: ['GET', 'POST', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
	maxAge: 3600 // Cache preflight for 1 hour
};

// Apply CORS middleware
app.use(cors(corsOptions));

// JSON parsing middleware
app.use(express.json());

var port = Number(process.env.PORT || 4000);
var apiServerHost = (process.env.ELASTIC_URL || 'http://127.0.0.1:9200');
var environment = process.env.NODE_ENV || 'development';

// ✅ SECURE: Environment-specific allowed origins
function getAllowedOrigins() {
	if (environment === 'production') {
		return [
			"https://ecommerce-microservices-platform.vercel.app",        // Frontend
			"https://ecommerce-cart-service-f2a908c60d8a.herokuapp.com", // Cart Service
			"https://ecommerce-product-service-56575270905a.herokuapp.com", // Product Service
			"http://34.118.167.199.nip.io"                               // User Service (GKE)
		];
	} else {
		return [
			"https://ecommerce-microservices-platform.vercel.app",        // Frontend (Live)
			"https://ecommerce-cart-service-f2a908c60d8a.herokuapp.com", // Cart Service (Live)
			"https://ecommerce-product-service-56575270905a.herokuapp.com", // Product Service (Live)
			"http://34.118.167.199.nip.io",                               // User Service (Live)
			"http://localhost:3000",                                      // Frontend (Dev)
			"http://localhost:8080",                                      // Cart Service (Dev)
			"http://localhost:3001",                                      // Product Service (Dev)
			"http://localhost:9090"                                       // User Service (Dev)
		];
	}
}

// 🔍 Health Check Endpoints
app.get('/health', (req, res) => {
	res.json({
		status: 'healthy',
		service: 'search-service',
		version: '1.1.0-ENHANCED',
		timestamp: new Date().toISOString(),
		environment: environment,
		elasticsearch: {
			url: apiServerHost,
			status: 'connected' // We'll enhance this with actual connectivity check
		}
	});
});

// 🔍 Enhanced Health Check with Connectivity Testing
app.get('/health/connectivity', async (req, res) => {
	console.log('🔍 Starting connectivity health check...');

	const healthResults = {
		status: 'healthy',
		service: 'search-service',
		version: '1.1.0-ENHANCED',
		timestamp: new Date().toISOString(),
		environment: environment,
		connectivity: {}
	};

	// Test Elasticsearch connection
	console.log('🔍 Testing Elasticsearch connection...');
	const elasticsearchResult = await testElasticsearchConnection();
	healthResults.connectivity.elasticsearch = elasticsearchResult;

	// Test Product Service connection
	console.log('🔍 Testing Product Service connection...');
	const productServiceResult = await testProductServiceConnection();
	healthResults.connectivity.product_service = productServiceResult;

	// Test Cart Service connection  
	console.log('🔍 Testing Cart Service connection...');
	const cartServiceResult = await testCartServiceConnection();
	healthResults.connectivity.cart_service = cartServiceResult;

	// Test User Service connection
	console.log('🔍 Testing User Service connection...');
	const userServiceResult = await testUserServiceConnection();
	healthResults.connectivity.user_service = userServiceResult;

	// Determine overall status
	const allServices = [elasticsearchResult, productServiceResult, cartServiceResult, userServiceResult];
	const connectedServices = allServices.filter(service => service.status === 'connected').length;
	const totalServices = allServices.length;

	healthResults.summary = {
		total_services: totalServices,
		connected: connectedServices,
		failed: totalServices - connectedServices,
		success_rate: `${Math.round((connectedServices / totalServices) * 100)}%`
	};

	if (connectedServices === totalServices) {
		healthResults.status = 'healthy';
		console.log('✅ All connectivity checks passed!');
	} else if (connectedServices > 0) {
		healthResults.status = 'degraded';
		console.log('⚠️ Some services unavailable');
	} else {
		healthResults.status = 'unhealthy';
		console.log('❌ All external services unavailable');
	}

	res.json(healthResults);
});

// 🔍 Individual Service Health Checks
app.get('/health/elasticsearch', async (req, res) => {
	const result = await testElasticsearchConnection();
	res.json({
		service: 'elasticsearch',
		...result,
		timestamp: new Date().toISOString()
	});
});

app.get('/health/product-service', async (req, res) => {
	const result = await testProductServiceConnection();
	res.json({
		service: 'product-service',
		...result,
		timestamp: new Date().toISOString()
	});
});

app.get('/health/cart-service', async (req, res) => {
	const result = await testCartServiceConnection();
	res.json({
		service: 'cart-service',
		...result,
		timestamp: new Date().toISOString()
	});
});

app.get('/health/user-service', async (req, res) => {
	const result = await testUserServiceConnection();
	res.json({
		service: 'user-service',
		...result,
		timestamp: new Date().toISOString()
	});
});

// 🔍 Service Information Endpoint
app.get('/health/info', (req, res) => {
	res.json({
		service: 'search-service',
		version: '1.1.0-ENHANCED',
		description: 'E-commerce Search Service - Elasticsearch Proxy with Live System Integration',
		environment: environment,
		configuration: {
			port: port,
			elasticsearch_url: apiServerHost,
			cors_enabled: true,
			health_checks: true
		},
		live_system_integration: {
			frontend: "https://ecommerce-microservices-platform.vercel.app",
			product_service: "https://ecommerce-product-service-56575270905a.herokuapp.com",
			cart_service: "https://ecommerce-cart-service-f2a908c60d8a.herokuapp.com",
			user_service: "http://34.118.167.199.nip.io"
		},
		endpoints: {
			health: "GET /health",
			connectivity: "GET /health/connectivity",
			elasticsearch_health: "GET /health/elasticsearch",
			product_service_health: "GET /health/product-service",
			cart_service_health: "GET /health/cart-service",
			user_service_health: "GET /health/user-service",
			service_info: "GET /health/info",
			search: "GET|POST /*"
		},
		cors_origins: getAllowedOrigins()
	});
});

// 🧪 Connectivity Test Functions

async function testElasticsearchConnection() {
	return new Promise((resolve) => {
		const startTime = Date.now();

		request.get({
			uri: `${apiServerHost}/_cluster/health`,
			timeout: 5000,
			headers: { 'accept-encoding': 'none' }
		}, (error, response, body) => {
			const responseTime = Date.now() - startTime;

			if (error) {
				console.log(`❌ Elasticsearch: Connection failed - ${error.message}`);
				resolve({
					status: 'disconnected',
					error: error.message,
					response_time: responseTime,
					endpoint: `${apiServerHost}/_cluster/health`
				});
			} else if (response && response.statusCode === 200) {
				console.log(`✅ Elasticsearch: Connection successful (${responseTime}ms)`);
				try {
					const healthData = JSON.parse(body);
					resolve({
						status: 'connected',
						response_time: responseTime,
						endpoint: `${apiServerHost}/_cluster/health`,
						cluster_status: healthData.status,
						cluster_name: healthData.cluster_name
					});
				} catch (parseError) {
					resolve({
						status: 'connected',
						response_time: responseTime,
						endpoint: `${apiServerHost}/_cluster/health`,
						note: 'Connected but unable to parse response'
					});
				}
			} else {
				console.log(`❌ Elasticsearch: HTTP ${response ? response.statusCode : 'Unknown'}`);
				resolve({
					status: 'disconnected',
					error: `HTTP ${response ? response.statusCode : 'Unknown'}`,
					response_time: responseTime,
					endpoint: `${apiServerHost}/_cluster/health`
				});
			}
		});
	});
}

async function testProductServiceConnection() {
	return new Promise((resolve) => {
		const productServiceUrl = environment === 'production'
			? 'https://ecommerce-product-service-56575270905a.herokuapp.com'
			: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';

		const startTime = Date.now();

		request.get({
			uri: `${productServiceUrl}/health`,
			timeout: 10000,
			headers: { 'accept-encoding': 'none' }
		}, (error, response, body) => {
			const responseTime = Date.now() - startTime;

			if (error) {
				console.log(`❌ Product Service: Connection failed - ${error.message}`);
				resolve({
					status: 'disconnected',
					error: error.message,
					response_time: responseTime,
					endpoint: `${productServiceUrl}/health`,
					platform: environment === 'production' ? 'Heroku' : 'Local'
				});
			} else if (response && response.statusCode === 200) {
				console.log(`✅ Product Service: Connection successful (${responseTime}ms)`);
				resolve({
					status: 'connected',
					response_time: responseTime,
					endpoint: `${productServiceUrl}/health`,
					platform: environment === 'production' ? 'Heroku' : 'Local'
				});
			} else {
				console.log(`❌ Product Service: HTTP ${response ? response.statusCode : 'Unknown'}`);
				resolve({
					status: 'disconnected',
					error: `HTTP ${response ? response.statusCode : 'Unknown'}`,
					response_time: responseTime,
					endpoint: `${productServiceUrl}/health`,
					platform: environment === 'production' ? 'Heroku' : 'Local'
				});
			}
		});
	});
}

async function testCartServiceConnection() {
	return new Promise((resolve) => {
		const cartServiceUrl = environment === 'production'
			? 'https://ecommerce-cart-service-f2a908c60d8a.herokuapp.com'
			: process.env.CART_SERVICE_URL || 'http://localhost:8080';

		const startTime = Date.now();

		request.get({
			uri: `${cartServiceUrl}/health`,
			timeout: 10000,
			headers: { 'accept-encoding': 'none' }
		}, (error, response, body) => {
			const responseTime = Date.now() - startTime;

			if (error) {
				console.log(`❌ Cart Service: Connection failed - ${error.message}`);
				resolve({
					status: 'disconnected',
					error: error.message,
					response_time: responseTime,
					endpoint: `${cartServiceUrl}/health`,
					platform: environment === 'production' ? 'Heroku' : 'Local'
				});
			} else if (response && response.statusCode === 200) {
				console.log(`✅ Cart Service: Connection successful (${responseTime}ms)`);
				resolve({
					status: 'connected',
					response_time: responseTime,
					endpoint: `${cartServiceUrl}/health`,
					platform: environment === 'production' ? 'Heroku' : 'Local'
				});
			} else {
				console.log(`❌ Cart Service: HTTP ${response ? response.statusCode : 'Unknown'}`);
				resolve({
					status: 'disconnected',
					error: `HTTP ${response ? response.statusCode : 'Unknown'}`,
					response_time: responseTime,
					endpoint: `${cartServiceUrl}/health`,
					platform: environment === 'production' ? 'Heroku' : 'Local'
				});
			}
		});
	});
}

async function testUserServiceConnection() {
	return new Promise((resolve) => {
		const userServiceUrl = environment === 'production'
			? 'http://34.118.167.199.nip.io'
			: process.env.USER_SERVICE_URL || 'http://localhost:9090';

		const startTime = Date.now();

		request.get({
			uri: `${userServiceUrl}/health`,
			timeout: 15000, // Longer timeout for GKE
			headers: { 'accept-encoding': 'none' }
		}, (error, response, body) => {
			const responseTime = Date.now() - startTime;

			if (error) {
				console.log(`❌ User Service: Connection failed - ${error.message}`);
				resolve({
					status: 'disconnected',
					error: error.message,
					response_time: responseTime,
					endpoint: `${userServiceUrl}/health`,
					platform: environment === 'production' ? 'GKE Kubernetes' : 'Local'
				});
			} else if (response && response.statusCode === 200) {
				console.log(`✅ User Service: Connection successful (${responseTime}ms)`);
				resolve({
					status: 'connected',
					response_time: responseTime,
					endpoint: `${userServiceUrl}/health`,
					platform: environment === 'production' ? 'GKE Kubernetes' : 'Local'
				});
			} else {
				console.log(`❌ User Service: HTTP ${response ? response.statusCode : 'Unknown'}`);
				resolve({
					status: 'disconnected',
					error: `HTTP ${response ? response.statusCode : 'Unknown'}`,
					response_time: responseTime,
					endpoint: `${userServiceUrl}/health`,
					platform: environment === 'production' ? 'GKE Kubernetes' : 'Local'
				});
			}
		});
	});
}

// 🔍 Original Elasticsearch proxy functionality (enhanced with CORS)
app.use('/', function (req, res, body) {
	// Skip favicon requests
	if (req.url === '/favicon.ico') {
		res.status(404).end();
		return;
	}

	// Skip health endpoints (already handled above)
	if (req.url.startsWith('/health')) {
		return; // Let the health endpoints handle these
	}

	console.log('🔍 Search request:', req.method, req.url);

	// Request method handling: exit if not GET or POST
	if (!(req.method === 'GET' || req.method === 'POST')) {
		const errMethod = {
			error: req.method + " request method is not supported. Use GET or POST.",
			timestamp: new Date().toISOString(),
			service: 'search-service'
		};
		console.log("❌ ERROR: " + req.method + " request method is not supported.");
		res.status(405).json(errMethod);
		return;
	}

	// Forward request to Elasticsearch
	var url = apiServerHost + req.url;
	console.log('🔄 Forwarding to Elasticsearch:', url);

	req.pipe(request({
		uri: url,
		headers: {
			'accept-encoding': 'none',
			'content-type': req.headers['content-type'] || 'application/json'
		},
		rejectUnauthorized: false,
		timeout: 30000
	}, function (err, response, body) {
		if (err) {
			console.log('❌ Elasticsearch request failed:', err.message);
		} else {
			console.log('✅ Elasticsearch request successful:', response.statusCode);
		}
	})).pipe(res);
});

// 🚀 Server startup with enhanced logging
app.listen(port, function () {
	console.log('🚀 ===============================================');
	console.log('🚀 SEARCH SERVICE STARTUP - ENHANCED VERSION');
	console.log('🚀 ===============================================');
	console.log('📋 Service: Search Service v1.1.0-ENHANCED');
	console.log('🌍 Environment:', environment);
	console.log('🌐 Server running on: http://localhost:' + port);
	console.log('🔍 Elasticsearch URL:', apiServerHost);
	console.log('🌐 CORS Configuration:');
	console.log('   🔗 Allowed Origins:');
	getAllowedOrigins().forEach(origin => {
		console.log(`      - ${origin}`);
	});
	console.log('   📋 Allowed Methods: GET, POST, OPTIONS');
	console.log('   🔒 Credentials: Disabled (Secure)');
	console.log('🚀 ===============================================');
	console.log('🔍 Available Endpoints:');
	console.log('   📊 Basic Health: GET /health');
	console.log('   🔍 Full Connectivity: GET /health/connectivity');
	console.log('   🔍 Elasticsearch Only: GET /health/elasticsearch');
	console.log('   📦 Product Service Only: GET /health/product-service');
	console.log('   🛒 Cart Service Only: GET /health/cart-service');
	console.log('   👤 User Service Only: GET /health/user-service');
	console.log('   📋 Service Info: GET /health/info');
	console.log('   🔍 Search Proxy: GET|POST /*');
	console.log('🚀 ===============================================');
	console.log('🎯 Search Service startup completed!');
	console.log('✅ Ready to handle requests and test connectivity!');
});