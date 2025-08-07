package com.ecommerce.cart.config;

import com.ecommerce.cart.client.ProductServiceClient;
import com.ecommerce.cart.client.UserServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class StartupHealthChecker implements CommandLineRunner {

    private static final Logger LOG = LoggerFactory.getLogger(StartupHealthChecker.class);

    @Autowired
    @Qualifier("reactiveStringRedisTemplate")
    private ReactiveStringRedisTemplate redisTemplate;

    @Autowired
    private UserServiceClient userServiceClient;

    @Autowired
    private ProductServiceClient productServiceClient;

    @Value("${services.user-service.url}")
    private String userServiceUrl;

    @Value("${services.product-service.url}")
    private String productServiceUrl;

    @Value("${spring.redis.host}")
    private String redisHost;

    @Value("${spring.redis.port}")
    private int redisPort;

    @Override
    public void run(String... args) {
        LOG.info("🚀 =================================================");
        LOG.info("🚀 CART SERVICE STARTUP - CONNECTIVITY CHECKS");
        LOG.info("🚀 =================================================");
        LOG.info("🕐 Startup Time: {}", LocalDateTime.now());
        LOG.info("📋 Service: Cart Service v3.0.0");
        LOG.info("🔗 External Services Configuration:");
        LOG.info("   📧 User Service: {}", userServiceUrl);
        LOG.info("   📦 Product Service: {}", productServiceUrl);
        LOG.info("   🗄️  Redis Database: {}:{}", redisHost, redisPort);
        LOG.info("🚀 =================================================");

        // Run connectivity checks
        runStartupConnectivityChecks();
    }

    private void runStartupConnectivityChecks() {
        LOG.info("🔍 Starting startup connectivity checks...");

        // Check all connections in parallel
        Mono.zip(
                checkRedisStartup(),
                checkUserServiceStartup(),
                checkProductServiceStartup()
        )
        .subscribe(
            tuple -> {
                boolean redisHealthy = tuple.getT1();
                boolean userServiceHealthy = tuple.getT2();
                boolean productServiceHealthy = tuple.getT3();

                LOG.info("🚀 =================================================");
                LOG.info("📊 STARTUP CONNECTIVITY RESULTS:");
                LOG.info("   🗄️  Redis Database: {}", redisHealthy ? "✅ CONNECTED" : "❌ FAILED");
                LOG.info("   📧 User Service: {}", userServiceHealthy ? "✅ CONNECTED" : "❌ FAILED");
                LOG.info("   📦 Product Service: {}", productServiceHealthy ? "✅ CONNECTED" : "❌ FAILED");

                boolean allHealthy = redisHealthy && userServiceHealthy && productServiceHealthy;
                
                if (allHealthy) {
                    LOG.info("🎉 ALL CONNECTIONS SUCCESSFUL!");
                    LOG.info("✅ Cart Service is ready to handle requests");
                } else {
                    LOG.warn("⚠️  SOME CONNECTIONS FAILED!");
                    LOG.warn("🔧 Service may operate in degraded mode");
                    LOG.warn("💡 Check network connectivity and service availability");
                }

                LOG.info("🚀 =================================================");
                LOG.info("🌐 Health Check Endpoints Available:");
                LOG.info("   📊 Basic Health: GET /health");
                LOG.info("   🔍 Full Connectivity: GET /health/connectivity");
                LOG.info("   🗄️  Redis Only: GET /health/redis");
                LOG.info("   📧 User Service Only: GET /health/user-service");
                LOG.info("   📦 Product Service Only: GET /health/product-service");
                LOG.info("   📋 Service Info: GET /health/info");
                LOG.info("🚀 =================================================");
                LOG.info("🎯 Cart Service startup completed!");
            },
            error -> {
                LOG.error("❌ Startup connectivity checks failed: {}", error.getMessage());
                LOG.error("🔧 Service may not function properly");
            }
        );
    }

    private Mono<Boolean> checkRedisStartup() {
        LOG.info("🔍 Testing Redis connection...");
        
        return redisTemplate.opsForValue()
                .set("startup:health:check", "test")
                .then(redisTemplate.opsForValue().get("startup:health:check"))
                .then(redisTemplate.delete("startup:health:check"))
                .map(deleted -> {
                    LOG.info("✅ Redis: Connection successful");
                    return true;
                })
                .timeout(Duration.ofSeconds(10))
                .onErrorResume(error -> {
                    LOG.error("❌ Redis: Connection failed - {}", error.getMessage());
                    return Mono.just(false);
                });
    }

    private Mono<Boolean> checkUserServiceStartup() {
        LOG.info("🔍 Testing User Service connection...");
        
        // Use a dummy token for health check
        return userServiceClient.isUserActiveAndValid("healthcheck-token")
                .map(result -> {
                    LOG.info("✅ User Service: Connection successful");
                    return true;
                })
                .timeout(Duration.ofSeconds(15))
                .onErrorResume(error -> {
                    LOG.error("❌ User Service: Connection failed - {}", error.getMessage());
                    LOG.error("   🔧 Check if User Service is running at: {}", userServiceUrl);
                    return Mono.just(false);
                });
    }

    private Mono<Boolean> checkProductServiceStartup() {
        LOG.info("🔍 Testing Product Service connection...");
        
        return productServiceClient.isProductValid(1)
                .map(result -> {
                    LOG.info("✅ Product Service: Connection successful");
                    return true;
                })
                .timeout(Duration.ofSeconds(15))
                .onErrorResume(error -> {
                    LOG.error("❌ Product Service: Connection failed - {}", error.getMessage());
                    LOG.error("   🔧 Check if Product Service is running at: {}", productServiceUrl);
                    return Mono.just(false);
                });
    }
}