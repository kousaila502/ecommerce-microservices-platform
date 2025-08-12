# 🛍️ Product Service - Multi-Cloud E-commerce Microservice

> **Professional Node.js + Express.js microservice** for comprehensive product and deals management in a distributed e-commerce platform. Features MongoDB Atlas integration, Docker containerization, and automated CI/CD deployment to Heroku.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![Heroku](https://img.shields.io/badge/Heroku-Deployed-purple.svg)](https://heroku.com/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue.svg)](https://docker.com/)
[![API Docs](https://img.shields.io/badge/API-Swagger%203.0-orange.svg)](https://swagger.io/)

---

## 🚀 **Live Production Service**

**🌐 Service URL**: [`https://ecommerce-product-service-56575270905a.herokuapp.com`](https://ecommerce-product-service-56575270905a.herokuapp.com)

**📚 API Documentation**: [`/api-docs`](https://ecommerce-product-service-56575270905a.herokuapp.com/api-docs)

**🏥 Health Check**: [`/health`](https://ecommerce-product-service-56575270905a.herokuapp.com/health)

---

## 📋 **Table of Contents**

- [🎯 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🔧 Tech Stack](#-tech-stack)
- [📊 API Endpoints](#-api-endpoints)
- [🚀 Quick Start](#-quick-start)
- [🌍 Environment Setup](#-environment-setup)
- [🐳 Docker Deployment](#-docker-deployment)
- [🔄 CI/CD Pipeline](#-cicd-pipeline)
- [🔍 Testing](#-testing)
- [📈 Monitoring](#-monitoring)
- [🔒 Security](#-security)
- [🌐 Integration](#-integration)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)

---

## 🎯 **Overview**

The **Product Service** is a core microservice in a distributed e-commerce platform, responsible for managing products, deals, inventory, and advanced search capabilities. Built with modern Node.js practices and deployed using GitOps methodologies across multiple cloud platforms.

### **Business Capabilities**
- 📦 **Product Management** - CRUD operations for product catalog
- 🎯 **Deals Management** - Special offers and promotional deals
- 🔍 **Advanced Search** - Full-text search across multiple fields
- 📊 **Analytics & Statistics** - Product insights and metrics
- 🏷️ **Category Management** - Hierarchical product categorization
- 📈 **Inventory Tracking** - Stock management and low-stock alerts

### **Technical Highlights**
- 🔄 **RESTful API Design** - Standard HTTP methods and status codes
- 🗄️ **MongoDB Atlas Integration** - Cloud-native database with global replication
- 🐳 **Docker Containerization** - Consistent deployment across environments
- 🚀 **Heroku Cloud Deployment** - Managed platform with automatic scaling
- 🔄 **Automated CI/CD** - GitHub Actions pipeline with multi-stage deployment
- 📖 **OpenAPI 3.0 Documentation** - Interactive API documentation with Swagger UI

---

## ✨ **Key Features**

### **🛍️ Product Management**
- **Complete CRUD Operations** - Create, read, update, delete products
- **Advanced Filtering** - Filter by department, category, brand, price range
- **SKU Management** - Unique product identification and lookup
- **Inventory Control** - Stock tracking with low-stock alerts
- **Product Search** - Full-text search across titles, descriptions, categories

### **🎯 Deals & Promotions**
- **Deal Management** - Create and manage promotional offers
- **Price Tracking** - Original price and discount calculations
- **Time-based Deals** - Start/end date management for limited offers
- **Top-rated Deals** - Analytics-driven deal recommendations
- **Product Associations** - Link deals to specific products

### **📊 Analytics & Insights**
- **Product Statistics** - Count, pricing, rating analytics
- **Department Analytics** - Category-wise product distribution
- **Inventory Reports** - Stock levels and availability metrics
- **Performance Metrics** - Service health and response monitoring

### **🔒 Enterprise Security**
- **Environment-based Configuration** - No hardcoded credentials
- **CORS Protection** - Configurable cross-origin resource sharing
- **Input Validation** - Request data sanitization and validation
- **Error Handling** - Graceful error responses without data exposure
- **Health Monitoring** - Real-time service status and database connectivity

---

## 🏗️ **Architecture**

### **Microservice Architecture**
```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT SERVICE ECOSYSTEM                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🌐 Frontend (Vercel)                                          │
│  └── https://ecommerce-app-omega-two-64.vercel.app             │
│      │                                                         │
│      ├── Product Catalog Display                               │
│      ├── Search & Filtering                                    │
│      └── Admin Product Management                              │
│                                                                 │
│  🔗 API Gateway (GKE)                                          │
│  └── https://34.95.5.30.nip.io                                 │
│      │                                                         │
│      ├── Request Routing                                       │
│      ├── Authentication                                        │
│      └── Load Balancing                                        │
│                                                                 │
│  📦 PRODUCT SERVICE (Heroku) ← CURRENT SERVICE                 │
│  └── https://ecommerce-product-service-56575270905a.herokuapp.com │
│      │                                                         │
│      ├── Product Management API                                │
│      ├── Deals Management API                                  │
│      ├── Search & Analytics                                    │
│      └── Health Monitoring                                     │
│                                                                 │
│  🔄 Integration Points                                          │
│  ├── 🛒 Cart Service (Heroku)                                  │
│  ├── 📋 Order Service (GKE)                                    │
│  ├── 👤 User Service (GKE)                                     │
│  └── 🔍 Search Service (Render)                                │
│                                                                 │
│  🗄️ Database (MongoDB Atlas)                                   │
│  └── cluster0.qmmyvta.mongodb.net                              │
│      │                                                         │
│      ├── Products Collection                                   │
│      ├── Deals Collection                                      │
│      └── Global Replication                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Service Layer Architecture**
```
┌─────────────────────┐
│   Express Routes    │ ← HTTP Request Handling
├─────────────────────┤
│   Service Layer     │ ← Business Logic
├─────────────────────┤
│   MongoDB Models    │ ← Data Access Layer
├─────────────────────┤
│   Database Layer    │ ← MongoDB Atlas
└─────────────────────┘
```

---

## 🔧 **Tech Stack**

### **Backend Technologies**
- **Runtime**: Node.js 18.x LTS
- **Framework**: Express.js 4.x
- **Database**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose 7.x
- **Authentication**: JWT (handled upstream)

### **Development Tools**
- **API Documentation**: Swagger UI + OpenAPI 3.0
- **Environment Management**: dotenv
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest, Supertest
- **Process Management**: PM2

### **Deployment & DevOps**
- **Containerization**: Docker
- **Cloud Platform**: Heroku (Production)
- **CI/CD**: GitHub Actions
- **Container Registry**: Docker Hub
- **Database**: MongoDB Atlas
- **Monitoring**: Heroku Metrics + Custom Health Checks

### **Integration**
- **CORS**: Multi-platform support
- **API Gateway**: Kubernetes Gateway API
- **Frontend**: Vercel React Application
- **Microservices**: Cart, Order, User, Search services

---

## 📊 **API Endpoints**

### **🏥 Health & Status**
| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/health` | Service health check | Health status with DB connectivity |

### **📦 Product Management**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/products` | Get all products with pagination | No |
| `GET` | `/products/:id` | Get specific product by ID | No |
| `GET` | `/products/sku/:sku` | Get product by SKU | No |
| `POST` | `/products` | Create new product | Yes (Admin) |
| `PUT` | `/products/:id` | Update existing product | Yes (Admin) |
| `DELETE` | `/products/:id` | Soft delete product | Yes (Admin) |
| `PATCH` | `/products/:id/stock` | Update product stock | Yes (Admin) |
| `PATCH` | `/products/:id/restore` | Restore deleted product | Yes (Admin) |

### **🔍 Search & Filtering**
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/products/search/:term` | Full-text product search | `term`, `limit` |
| `GET` | `/products/department/:dept` | Filter by department | `department`, `limit` |
| `GET` | `/products/category/:cat` | Filter by category | `category`, `limit` |
| `GET` | `/products/brand/:brand` | Filter by brand | `brand`, `limit` |
| `GET` | `/products/price/:min/:max` | Filter by price range | `minPrice`, `maxPrice`, `limit` |

### **📈 Analytics & Inventory**
| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/products/stats` | Product statistics & analytics | Aggregated metrics |
| `GET` | `/products/inventory/low-stock` | Low stock products | Products below threshold |

### **🎯 Deals Management**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/deals` | Get all deals with filtering | No |
| `GET` | `/deals/:id` | Get specific deal | No |
| `POST` | `/deals` | Create new deal | Yes (Admin) |
| `PUT` | `/deals/:id` | Update deal | Yes (Admin) |
| `DELETE` | `/deals/:id` | Soft delete deal | Yes (Admin) |
| `GET` | `/deals/search/:term` | Search deals | No |
| `GET` | `/deals/top-rated` | Get highest rated deals | No |
| `GET` | `/deals/recent` | Get recently updated deals | No |

### **📚 Documentation**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api-docs` | Interactive Swagger UI documentation |

---

## 🚀 **Quick Start**

### **1. Clone & Install**
```bash
# Clone the repository
git clone <repository-url>
cd products-cna-microservice

# Install dependencies
npm install
```

### **2. Environment Setup**
```bash
# Create environment file
cp .env.example .env

# Configure required variables
MONGODB_URI=mongodb+srv://username:password@cluster0.qmmyvta.mongodb.net/ecommerce-product-db
PORT=3001
NODE_ENV=development
```

### **3. Start Development Server**
```bash
# Start in development mode
npm run dev

# Or start in production mode
npm start
```

### **4. Verify Installation**
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test products endpoint
curl http://localhost:3001/products

# Access API documentation
open http://localhost:3001/api-docs
```

---

## 🌍 **Environment Setup**

### **Required Environment Variables**
```bash
# Database Configuration (Required)
MONGODB_URI=mongodb+srv://username:password@cluster0.qmmyvta.mongodb.net/ecommerce-product-db

# Server Configuration
PORT=3001                    # Server port (Heroku uses dynamic PORT)
NODE_ENV=production          # Environment (development/production)

# Service Identification
SERVICE_NAME=product-service
SERVICE_VERSION=2.0.0
```

### **Optional Environment Variables**
```bash
# CORS Configuration
CORS_ORIGINS=https://frontend-url.com,https://api-gateway-url.com

# Logging
LOG_LEVEL=info              # debug/info/warn/error

# Database Options
DB_MAX_CONNECTIONS=10
DB_TIMEOUT=30000
```

### **Environment Validation**
The service automatically validates required environment variables on startup:
```javascript
// Validates MONGODB_URI is present
// Fails fast if configuration is incomplete
// Prevents runtime errors from missing config
```

---

## 🐳 **Docker Deployment**

### **Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application
CMD ["npm", "start"]
```

### **Docker Commands**
```bash
# Build image
docker build -t product-service .

# Run container
docker run -p 3001:3001 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e NODE_ENV=production \
  product-service

# Run with compose
docker-compose up -d
```

### **Docker Compose**
```yaml
version: '3.8'
services:
  product-service:
    build: .
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## 🔄 **CI/CD Pipeline**

### **GitHub Actions Workflow**
```yaml
# Multi-stage deployment pipeline
name: Product Service - Heroku Deployment Pipeline

# Triggers
on:
  push:
    paths: ["products-cna-microservice/**"]
    branches: [multicloud-gitops-research]
  workflow_dispatch:

# Stages
jobs:
  1. 📊 Pipeline Initialization
  2. 🔍 Source Code Analysis & Security Scan
  3. 🔨 Build & Test (Node.js)
  4. 🐳 Docker Build & Push (Docker Hub)
  5. 🚀 Deploy to Heroku (Container Registry)
  6. ✅ Post-Deployment Verification
```

### **Pipeline Features**
- **🔒 Security Scanning** - Automated vulnerability detection
- **🧪 Automated Testing** - Unit and integration tests
- **🐳 Container Registry** - Docker Hub image management
- **🚀 Zero-Downtime Deployment** - Heroku container releases
- **✅ Health Verification** - Post-deployment validation
- **📊 Deployment Metrics** - Build time and success tracking

### **Deployment Commands**
```bash
# Automatic deployment (recommended)
git push origin multicloud-gitops-research

# Manual deployment via GitHub Actions
# Actions → Select workflow → Run workflow

# Direct Heroku deployment
git push heroku main
```

---

## 🔍 **Testing**

### **Test Categories**
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# API tests
npm run test:api

# All tests
npm test
```

### **API Testing Examples**
```bash
# Health check
curl -X GET "https://ecommerce-product-service-56575270905a.herokuapp.com/health"

# Get products
curl -X GET "https://ecommerce-product-service-56575270905a.herokuapp.com/products?limit=10"

# Search products
curl -X GET "https://ecommerce-product-service-56575270905a.herokuapp.com/products/search/laptop"

# Get product by ID
curl -X GET "https://ecommerce-product-service-56575270905a.herokuapp.com/products/123456"

# Create product (requires admin auth)
curl -X POST "https://ecommerce-product-service-56575270905a.herokuapp.com/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "MacBook Pro 16",
    "sku": "MBP16-001",
    "price": 2499.99,
    "department": "Electronics",
    "category": "Laptops",
    "brand": "Apple",
    "stock": 25
  }'
```

### **Performance Testing**
```bash
# Load testing with autocannon
npm install -g autocannon
autocannon -c 100 -d 30 https://ecommerce-product-service-56575270905a.herokuapp.com/products

# Response time testing
curl -w "@curl-format.txt" -o /dev/null https://ecommerce-product-service-56575270905a.herokuapp.com/health
```

---

## 📈 **Monitoring**

### **Health Check Response**
```json
{
  "status": "healthy",
  "service": "product-service",
  "version": "2.0.0",
  "timestamp": "2025-08-12T15:30:00.000Z",
  "environment": "production",
  "database": {
    "status": "connected",
    "provider": "MongoDB Atlas"
  },
  "platform": "Heroku",
  "features": [
    "Product Management",
    "Deals Management", 
    "Advanced Search",
    "Analytics",
    "Inventory Tracking"
  ]
}
```

### **Key Metrics**
- **📊 Response Time** - API endpoint performance
- **🔄 Throughput** - Requests per second capacity
- **💾 Database Performance** - MongoDB query optimization
- **🏥 Uptime** - Service availability tracking
- **🚨 Error Rates** - Error monitoring and alerting

### **Monitoring Tools**
- **Heroku Metrics** - Built-in application metrics
- **MongoDB Atlas Monitoring** - Database performance metrics
- **Custom Health Checks** - Application-specific monitoring
- **GitHub Actions** - Deployment success tracking

---

## 🔒 **Security**

### **Security Features Implemented**
- ✅ **No Hardcoded Credentials** - Environment-based configuration
- ✅ **Environment Validation** - Startup security checks
- ✅ **CORS Protection** - Configurable origin restrictions
- ✅ **Input Validation** - Request data sanitization
- ✅ **Error Handling** - No sensitive data exposure
- ✅ **Secure Headers** - HTTP security headers
- ✅ **Rate Limiting** - API request throttling

### **Authentication & Authorization**
```javascript
// Authentication handled upstream by API Gateway
// Admin operations require valid JWT tokens
// Role-based access control for management endpoints
```

### **Data Protection**
- **🔐 Encryption at Rest** - MongoDB Atlas encryption
- **🚀 HTTPS Only** - TLS/SSL for all communications
- **🛡️ Data Validation** - Input sanitization and validation
- **📝 Audit Logging** - Request/response logging for security

### **Security Best Practices**
```javascript
// Environment variable validation
function validateEnvironment() {
  const required = ['MONGODB_URI'];
  const missing = required.filter(env => !process.env[env]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }
}

// CORS configuration
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
```

---

## 🌐 **Integration**

### **Frontend Integration**
```javascript
// React/Next.js frontend integration
const API_BASE_URL = 'https://ecommerce-product-service-56575270905a.herokuapp.com';

// Get products
const response = await fetch(`${API_BASE_URL}/products?limit=20`);
const { success, data, count } = await response.json();

// Search products
const searchResponse = await fetch(`${API_BASE_URL}/products/search/laptop`);
const searchResults = await searchResponse.json();
```

### **Microservice Integration**
```javascript
// Cart Service integration
// Validates product existence and pricing when adding to cart
POST /cart/items
{
  "productId": "123456",
  "quantity": 2
}
// → Calls Product Service to verify product details

// Order Service integration  
// Retrieves product information during order processing
GET /products/123456
// → Returns product details for order fulfillment

// Search Service integration
// Indexes product data for advanced search capabilities
GET /products/search/laptop
// → Provides product data for search indexing
```

### **API Gateway Integration**
```yaml
# Kubernetes Gateway API configuration
apiVersion: gateway.networking.k8s.io/v1alpha2
kind: HTTPRoute
metadata:
  name: product-service-route
spec:
  hostnames:
  - "34.95.5.30.nip.io"
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /products
    backendRefs:
    - name: product-service
      port: 3001
```

---

## 📚 **Documentation**

### **API Documentation**
- **📖 Interactive Swagger UI** - Available at `/api-docs`
- **📋 OpenAPI 3.0 Specification** - Complete API schema
- **🔍 Request/Response Examples** - Comprehensive examples
- **🏷️ Schema Definitions** - Detailed data models

### **Code Documentation**
```javascript
/**
 * Product Service - Main service class for product management
 * 
 * @class ProductService
 * @description Handles all product-related business logic
 * @author Your Name
 * @version 2.0.0
 */
class ProductService {
  /**
   * Get all products with optional filtering
   * @param {Object} filters - Filter parameters
   * @param {number} filters.limit - Maximum results
   * @param {string} filters.department - Department filter
   * @returns {Promise<Array>} Array of products
   */
  async getAllProducts(filters = {}) {
    // Implementation
  }
}
```

### **Database Schema Documentation**
```javascript
// Product Schema
const productSchema = new mongoose.Schema({
  _id: { type: Number, required: true },           // Unique product ID
  sku: { type: String, required: true, unique: true }, // Stock keeping unit
  title: { type: String, required: true },         // Product name
  description: String,                             // Product description
  price: { type: Number, required: true, min: 0 }, // Price in USD
  currency: { type: String, default: 'USD' },     // Currency code
  category: String,                                // Product category
  department: String,                              // Department classification
  image: String,                                   // Product image URL
  stock: { type: Number, default: 0 },            // Available quantity
  rating: { type: Number, min: 0, max: 5, default: 0 }, // Average rating
  brand: String,                                   // Product brand
  isActive: { type: Boolean, default: true },     // Active status
  createdAt: { type: Date, default: Date.now },   // Creation timestamp
  updatedAt: { type: Date, default: Date.now }    // Last update timestamp
});
```

---

## 🤝 **Contributing**

### **Development Workflow**
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Code Standards**
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Conventional Commits** - Commit message format
- **JSDoc** - Code documentation
- **Test Coverage** - Minimum 80% coverage

### **Pull Request Guidelines**
- ✅ Include tests for new features
- ✅ Update documentation
- ✅ Follow existing code style
- ✅ Add appropriate error handling
- ✅ Include performance considerations

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 **Author**

**Your Name**
- 🌐 Portfolio: [your-portfolio.com](https://kousaila.dev)
- 💼 LinkedIn: [linkedin.com/in/yourname](https://linkedin.com/in/yourname)
- 📧 Email: k.benhamouche@esi-sba.dz
- 🐙 GitHub: [@yourusername](https://github.com/kousaila502)

---

## 🎯 **Project Status**

✅ **Production Ready** - Live and serving traffic  
✅ **Fully Documented** - Comprehensive documentation  
✅ **CI/CD Enabled** - Automated deployment pipeline  
✅ **Security Hardened** - Production security standards  
✅ **Performance Optimized** - Scalable and efficient  
✅ **Monitoring Enabled** - Health checks and metrics  

---

## 🔗 **Related Services**

- 🛒 **Cart Service** - Shopping cart management
- 📋 **Order Service** - Order processing and fulfillment  
- 👤 **User Service** - User authentication and profiles
- 🔍 **Search Service** - Advanced product search
- 🎨 **Frontend Application** - React-based user interface

---

*Built with ❤️ using Node.js, Express.js, and MongoDB Atlas*