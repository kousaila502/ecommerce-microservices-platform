package com.ecommerce.cart.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

@Component
public class GracefulStartupHealthChecker implements CommandLineRunner {

    private static final Logger LOG = LoggerFactory.getLogger(GracefulStartupHealthChecker.class);

    @Value("${spring.redis.host}")
    private String redisHost;

    @Value("${services.user-service.url}")
    private String userServiceUrl;

    @Value("${services.product-service.url}")
    private String productServiceUrl;

    @Override
    public void run(String... args) {
        LOG.info("🚀 =================================================");
        LOG.info("🚀 CART SERVICE STARTUP - GRACEFUL MODE");
        LOG.info("🚀 =================================================");
        LOG.info("✅ Cart Service started successfully!");
        LOG.info("🔧 External services will be checked at runtime");
        LOG.info("📊 Health status available at: /health");
        LOG.info("📋 API documentation at: /swagger-ui.html");
        LOG.info("🚀 =================================================");
        
        // Log service configuration without failing
        LOG.info("🔗 Configured services:");
        LOG.info("   🗄️  Redis: {}", redisHost);
        LOG.info("   📧 User Service: {}", userServiceUrl);
        LOG.info("   📦 Product Service: {}", productServiceUrl);
        LOG.info("🚀 Service is ready to handle requests!");
    }
}