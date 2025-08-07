import asyncio
import httpx
import redis.asyncio as redis
from datetime import datetime
from sqlalchemy import text
from config.settings import settings
from database.connection import engine
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StartupHealthChecker:
    """
    Comprehensive startup health checker for Order Service
    Tests connectivity to all external dependencies on startup
    Updated with live system URLs
    """
    
    def __init__(self):
        self.results = {
            "postgres": {"status": "pending", "details": None},
            "redis": {"status": "pending", "details": None},
            "user_service": {"status": "pending", "details": None},
            "cart_service": {"status": "pending", "details": None},
            "product_service": {"status": "pending", "details": None},
            "search_service": {"status": "pending", "details": None}
        }
    
    async def check_postgres_connection(self) -> Dict[str, Any]:
        """Test PostgreSQL database connection (Neon)"""
        try:
            async with engine.begin() as conn:
                # Test basic connection
                result = await conn.execute(text("SELECT version();"))
                version = result.fetchone()
                
                # Get database info
                db_result = await conn.execute(text("SELECT current_database();"))
                db_name = db_result.fetchone()[0]
                
                user_result = await conn.execute(text("SELECT current_user;"))
                user_name = user_result.fetchone()[0]
                
                return {
                    "status": "connected",
                    "version": version[0] if version else "Unknown",
                    "database": db_name,
                    "user": user_name,
                    "provider": "Neon PostgreSQL",
                    "url": settings.database_url.replace(settings.database_url.split('@')[0].split('//')[1], '***') if settings.database_url else "Not configured"
                }
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e),
                "provider": "Neon PostgreSQL",
                "url": settings.database_url.replace(settings.database_url.split('@')[0].split('//')[1], '***') if settings.database_url else "Not configured"
            }
    
    async def check_redis_connection(self) -> Dict[str, Any]:
        """Test Redis connection (Upstash)"""
        try:
            if not settings.redis_url:
                return {
                    "status": "not_configured",
                    "error": "Redis URL not configured",
                    "provider": "Upstash Redis"
                }
                
            # Parse Redis URL
            redis_client = redis.from_url(settings.redis_url)
            
            # Test ping
            await redis_client.ping()
            
            # Test set/get
            test_key = "health_check_order_service"
            await redis_client.set(test_key, "test_value", ex=60)
            value = await redis_client.get(test_key)
            await redis_client.delete(test_key)
            
            # Get Redis info
            info = await redis_client.info()
            
            await redis_client.close()
            
            return {
                "status": "connected",
                "version": info.get("redis_version", "Unknown"),
                "memory": info.get("used_memory_human", "Unknown"),
                "clients": info.get("connected_clients", "Unknown"),
                "provider": "Upstash Redis",
                "url": "discrete-raccoon-6606.upstash.io:6379"
            }
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e),
                "provider": "Upstash Redis",
                "url": "discrete-raccoon-6606.upstash.io:6379"
            }
    
    async def check_service_connection(self, service_name: str, service_url: str, endpoint: str = "/health") -> Dict[str, Any]:
        """Test external service connection with live system URLs"""
        try:
            # Special handling for User Service (GKE via API Gateway)
            if service_name == "user_service":
                test_url = f"{service_url}/user/health"
                provider = "GKE Kubernetes (API Gateway)"
            # Heroku services
            elif service_name in ["cart_service", "product_service"]:
                test_url = f"{service_url}{endpoint}"
                provider = "Heroku Platform"
            # Render service
            elif service_name == "search_service":
                test_url = f"{service_url}{endpoint}"
                provider = "Render Platform"
            else:
                test_url = f"{service_url}{endpoint}"
                provider = "Unknown Platform"
            
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(test_url)
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                        return {
                            "status": "connected",
                            "response_time": response.elapsed.total_seconds(),
                            "service_info": data,
                            "provider": provider,
                            "url": service_url,
                            "endpoint": test_url
                        }
                    except:
                        return {
                            "status": "connected",
                            "response_time": response.elapsed.total_seconds(),
                            "service_info": {"message": "Service responded but no JSON"},
                            "provider": provider,
                            "url": service_url,
                            "endpoint": test_url
                        }
                else:
                    return {
                        "status": "warning",
                        "http_status": response.status_code,
                        "response_time": response.elapsed.total_seconds(),
                        "provider": provider,
                        "url": service_url,
                        "endpoint": test_url
                    }
        except httpx.TimeoutException:
            return {
                "status": "timeout",
                "error": "Connection timeout (15s)",
                "provider": provider if 'provider' in locals() else "Unknown",
                "url": service_url,
                "endpoint": test_url if 'test_url' in locals() else endpoint
            }
        except Exception as e:
            return {
                "status": "failed",
                "error": str(e),
                "provider": provider if 'provider' in locals() else "Unknown",
                "url": service_url,
                "endpoint": test_url if 'test_url' in locals() else endpoint
            }
    
    async def run_all_checks(self) -> Dict[str, Any]:
        """Run all connectivity checks with live system information"""
        logger.info("🚀 =================================================")
        logger.info("🚀 ORDER SERVICE STARTUP - LIVE SYSTEM CONNECTIVITY")
        logger.info("🚀 =================================================")
        logger.info(f"🕐 Startup Time: {datetime.now()}")
        logger.info(f"📋 Service: Order Service v2.0.0-LIVE")
        logger.info(f"🌍 Environment: {settings.environment}")
        logger.info("🌐 Live System Configuration:")
        logger.info(f"   🎯 Frontend: https://ecommerce-microservices-platform.vercel.app")
        logger.info(f"   🔗 API Gateway: http://34.118.167.199.nip.io")
        logger.info(f"   🎮 Controller: http://techmart-controller.uksouth.azurecontainer.io:3000")
        logger.info("🔗 External Services:")
        logger.info(f"   📊 PostgreSQL (Neon): ep-cold-breeze-aedi5hre-pooler.c-2.us-east-2.aws.neon.tech")
        logger.info(f"   🗄️  Redis (Upstash): discrete-raccoon-6606.upstash.io:6379")
        logger.info(f"   👤 User Service (GKE): {settings.user_service_url}")
        logger.info(f"   🛒 Cart Service (Heroku): {settings.cart_service_url}")
        logger.info(f"   📦 Product Service (Heroku): {settings.product_service_url}")
        logger.info(f"   🔍 Search Service (Render): {settings.search_service_url}")
        
        # CORS Configuration Info
        logger.info("🌐 CORS Configuration:")
        if settings.is_production:
            logger.info("   🔗 Allowed Origins (Production):")
            logger.info("      - https://ecommerce-microservices-platform.vercel.app")
            logger.info("      - http://34.118.167.199.nip.io")
            logger.info("      - https://ecommerce-cart-service-f2a908c60d8a.herokuapp.com")
            logger.info("      - https://ecommerce-product-service-56575270905a.herokuapp.com")
        else:
            logger.info("   🔗 Allowed Origins (Development + Live):")
            logger.info("      - https://ecommerce-microservices-platform.vercel.app")
            logger.info("      - http://34.118.167.199.nip.io")
            logger.info("      - http://localhost:3000 (dev)")
            logger.info("      - http://localhost:8080 (dev)")
        logger.info("   📋 Allowed Methods: GET, POST, PUT, DELETE, OPTIONS")
        logger.info("   🔒 Credentials: Enabled (Secure)")
        
        logger.info("🚀 =================================================")
        logger.info("🔍 Starting live system connectivity checks...")
        
        # Run checks concurrently
        logger.info("🔍 Testing Neon PostgreSQL connection...")
        postgres_task = self.check_postgres_connection()
        
        logger.info("🔍 Testing Upstash Redis connection...")
        redis_task = self.check_redis_connection()
        
        logger.info("🔍 Testing User Service (GKE) connection...")
        user_service_task = self.check_service_connection("user_service", settings.user_service_url)
        
        logger.info("🔍 Testing Cart Service (Heroku) connection...")
        cart_service_task = self.check_service_connection("cart_service", settings.cart_service_url)
        
        logger.info("🔍 Testing Product Service (Heroku) connection...")
        product_service_task = self.check_service_connection("product_service", settings.product_service_url)
        
        logger.info("🔍 Testing Search Service (Render) connection...")
        search_service_task = self.check_service_connection("search_service", settings.search_service_url)
        
        # Wait for all checks to complete
        postgres_result, redis_result, user_result, cart_result, product_result, search_result = await asyncio.gather(
            postgres_task,
            redis_task,
            user_service_task,
            cart_service_task,
            product_service_task,
            search_service_task,
            return_exceptions=True
        )
        
        # Store results
        self.results["postgres"] = postgres_result if not isinstance(postgres_result, Exception) else {"status": "error", "error": str(postgres_result)}
        self.results["redis"] = redis_result if not isinstance(redis_result, Exception) else {"status": "error", "error": str(redis_result)}
        self.results["user_service"] = user_result if not isinstance(user_result, Exception) else {"status": "error", "error": str(user_result)}
        self.results["cart_service"] = cart_result if not isinstance(cart_result, Exception) else {"status": "error", "error": str(cart_result)}
        self.results["product_service"] = product_result if not isinstance(product_result, Exception) else {"status": "error", "error": str(product_result)}
        self.results["search_service"] = search_result if not isinstance(search_result, Exception) else {"status": "error", "error": str(search_result)}
        
        # Log results
        await self._log_results()
        
        return self.results
    
    async def _log_results(self):
        """Log connectivity check results with live system info"""
        logger.info("🚀 =================================================")
        logger.info("📊 LIVE SYSTEM CONNECTIVITY RESULTS:")
        
        # PostgreSQL (Neon)
        postgres = self.results["postgres"]
        if postgres["status"] == "connected":
            logger.info(f"   📊 PostgreSQL (Neon): ✅ CONNECTED")
            logger.info(f"      - Version: {postgres.get('version', 'Unknown')}")
            logger.info(f"      - Database: {postgres.get('database', 'Unknown')}")
            logger.info(f"      - User: {postgres.get('user', 'Unknown')}")
        else:
            logger.error(f"   📊 PostgreSQL (Neon): ❌ FAILED - {postgres.get('error', 'Unknown error')}")
        
        # Redis (Upstash)
        redis_res = self.results["redis"]
        if redis_res["status"] == "connected":
            logger.info(f"   🗄️  Redis (Upstash): ✅ CONNECTED")
            logger.info(f"      - Version: {redis_res.get('version', 'Unknown')}")
            logger.info(f"      - Memory: {redis_res.get('memory', 'Unknown')}")
        elif redis_res["status"] == "not_configured":
            logger.warning(f"   🗄️  Redis (Upstash): ⚠️  NOT CONFIGURED")
        else:
            logger.error(f"   🗄️  Redis (Upstash): ❌ FAILED - {redis_res.get('error', 'Unknown error')}")
        
        # External Services with platform info
        services = [
            ("user_service", "👤 User Service (GKE)", "User authentication via API Gateway"),
            ("cart_service", "🛒 Cart Service (Heroku)", "Shopping cart operations"),
            ("product_service", "📦 Product Service (Heroku)", "Product information"),
            ("search_service", "🔍 Search Service (Render)", "Product search capabilities")
        ]
        
        for service_key, service_name, description in services:
            service = self.results[service_key]
            if service["status"] == "connected":
                response_time = service.get('response_time', 0)
                provider = service.get('provider', 'Unknown')
                logger.info(f"   {service_name}: ✅ CONNECTED ({response_time:.3f}s)")
                logger.info(f"      - Platform: {provider}")
                if 'service_info' in service and isinstance(service['service_info'], dict):
                    service_version = service['service_info'].get('version', 'Unknown')
                    logger.info(f"      - Version: {service_version}")
            elif service["status"] == "warning":
                provider = service.get('provider', 'Unknown')
                logger.warning(f"   {service_name}: ⚠️  WARNING - HTTP {service.get('http_status', 'Unknown')}")
                logger.warning(f"      - Platform: {provider}")
            elif service["status"] == "timeout":
                provider = service.get('provider', 'Unknown')
                logger.error(f"   {service_name}: ⏰ TIMEOUT - Connection timeout")
                logger.error(f"      - Platform: {provider}")
            else:
                provider = service.get('provider', 'Unknown')
                logger.error(f"   {service_name}: ❌ FAILED - {service.get('error', 'Unknown error')}")
                logger.error(f"      - Platform: {provider}")
        
        # Summary
        connected_count = sum(1 for result in self.results.values() if result.get("status") == "connected")
        total_count = len(self.results)
        not_configured_count = sum(1 for result in self.results.values() if result.get("status") == "not_configured")
        
        if connected_count == total_count:
            logger.info("🎉 ALL LIVE SYSTEM CONNECTIONS SUCCESSFUL!")
            logger.info("✅ Order Service is ready to handle requests")
        elif connected_count + not_configured_count == total_count:
            logger.info("🎉 ALL CONFIGURED SERVICES CONNECTED!")
            logger.info("✅ Order Service is ready to handle requests")
        else:
            logger.warning(f"⚠️  {connected_count}/{total_count} connections successful")
            logger.warning("⚠️  Some services may have limited functionality")
        
        logger.info("🚀 =================================================")
        logger.info("🌐 Health Check Endpoints Available:")
        logger.info("   📊 Basic Health: GET /health")
        logger.info("   🔍 Full Connectivity: GET /health/connectivity") 
        logger.info("   📊 PostgreSQL Only: GET /health/postgres")
        logger.info("   🗄️  Redis Only: GET /health/redis")
        logger.info("   👤 User Service Only: GET /health/user-service")
        logger.info("   🛒 Cart Service Only: GET /health/cart-service")
        logger.info("   📦 Product Service Only: GET /health/product-service")
        logger.info("   🔍 Search Service Only: GET /health/search-service")
        logger.info("   📋 Service Info: GET /health/info")
        logger.info("🚀 =================================================")
        logger.info("🎯 Order Service startup completed!")

# Global instance
startup_checker = StartupHealthChecker()

# Function to run startup checks
async def run_startup_checks():
    """Run startup connectivity checks"""
    return await startup_checker.run_all_checks()

# Individual check functions for health endpoints
async def check_postgres_health():
    """Check PostgreSQL health for health endpoint"""
    checker = StartupHealthChecker()
    return await checker.check_postgres_connection()

async def check_redis_health():
    """Check Redis health for health endpoint"""
    checker = StartupHealthChecker()
    return await checker.check_redis_connection()

async def check_user_service_health():
    """Check User Service health for health endpoint"""
    checker = StartupHealthChecker()
    return await checker.check_service_connection("user_service", settings.user_service_url)

async def check_cart_service_health():
    """Check Cart Service health for health endpoint"""
    checker = StartupHealthChecker()
    return await checker.check_service_connection("cart_service", settings.cart_service_url)

async def check_product_service_health():
    """Check Product Service health for health endpoint"""
    checker = StartupHealthChecker()
    return await checker.check_service_connection("product_service", settings.product_service_url)

async def check_search_service_health():
    """Check Search Service health for health endpoint"""
    checker = StartupHealthChecker()
    return await checker.check_service_connection("search_service", settings.search_service_url)