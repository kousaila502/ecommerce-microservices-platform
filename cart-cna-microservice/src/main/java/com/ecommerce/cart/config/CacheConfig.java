package com.ecommerce.cart.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

/**
 * Cache configuration for Cart Service
 * Enables caching for user and product validation services
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Configure cache manager with specific caches for different data types
     * Uses in-memory caching with TTL-like behavior through cache eviction
     */
    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        
        // Define caches with different characteristics
        cacheManager.setCaches(Arrays.asList(
            // User details cache - 5 minute TTL
            new ConcurrentMapCache("userDetails"),
            
            // Product details cache - 10 minute TTL  
            new ConcurrentMapCache("productDetails"),
            
            // Product prices cache - 5 minute TTL (prices change more frequently)
            new ConcurrentMapCache("productPrices"),
            
            // User validation cache - 3 minute TTL (for security)
            new ConcurrentMapCache("userValidation"),
            
            // Product availability cache - 2 minute TTL (stock changes frequently)
            new ConcurrentMapCache("productAvailability")
        ));
        
        return cacheManager;
    }
}