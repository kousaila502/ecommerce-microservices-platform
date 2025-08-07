package com.ecommerce.cart.client;

import com.ecommerce.cart.dto.UserResponse;
import com.ecommerce.cart.exception.UserValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;

@Component
public class UserServiceClient {

    private static final Logger LOG = LoggerFactory.getLogger(UserServiceClient.class);
    
    private final WebClient userServiceWebClient;

    public UserServiceClient(@Qualifier("userServiceWebClient") WebClient userServiceWebClient) {
        this.userServiceWebClient = userServiceWebClient;
    }

    /**
     * Validate user by calling /auth/me endpoint with JWT token
     * This endpoint validates token, checks expiration, and returns user details
     */
    public Mono<UserResponse> validateUser(String token) {
        LOG.debug("Validating user with User Service");
        
        return userServiceWebClient
                .get()
                .uri("/auth/me")
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .onStatus(HttpStatus.UNAUTHORIZED::equals, 
                    response -> Mono.error(new UserValidationException("Invalid or expired token")))
                .onStatus(HttpStatus.FORBIDDEN::equals,
                    response -> Mono.error(new UserValidationException("User access forbidden")))
                .onStatus(HttpStatus.NOT_FOUND::equals,
                    response -> Mono.error(new UserValidationException("User not found")))
                .onStatus(HttpStatus::is5xxServerError,
                    response -> Mono.error(new UserValidationException("User service temporarily unavailable")))
                .bodyToMono(UserResponse.class)
                .doOnSuccess(user -> LOG.debug("User validation successful for user ID: {}", user.getId()))
                .doOnError(error -> LOG.warn("User validation failed: {}", error.getMessage()))
                .retryWhen(Retry.backoff(3, Duration.ofMillis(500))
                    .filter(this::isRetryableException)
                    .doBeforeRetry(retrySignal -> 
                        LOG.warn("Retrying user validation, attempt: {}", retrySignal.totalRetries() + 1)))
                .onErrorMap(WebClientResponseException.class, this::mapWebClientException)
                .timeout(Duration.ofSeconds(8))
                .onErrorMap(java.util.concurrent.TimeoutException.class,
                    ex -> new UserValidationException("User service request timed out"));
    }

    /**
     * Check if user exists and is active (simplified validation)
     * Uses the same /auth/me endpoint but focuses on active status
     */
    public Mono<Boolean> isUserActiveAndValid(String token) {
        return validateUser(token)
                .map(user -> "active".equalsIgnoreCase(user.getStatus()) && user.getId() != null)
                .doOnSuccess(isActive -> LOG.debug("User active status: {}", isActive))
                .onErrorReturn(false);
    }

    /**
     * Get user ID from validated user response
     */
    public Mono<Integer> getUserIdFromValidation(String token) {
        return validateUser(token)
                .map(UserResponse::getId)
                .doOnSuccess(userId -> LOG.debug("Extracted user ID: {}", userId));
    }

    /**
     * Determine if an exception is retryable
     */
    private boolean isRetryableException(Throwable throwable) {
        if (throwable instanceof WebClientResponseException) {
            WebClientResponseException ex = (WebClientResponseException) throwable;
            // Retry on 5xx errors and connection issues, but not on 4xx client errors
            return ex.getStatusCode().is5xxServerError() || 
                   ex.getStatusCode() == HttpStatus.REQUEST_TIMEOUT;
        }
        // Retry on connection issues
        return throwable instanceof java.net.ConnectException ||
               throwable instanceof java.io.IOException;
    }

    /**
     * Map WebClient exceptions to domain-specific exceptions
     */
    private UserValidationException mapWebClientException(WebClientResponseException ex) {
        HttpStatus status = ex.getStatusCode();
        String message = switch (status.value()) {
            case 400 -> "Invalid request to user service";
            case 401 -> "Invalid or expired token";
            case 403 -> "User access forbidden";
            case 404 -> "User not found";
            case 429 -> "User service rate limit exceeded";
            case 500 -> "User service internal error";
            case 503 -> "User service temporarily unavailable";
            default -> "User service error: " + status.getReasonPhrase();
        };
        
        LOG.error("User service error - Status: {}, Message: {}", status.value(), message);
        return new UserValidationException(message);
    }
}