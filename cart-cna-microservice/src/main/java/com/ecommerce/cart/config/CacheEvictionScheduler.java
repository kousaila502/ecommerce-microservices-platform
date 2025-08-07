package com.ecommerce.cart.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled cache eviction to simulate TTL behavior
 * Since we're using simple in-memory cache, we need manual eviction
 */
@Component
@EnableScheduling
public class CacheEvictionScheduler {

    private static final Logger LOG = LoggerFactory.getLogger(CacheEvictionScheduler.class);
    
    private final CacheManager cacheManager;

    public CacheEvictionScheduler(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    /**
     * Clear user validation cache every 3 minutes
     * Security-sensitive data should have shorter TTL
     */
    @Scheduled(fixedRate = 180000) // 3 minutes
    public void evictUserValidationCache() {
        var cache = cacheManager.getCache("userValidation");
        if (cache != null) {
            cache.clear();
            LOG.debug("Evicted userValidation cache");
        }
    }

    /**
     * Clear product availability cache every 2 minutes
     * Stock levels change frequently
     */
    @Scheduled(fixedRate = 120000) // 2 minutes
    public void evictProductAvailabilityCache() {
        var cache = cacheManager.getCache("productAvailability");
        if (cache != null) {
            cache.clear();
            LOG.debug("Evicted productAvailability cache");
        }
    }

    /**
     * Clear user details cache every 5 minutes
     * User data changes less frequently
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void evictUserDetailsCache() {
        var cache = cacheManager.getCache("userDetails");
        if (cache != null) {
            cache.clear();
            LOG.debug("Evicted userDetails cache");
        }
    }

    /**
     * Clear product prices cache every 5 minutes
     * Prices can change but not as frequently as stock
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void evictProductPricesCache() {
        var cache = cacheManager.getCache("productPrices");
        if (cache != null) {
            cache.clear();
            LOG.debug("Evicted productPrices cache");
        }
    }

    /**
     * Clear product details cache every 10 minutes
     * Product information changes least frequently
     */
    @Scheduled(fixedRate = 600000) // 10 minutes
    public void evictProductDetailsCache() {
        var cache = cacheManager.getCache("productDetails");
        if (cache != null) {
            cache.clear();
            LOG.debug("Evicted productDetails cache");
        }
    }

    /**
     * Emergency cache clear - manually triggered if needed
     */
    public void clearAllCaches() {
        cacheManager.getCacheNames().forEach(cacheName -> {
            var cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                LOG.info("Manually cleared cache: {}", cacheName);
            }
        });
    }
}