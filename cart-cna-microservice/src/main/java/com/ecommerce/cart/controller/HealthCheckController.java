package com.ecommerce.cart.controller;

import com.ecommerce.cart.client.ProductServiceClient;
import com.ecommerce.cart.client.UserServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthCheckController {

    private static final Logger LOG = LoggerFactory.getLogger(HealthCheckController.class);

    @Autowired
    @Qualifier("reactiveStringRedisTemplate")
    private ReactiveStringRedisTemplate redisTemplate;

    @Autowired
    private UserServiceClient userServiceClient;

    @Autowired
    private ProductServiceClient productServiceClient;

    // Add these @Value annotations to inject configuration properties
    @Value("${spring.redis.host}")
    private String redisHost;

    @Value("${spring.redis.port}")
    private int redisPort;

    @Value("${services.user-service.url}")
    private String userServiceUrl;

    @Value("${services.product-service.url}")
    private String productServiceUrl;

    /**
     * Basic health check endpoint
     */
    @GetMapping("")
    public Mono<ResponseEntity<Map<String, Object>>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Cart Service");
        health.put("timestamp", LocalDateTime.now());
        health.put("version", "3.0.0");
        
        return Mono.just(ResponseEntity.ok(health));
    }

    /**
     * Comprehensive connectivity check for all dependencies
     */
    @GetMapping("/connectivity")
    public Mono<ResponseEntity<Map<String, Object>>> checkConnectivity() {
        LOG.info("🔍 Starting comprehensive connectivity check...");
        
        return Mono.zip(
                checkRedisConnection(),
                checkUserServiceConnection(),
                checkProductServiceConnection()
        )
        .map(tuple -> {
            Map<String, Object> redisResult = tuple.getT1();
            Map<String, Object> userServiceResult = tuple.getT2();
            Map<String, Object> productServiceResult = tuple.getT3();
            
            Map<String, Object> result = new HashMap<>();
            result.put("timestamp", LocalDateTime.now());
            result.put("service", "Cart Service");
            result.put("version", "3.0.0");
            
            // Aggregate results
            Map<String, Object> dependencies = new HashMap<>();
            dependencies.put("redis", redisResult);
            dependencies.put("userService", userServiceResult);
            dependencies.put("productService", productServiceResult);
            result.put("dependencies", dependencies);
            
            // Overall status
            boolean allHealthy = (boolean) redisResult.get("healthy") && 
                               (boolean) userServiceResult.get("healthy") && 
                               (boolean) productServiceResult.get("healthy");
            
            result.put("status", allHealthy ? "UP" : "DEGRADED");
            result.put("healthy", allHealthy);
            
            if (allHealthy) {
                LOG.info("✅ All connectivity checks passed!");
            } else {
                LOG.warn("⚠️ Some connectivity checks failed!");
            }
            
            return ResponseEntity.ok(result);
        })
        .onErrorResume(error -> {
            LOG.error("❌ Connectivity check failed: {}", error.getMessage());
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("status", "DOWN");
            errorResult.put("error", error.getMessage());
            errorResult.put("timestamp", LocalDateTime.now());
            return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResult));
        });
    }

    /**
     * Check Redis database connection
     */
    @GetMapping("/redis")
    public Mono<ResponseEntity<Map<String, Object>>> checkRedis() {
        return checkRedisConnection()
                .map(result -> {
                    boolean healthy = (boolean) result.get("healthy");
                    return ResponseEntity.status(healthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
                            .body(result);
                });
    }

    /**
     * Check User Service connection
     */
    @GetMapping("/user-service")
    public Mono<ResponseEntity<Map<String, Object>>> checkUserService() {
        return checkUserServiceConnection()
                .map(result -> {
                    boolean healthy = (boolean) result.get("healthy");
                    return ResponseEntity.status(healthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
                            .body(result);
                });
    }

    /**
     * Check Product Service connection
     */
    @GetMapping("/product-service")
    public Mono<ResponseEntity<Map<String, Object>>> checkProductService() {
        return checkProductServiceConnection()
                .map(result -> {
                    boolean healthy = (boolean) result.get("healthy");
                    return ResponseEntity.status(healthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
                            .body(result);
                });
    }

    /**
     * Internal method to check Redis connection
     */
    private Mono<Map<String, Object>> checkRedisConnection() {
        LOG.debug("🔍 Checking Redis connection...");
        
        long startTime = System.currentTimeMillis();
        
        return redisTemplate.opsForValue()
                .set("health:check", "test")
                .then(redisTemplate.opsForValue().get("health:check"))
                .then(redisTemplate.delete("health:check"))
                .map(deleted -> {
                    long responseTime = System.currentTimeMillis() - startTime;
                    
                    Map<String, Object> result = new HashMap<>();
                    result.put("healthy", true);
                    result.put("status", "UP");
                    result.put("responseTime", responseTime + "ms");
                    result.put("message", "Redis connection successful");
                    result.put("timestamp", LocalDateTime.now());
                    
                    LOG.info("✅ Redis: Connected successfully ({}ms)", responseTime);
                    return result;
                })
                .timeout(Duration.ofSeconds(5))
                .onErrorResume(error -> {
                    long responseTime = System.currentTimeMillis() - startTime;
                    
                    Map<String, Object> result = new HashMap<>();
                    result.put("healthy", false);
                    result.put("status", "DOWN");
                    result.put("responseTime", responseTime + "ms");
                    result.put("error", error.getMessage());
                    result.put("timestamp", LocalDateTime.now());
                    
                    LOG.error("❌ Redis: Connection failed - {}", error.getMessage());
                    return Mono.just(result);
                });
    }

    /**
     * Internal method to check User Service connection
     */
    private Mono<Map<String, Object>> checkUserServiceConnection() {
        LOG.debug("🔍 Checking User Service connection...");
        
        long startTime = System.currentTimeMillis();
        
        // Try to make a simple request to check connectivity
        return userServiceClient.isUserActiveAndValid("healthcheck-token") // Test with a simple check
                .map(isActive -> {
                    long responseTime = System.currentTimeMillis() - startTime;
                    
                    Map<String, Object> result = new HashMap<>();
                    result.put("healthy", true);
                    result.put("status", "UP");
                    result.put("responseTime", responseTime + "ms");
                    result.put("message", "User Service connection successful");
                    result.put("endpoint", userServiceUrl);  // Use injected value
                    result.put("timestamp", LocalDateTime.now());
                    
                    LOG.info("✅ User Service: Connected successfully ({}ms)", responseTime);
                    return result;
                })
                .timeout(Duration.ofSeconds(10))
                .onErrorResume(error -> {
                    long responseTime = System.currentTimeMillis() - startTime;
                    
                    Map<String, Object> result = new HashMap<>();
                    result.put("healthy", false);
                    result.put("status", "DOWN");
                    result.put("responseTime", responseTime + "ms");
                    result.put("error", error.getMessage());
                    result.put("endpoint", userServiceUrl);  // Use injected value
                    result.put("timestamp", LocalDateTime.now());
                    
                    LOG.error("❌ User Service: Connection failed - {}", error.getMessage());
                    return Mono.just(result);
                });
    }

    /**
     * Internal method to check Product Service connection
     */
    private Mono<Map<String, Object>> checkProductServiceConnection() {
        LOG.debug("🔍 Checking Product Service connection...");
        
        long startTime = System.currentTimeMillis();
        
        // Try to make a simple request to check connectivity
        return productServiceClient.isProductValid(1) // Test with a simple product check
                .map(isValid -> {
                    long responseTime = System.currentTimeMillis() - startTime;
                    
                    Map<String, Object> result = new HashMap<>();
                    result.put("healthy", true);
                    result.put("status", "UP");
                    result.put("responseTime", responseTime + "ms");
                    result.put("message", "Product Service connection successful");
                    result.put("endpoint", productServiceUrl);  // Use injected value
                    result.put("timestamp", LocalDateTime.now());
                    
                    LOG.info("✅ Product Service: Connected successfully ({}ms)", responseTime);
                    return result;
                })
                .timeout(Duration.ofSeconds(10))
                .onErrorResume(error -> {
                    long responseTime = System.currentTimeMillis() - startTime;
                    
                    Map<String, Object> result = new HashMap<>();
                    result.put("healthy", false);
                    result.put("status", "DOWN");
                    result.put("responseTime", responseTime + "ms");
                    result.put("error", error.getMessage());
                    result.put("endpoint", productServiceUrl);  // Use injected value
                    result.put("timestamp", LocalDateTime.now());
                    
                    LOG.error("❌ Product Service: Connection failed - {}", error.getMessage());
                    return Mono.just(result);
                });
    }

    /**
     * Get detailed service information
     */
    @GetMapping("/info")
    public Mono<ResponseEntity<Map<String, Object>>> getServiceInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("service", "Cart Service");
        info.put("version", "3.0.0");
        info.put("description", "E-commerce Cart Service with real external validation");
        info.put("timestamp", LocalDateTime.now());
        
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("userService", userServiceUrl);      // Use injected value - secure
        endpoints.put("productService", productServiceUrl); // Use injected value - secure
        endpoints.put("redis", redisHost + ":" + redisPort); // Use injected values - secure
        info.put("externalServices", endpoints);
        
        Map<String, String> features = new HashMap<>();
        features.put("authentication", "Real JWT validation via User Service");
        features.put("productValidation", "Real stock and availability checking");
        features.put("caching", "Redis-based caching with TTL");
        features.put("storage", "Redis cart persistence");
        info.put("features", features);
        
        return Mono.just(ResponseEntity.ok(info));
    }
}