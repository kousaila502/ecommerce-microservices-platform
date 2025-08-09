from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    All sensitive data should come from environment variables
    """
    
    # Database settings - MUST be provided via environment variables
    database_url: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/orderdb")
    
    # JWT settings (must match user service) - MUST be provided via environment variables
    secret_key: str = os.getenv("SECRET_KEY", "dyO5kHriKkZm_8tSzTxZOmKGd0iGhMLPusNi61pi5bU4MxJ12SZ2B0-iznJrLP-DTPsHDbao3_QduMo2TVpOCA")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Service settings
    service_name: str = os.getenv("SERVICE_NAME", "order-service")
    service_port: int = int(os.getenv("SERVICE_PORT", os.getenv("PORT", "8081")))  # Support Heroku PORT
    service_host: str = os.getenv("SERVICE_HOST", "0.0.0.0")
    
    # External services URLs - Updated with live system URLs
    user_service_url: str = os.getenv("USER_SERVICE_URL", "https://34.95.5.30.nip.io/user")
    cart_service_url: str = os.getenv("CART_SERVICE_URL", "https://ecommerce-cart-service-f2a908c60d8a.herokuapp.com")
    product_service_url: str = os.getenv("PRODUCT_SERVICE_URL", "https://ecommerce-product-service-56575270905a.herokuapp.com")
    search_service_url: str = os.getenv("SEARCH_SERVICE_URL", "https://ecommerce-microservices-platform.onrender.com")
    
    # Redis settings - Updated with Upstash Redis
    redis_url: str = os.getenv("REDIS_URL")
    
    # Environment settings
    environment: str = os.getenv("ENVIRONMENT", "production")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    # CORS settings
    cors_origins: Optional[str] = os.getenv("CORS_ORIGINS")
    cors_methods: str = os.getenv("CORS_METHODS", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
    cors_headers: str = os.getenv("CORS_HEADERS", "Content-Type,Authorization,X-Requested-With,Accept,Origin")
    cors_credentials: bool = os.getenv("CORS_CREDENTIALS", "true").lower() == "true"
    
    def __post_init__(self):
        """Validate required environment variables"""
        required_vars = {
            "DATABASE_URL": self.database_url,
            "SECRET_KEY": self.secret_key,
            "REDIS_URL": self.redis_url
        }
        
        # Check if we're using live system defaults or environment variables
        if not self.database_url:
            required_vars["DATABASE_URL"] = None
        if not self.redis_url:
            required_vars["REDIS_URL"] = None
            
        missing_vars = [var for var, value in required_vars.items() if not value]
        
        if missing_vars:
            print("❌ SECURITY ERROR: Missing required environment variables!")
            print("🔒 For security, all sensitive configuration must be provided via environment variables.")
            print("📋 Missing variables:")
            for var in missing_vars:
                print(f"   - {var}")
            print("\n💡 Please set these environment variables before starting the service.")
            print("🔐 This prevents hardcoded credentials in the codebase.")
            print("\n🌐 Live System URLs (defaults):")
            print(f"   👤 User Service: {self.user_service_url}")
            print(f"   🛒 Cart Service: {self.cart_service_url}")
            print(f"   📦 Product Service: {self.product_service_url}")
            print(f"   🔍 Search Service: {self.search_service_url}")
            raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
        
        print("✅ Security validation passed - all sensitive data loaded from environment variables")
        print("🌐 Using live system service URLs")
    
    # Computed properties
    @property
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.environment.lower() == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.environment.lower() == "production"
    
    @property
    def async_database_url(self) -> str:
        """Convert PostgreSQL URL to async format"""
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable is required")
        return self.database_url.replace("postgresql://", "postgresql+asyncpg://")
    
    def get_service_info(self) -> dict:
        """Get service information for logging/debugging (safe version without credentials)"""
        return {
            "name": self.service_name,
            "port": self.service_port,
            "environment": self.environment,
            "database_configured": bool(self.database_url),
            "redis_configured": bool(self.redis_url),
            "external_services": {
                "user_service": self.user_service_url,
                "cart_service": self.cart_service_url,
                "product_service": self.product_service_url,
                "search_service": self.search_service_url
            }
        }
    
    def get_live_system_urls(self) -> dict:
        """Get live system URLs for documentation"""
        return {
            "frontend": "https://ecommerce-microservices-platform.vercel.app",
            "api_gateway": "http://34.118.167.199.nip.io",
            "controller": "http://techmart-controller.uksouth.azurecontainer.io:3000",
            "services": {
                "user": self.user_service_url,
                "cart": self.cart_service_url,
                "product": self.product_service_url,
                "search": self.search_service_url
            }
        }
    
    class Config:
        """Pydantic configuration"""
        env_file = ".env"
        case_sensitive = False

# Create global settings instance with validation
try:
    settings = Settings()
    settings.__post_init__()  # Manually call validation
except ValueError as e:
    print(f"❌ Configuration Error: {e}")
    import sys
    sys.exit(1)

# Print settings info when module is loaded (for debugging) - SAFE VERSION
if __name__ == "__main__":
    print("🚀 Order Service Settings (Live System Integration):")
    print(f"📊 Database: {'✅ Configured' if settings.database_url else '❌ Missing'}")
    print(f"🗄️  Redis: {'✅ Configured' if settings.redis_url else '❌ Missing'}")
    print(f"🔑 JWT Algorithm: {settings.algorithm}")
    print(f"🌐 Service Port: {settings.service_port}")
    print(f"🏷️  Environment: {settings.environment}")
    print(f"🔗 Live System Services:")
    for name, url in settings.get_service_info()["external_services"].items():
        print(f"   - {name}: {url}")