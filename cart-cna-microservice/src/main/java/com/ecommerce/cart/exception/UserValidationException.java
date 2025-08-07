package com.ecommerce.cart.exception;

/**
 * Exception thrown when user validation fails
 * This includes invalid tokens, inactive users, or user service errors
 */
public class UserValidationException extends RuntimeException {

    private String errorCode;
    private Object details;

    public UserValidationException(String message) {
        super(message);
    }

    public UserValidationException(String message, Throwable cause) {
        super(message, cause);
    }

    public UserValidationException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public UserValidationException(String message, String errorCode, Object details) {
        super(message);
        this.errorCode = errorCode;
        this.details = details;
    }

    public UserValidationException(String message, Throwable cause, String errorCode) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public Object getDetails() {
        return details;
    }

    // Common user validation error types
    public static UserValidationException invalidToken() {
        return new UserValidationException("Invalid or expired JWT token", "INVALID_TOKEN");
    }

    public static UserValidationException userNotFound(Integer userId) {
        return new UserValidationException("User not found: " + userId, "USER_NOT_FOUND", userId);
    }

    public static UserValidationException userInactive(Integer userId) {
        return new UserValidationException("User account is inactive: " + userId, "USER_INACTIVE", userId);
    }

    public static UserValidationException serviceUnavailable() {
        return new UserValidationException("User service temporarily unavailable", "SERVICE_UNAVAILABLE");
    }

    public static UserValidationException accessForbidden(Integer userId) {
        return new UserValidationException("Access forbidden for user: " + userId, "ACCESS_FORBIDDEN", userId);
    }
}