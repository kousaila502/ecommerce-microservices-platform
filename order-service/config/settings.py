from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    
    # Database settings
    database_url: str = os.getenv("DATABASE_URL", "postgresql://admin:password123@localhost:5433/orderdb")
    
    # JWT settings (must match user service)
    secret_key: str = os.getenv("SECRET_KEY", "your-super-secret-jwt-key-change-in-production")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Service settings
    service_name: str = os.getenv("SERVICE_NAME", "order-service")
    service_port: int = int(os.getenv("SERVICE_PORT", "8081"))
    service_host: str = os.getenv("SERVICE_HOST", "0.0.0.0")
    
    # External services URLs
    user_service_url: str = os.getenv("USER_SERVICE_URL", "http://localhost:9090")
    cart_service_url: str = os.getenv("CART_SERVICE_URL", "http://localhost:8080")
    product_service_url: str = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:3001")
    
    # Redis settings
    redis_url: str = os.getenv("REDIS_URL", "redis://:password123@localhost:6379/0")
    
    # Environment settings
    environment: str = os.getenv("ENVIRONMENT", "development")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
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
        return self.database_url.replace("postgresql://", "postgresql+asyncpg://")
    
    def get_service_info(self) -> dict:
        """Get service information for logging/debugging"""
        return {
            "name": self.service_name,
            "port": self.service_port,
            "environment": self.environment,
            "database": self.database_url,
            "external_services": {
                "user_service": self.user_service_url,
                "cart_service": self.cart_service_url,
                "product_service": self.product_service_url
            }
        }
    
    class Config:
        """Pydantic configuration"""
        env_file = ".env"
        case_sensitive = False

# Create global settings instance
settings = Settings()

# Print settings info when module is loaded (for debugging)
if __name__ == "__main__":
    print("🚀 Order Service Settings:")
    print(f"📊 Database: {settings.database_url}")
    print(f"🔑 JWT Algorithm: {settings.algorithm}")
    print(f"🌐 Service Port: {settings.service_port}")
    print(f"🏷️  Environment: {settings.environment}")
    print(f"🔗 External Services:")
    for name, url in settings.get_service_info()["external_services"].items():
        print(f"   - {name}: {url}")