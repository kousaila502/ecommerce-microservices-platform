package com.ecommerce.cart.exception;

/**
 * Exception thrown when external services are unavailable or unreachable
 * This includes network issues, service downtime, or timeout scenarios
 */
public class ServiceUnavailableException extends RuntimeException {

    private final String serviceName;
    private final String errorCode;
    private final Object details;

    public ServiceUnavailableException(String serviceName, String message) {
        super(message);
        this.serviceName = serviceName;
        this.errorCode = "SERVICE_UNAVAILABLE";
        this.details = null;
    }

    public ServiceUnavailableException(String serviceName, String message, Throwable cause) {
        super(message, cause);
        this.serviceName = serviceName;
        this.errorCode = "SERVICE_UNAVAILABLE";
        this.details = null;
    }

    public ServiceUnavailableException(String serviceName, String message, String errorCode) {
        super(message);
        this.serviceName = serviceName;
        this.errorCode = errorCode;
        this.details = null;
    }

    public ServiceUnavailableException(String serviceName, String message, String errorCode, Object details) {
        super(message);
        this.serviceName = serviceName;
        this.errorCode = errorCode;
        this.details = details;
    }

    public ServiceUnavailableException(String serviceName, String message, Throwable cause, String errorCode, Object details) {
        super(message, cause);
        this.serviceName = serviceName;
        this.errorCode = errorCode;
        this.details = details;
    }

    // Getters
    public String getServiceName() {
        return serviceName;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Object getDetails() {
        return details;
    }

    // Static factory methods for common scenarios
    public static ServiceUnavailableException timeout(String serviceName) {
        return new ServiceUnavailableException(serviceName, 
            "Service request timed out: " + serviceName, "TIMEOUT");
    }

    public static ServiceUnavailableException connectionFailed(String serviceName) {
        return new ServiceUnavailableException(serviceName, 
            "Failed to connect to service: " + serviceName, "CONNECTION_FAILED");
    }

    public static ServiceUnavailableException serviceDown(String serviceName) {
        return new ServiceUnavailableException(serviceName, 
            "Service is currently unavailable: " + serviceName, "SERVICE_DOWN");
    }

    public static ServiceUnavailableException rateLimitExceeded(String serviceName) {
        return new ServiceUnavailableException(serviceName, 
            "Rate limit exceeded for service: " + serviceName, "RATE_LIMIT_EXCEEDED");
    }

    public static ServiceUnavailableException circuitBreakerOpen(String serviceName) {
        return new ServiceUnavailableException(serviceName, 
            "Circuit breaker is open for service: " + serviceName, "CIRCUIT_BREAKER_OPEN");
    }

    @Override
    public String toString() {
        return "ServiceUnavailableException{" +
                "serviceName='" + serviceName + '\'' +
                ", errorCode='" + errorCode + '\'' +
                ", message='" + getMessage() + '\'' +
                ", details=" + details +
                '}';
    }
}