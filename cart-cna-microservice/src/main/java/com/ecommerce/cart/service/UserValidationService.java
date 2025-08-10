package com.ecommerce.cart.service;

import com.ecommerce.cart.client.UserServiceClient;
import com.ecommerce.cart.dto.UserResponse;
import com.ecommerce.cart.exception.UserValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for validating users with caching and business logic
 * Orchestrates UserServiceClient calls with additional validation rules
 */
@Service
public class UserValidationService {

    private static final Logger LOG = LoggerFactory.getLogger(UserValidationService.class);
    
    private final UserServiceClient userServiceClient;

    public UserValidationService(UserServiceClient userServiceClient) {
        this.userServiceClient = userServiceClient;
    }

    /**
     * Validate user from JWT token and return user details
     * This replaces the pseudo-authorization in CartController
     */
    public Mono<UserResponse> validateUserFromToken(String token) {
        LOG.debug("Validating user from JWT token");
        
        return userServiceClient.validateUser(token)
                .doOnSuccess(user -> LOG.info("User validation successful: {} ({})", user.getName(), user.getEmail()))
                .doOnError(error -> LOG.warn("User validation failed: {}", error.getMessage()));
    }

    /**
     * Check if user is active and can perform cart operations
     */
    public Mono<Boolean> isUserActiveForCart(String token) {
        return validateUserFromToken(token)
                .map(this::isUserEligibleForCart)
                .doOnSuccess(isActive -> LOG.debug("User cart eligibility check: {}", isActive))
                .onErrorReturn(false);
    }

    /**
     * Get user details with caching (5 minute cache)
     * Used for cart operations that need user info
     */
    @Cacheable(value = "userDetails", key = "#token", unless = "#result == null")
    public Mono<UserResponse> getUserDetails(String token) {
        LOG.debug("Getting user details (with caching)");
        
        return validateUserFromToken(token)
                .cache(Duration.ofMinutes(5)) // Cache successful results for 5 minutes
                .doOnSuccess(user -> LOG.debug("User details cached: {}", user.getEmail()));
    }

    /**
     * Validate user ownership of cart
     * Ensures user can only access their own cart
     */
    public Mono<Boolean> canUserAccessCart(String token, Integer cartUserId) {
        return validateUserFromToken(token)
                .map(user -> {
                    boolean canAccess = user.getId().equals(cartUserId);
                    if (!canAccess) {
                        LOG.warn("User {} attempted to access cart belonging to user {}", 
                            user.getId(), cartUserId);
                    }
                    return canAccess;
                })
                .doOnSuccess(canAccess -> LOG.debug("Cart access validation: {}", canAccess))
                .onErrorReturn(false);
    }

    /**
     * Validate admin privileges for admin operations
     */
    public Mono<Boolean> isUserAdmin(String token) {
        return validateUserFromToken(token)
                .map(UserResponse::isAdmin)
                .doOnSuccess(isAdmin -> LOG.debug("Admin privilege check: {}", isAdmin))
                .onErrorReturn(false);
    }

    /**
     * Get user ID from token for cart operations
     */
    public Mono<Integer> getUserIdFromToken(String token) {
        return validateUserFromToken(token)
                .map(UserResponse::getId)
                .doOnSuccess(userId -> LOG.debug("Extracted user ID from token: {}", userId));
    }

    /**
     * Business logic to determine if user is eligible for cart operations
     */
    private boolean isUserEligibleForCart(UserResponse user) {
        // User must be active and not blocked
        if (!user.isActive()) {
            LOG.debug("User {} is not active: {}", user.getId(), user.getStatus());
            return false;
        }
        
        // Additional business rules can be added here
        // For example: email verification requirement, account age, etc.
        
        return true;
    }

    /**
     * Validate user and throw exception if invalid
     * Used in critical cart operations where we need to fail fast
     */
    public Mono<UserResponse> validateUserOrFail(String token) {
        return validateUserFromToken(token)
                .flatMap(user -> {
                    if (!isUserEligibleForCart(user)) {
                        return Mono.error(new UserValidationException(
                            "User is not eligible for cart operations: " + user.getStatus()));
                    }
                    return Mono.just(user);
                })
                .doOnSuccess(user -> LOG.debug("User validation passed: {}", user.getEmail()));
    }

    /**
     * Batch validate multiple tokens (for admin operations)
     */
    public Mono<Boolean> areAllUsersValid(String... tokens) {
        if (tokens == null || tokens.length == 0) {
            return Mono.just(true);
        }
        
        return Mono.fromCallable(() -> {
            for (String token : tokens) {
                // For batch operations, we'll use synchronous validation
                // In production, this could be optimized with parallel calls
                try {
                    validateUserFromToken(token).block(Duration.ofSeconds(5));
                } catch (Exception e) {
                    LOG.warn("Batch validation failed for token: {}", e.getMessage());
                    return false;
                }
            }
            return true;
        })
        .doOnSuccess(allValid -> LOG.debug("Batch user validation result: {}", allValid));
    }

    /**
     * Health check for User Service connection
     * Used in startup checks and /actuator/health endpoint
     */
    public Mono<Boolean> checkUserServiceConnection() {
        LOG.info("🔍 Testing User Service connection...");
        
        // Use a dummy token for health check
        return userServiceClient.validateUser("healthcheck")
                .map(result -> {
                    LOG.info("✅ User Service: Connection successful");
                    return true;
                })
                .timeout(Duration.ofSeconds(15))
                .onErrorResume(error -> {
                    LOG.error("❌ User Service: Connection failed - {}", error.getMessage());
                    return Mono.just(false);
                });
    }

    /**
     * Detailed health check for User Service connection
     * Used in /actuator/health endpoint
     */
    public Mono<Map<String, Object>> checkUserServiceDetailed() {
        LOG.debug("🔍 Checking User Service connection...");
        
        long startTime = System.currentTimeMillis();
        
        return userServiceClient.validateUser("healthcheck")
                .map(isActive -> {
                    long responseTime = System.currentTimeMillis() - startTime;
                    
                    Map<String, Object> result = new HashMap<>();
                    result.put("healthy", true);
                    result.put("status", "UP");
                    result.put("responseTime", responseTime + "ms");
                    result.put("message", "User Service connection successful");
                    result.put("endpoint", "https://34.95.5.30.nip.io/user");
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
                    result.put("endpoint", "https://34.95.5.30.nip.io/user");
                    result.put("timestamp", LocalDateTime.now());
                    
                    LOG.error("❌ User Service: Connection failed - {}", error.getMessage());
                    return Mono.just(result);
                });
    }
}