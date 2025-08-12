package com.ecommerce.cart.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;

import com.ecommerce.cart.dto.UserResponse;
import com.ecommerce.cart.exception.ProductValidationException;
import com.ecommerce.cart.exception.UserValidationException;
import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import com.ecommerce.cart.service.CartService;
import com.ecommerce.cart.service.UserValidationService;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;

@Tag(name = "Cart Service", description = "E-commerce Cart Management API with Real External Validation")
@CrossOrigin
@RestController
@RequestMapping("/cart")
public class CartController {

    private static final Logger LOG = LoggerFactory.getLogger(CartController.class);

    @Autowired
    private CartService cartService;

    @Autowired
    private UserValidationService userValidationService;

    @Operation(
        summary = "Get service information",
        description = "Returns basic service information and available health check endpoints",
        security = {}  // No authentication required
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Service information retrieved successfully")
    })
    @RequestMapping("/")
    public Mono<ResponseEntity<String>> index() {
        String response = "{ " +
            "\"name\": \"Cart API\", " +
            "\"version\": \"3.0.0\", " +
            "\"authenticated\": true, " +
            "\"validation\": \"real\", " +
            "\"healthChecks\": { " +
                "\"basic\": \"/health\", " +
                "\"connectivity\": \"/health/connectivity\", " +
                "\"redis\": \"/health/redis\", " +
                "\"userService\": \"/health/user-service\", " +
                "\"productService\": \"/health/product-service\", " +
                "\"info\": \"/health/info\" " +
            "} " +
        "}";
        
        return Mono.just(ResponseEntity.ok(response));
    }

    /**
     * Extract JWT token from Authorization header
     */
    private String extractToken(ServerWebExchange exchange) {
        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }
        return authHeader.substring(7);
    }

    /**
     * Get all carts (admin only)
     */
    @Operation(
        summary = "Get all carts (admin only)",
        description = "Returns all carts in the system. Requires admin privileges.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Carts retrieved successfully", 
                    content = @Content(schema = @Schema(implementation = Cart.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Not an admin user"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/all")
    public Mono<ResponseEntity<Flux<Cart>>> getAllCarts(ServerWebExchange exchange) {
        try {
            String token = extractToken(exchange);
            return userValidationService.isUserAdmin(token)
                    .flatMap(isAdmin -> {
                        if (!isAdmin) {
                            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<Flux<Cart>>build());
                        }
                        
                        Flux<Cart> carts = cartService.getAllCartsForAdmin(token);
                        return Mono.just(ResponseEntity.ok(carts));
                    })
                    .onErrorResume(UserValidationException.class, error -> {
                        LOG.warn("Admin access denied: {}", error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<Flux<Cart>>build());
                    })
                    .onErrorResume(error -> {
                        LOG.error("Error in getAllCarts: {}", error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).<Flux<Cart>>build());
                    });
        } catch (Exception e) {
            LOG.warn("Authentication error in getAllCarts: {}", e.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Flux<Cart>>build());
        }
    }

    /**
     * Get user's cart - Enhanced with real user validation
     */
    @Operation(
        summary = "Get user's cart",
        description = "Retrieve cart for specific user. User must match authenticated user or be admin.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart retrieved successfully", 
                    content = @Content(schema = @Schema(implementation = Cart.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Cannot access another user's cart"),
        @ApiResponse(responseCode = "404", description = "Cart not found")
    })
    @GetMapping("/{userId}")
    public Mono<ResponseEntity<Cart>> getCart(
            @Parameter(description = "User ID", required = true, example = "123")
            @PathVariable Integer userId, 
            ServerWebExchange exchange) {
        try {
            String token = extractToken(exchange);
            
            return userValidationService.getUserIdFromToken(token)
                    .flatMap(authenticatedUserId -> {
                        if (!authenticatedUserId.equals(userId)) {
                            LOG.warn("User {} attempted to access cart for user {}", authenticatedUserId, userId);
                            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<Cart>build());
                        }

                        return cartService.getCartWithValidation(token)
                                .map(cart -> {
                                    LOG.debug("Cart retrieved for user {}: {} items", userId, cart.getItemCount());
                                    return ResponseEntity.ok(cart);
                                });
                    })
                    .onErrorResume(UserValidationException.class, error -> {
                        LOG.warn("User validation failed for getCart: {}", error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Cart>build());
                    })
                    .onErrorResume(error -> {
                        LOG.error("Error fetching cart for user {}: {}", userId, error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).<Cart>build());
                    });
        } catch (Exception e) {
            LOG.warn("Authentication error in getCart: {}", e.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Cart>build());
        }
    }

    /**
     * Add/Update entire cart - Enhanced with validation
     */
    @Operation(
        summary = "Update user's cart",
        description = "Updates the entire cart for the authenticated user. Validates user and cart contents.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart updated successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid JWT token"),
        @ApiResponse(responseCode = "403", description = "Forbidden - Cannot modify another user's cart"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("")
    public Mono<ResponseEntity<String>> updateCart(
            @Parameter(description = "Cart data to update", required = true)
            @RequestBody Mono<Cart> cartMono, 
            ServerWebExchange exchange) {
        try {
            String token = extractToken(exchange);
            
            return userValidationService.validateUserOrFail(token)
                    .flatMap(user ->
                        cartMono.flatMap(cart -> {
                            // Ensure cart belongs to authenticated user
                            if (cart.getUserId() == null) {
                                cart.setUserId(user.getId());
                            } else if (!user.getId().equals(cart.getUserId())) {
                                return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                                        .body("Cannot modify another user's cart"));
                            }

                            LOG.info("Updating cart for user: {} ({})", user.getId(), user.getEmail());

                            return cartService.saveCart(cart)
                                    .map(saved -> ResponseEntity.ok("Cart updated successfully"))
                                    .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                            .body("Failed to update cart"));
                        })
                    )
                    .onErrorResume(UserValidationException.class, error -> {
                        LOG.warn("User validation failed for updateCart: {}", error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body("User validation failed"));
                    })
                    .onErrorResume(error -> {
                        LOG.error("Error updating cart: {}", error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Failed to update cart"));
                    });
        } catch (Exception e) {
            LOG.warn("Authentication error in updateCart: {}", e.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required"));
        }
    }

    /**
     * Add single item to cart - Enhanced with product validation
     */
    @Operation(
        summary = "Add item to cart",
        description = "Add a single item to cart with product validation and stock checking",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item added successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid product or insufficient stock"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid JWT token")
    })
    @PostMapping("/items")
    public Mono<ResponseEntity<String>> addItem(
            @Parameter(description = "Product ID to add", required = true, example = "456")
            @RequestParam Integer productId,
            @Parameter(description = "Quantity to add", required = true, example = "2")
            @RequestParam int quantity,
            ServerWebExchange exchange) {
        try {
            String token = extractToken(exchange);
            
            LOG.info("Adding item to cart: product={}, quantity={}", productId, quantity);

            return cartService.addItemToCartWithValidation(token, productId, quantity)
                    .map(cart -> {
                        LOG.info("Item added successfully: product={}, user={}, cart_items={}", 
                            productId, cart.getUserId(), cart.getItemCount());
                        return ResponseEntity.ok("Item added to cart successfully");
                    })
                    .onErrorResume(UserValidationException.class, error -> {
                        LOG.warn("User validation failed for addItem: {}", error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body("User validation failed"));
                    })
                    .onErrorResume(ProductValidationException.class, error -> {
                        LOG.warn("Product validation failed for addItem: {}", error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Product validation failed: " + error.getMessage()));
                    })
                    .onErrorResume(error -> {
                        LOG.error("Error adding item to cart: product={}, error={}", productId, error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Failed to add item to cart"));
                    });
        } catch (Exception e) {
            LOG.warn("Authentication error in addItem: {}", e.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required"));
        }
    }

    /**
     * Remove item from cart - Enhanced with validation
     */
    @Operation(
        summary = "Remove item from cart",
        description = "Removes a specific item from the authenticated user's cart.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item removed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid JWT token"),
        @ApiResponse(responseCode = "404", description = "Item not found in cart"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @DeleteMapping("/items/{productId}")
    public Mono<ResponseEntity<String>> removeItem(
            @Parameter(description = "Product ID to remove", required = true, example = "456")
            @PathVariable Integer productId,
            ServerWebExchange exchange) {
        try {
            String token = extractToken(exchange);
            
            return cartService.removeItemFromCartWithValidation(token, productId)
                    .map(cart -> {
                        LOG.info("Item removed successfully: product={}, user={}", productId, cart.getUserId());
                        return ResponseEntity.ok("Item removed from cart");
                    })
                    .onErrorResume(UserValidationException.class, error -> {
                        LOG.warn("User validation failed for removeItem: {}", error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body("User validation failed"));
                    })
                    .onErrorResume(error -> {
                        LOG.error("Error removing item from cart: product={}, error={}", productId, error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("Item not found in cart"));
                    });
        } catch (Exception e) {
            LOG.warn("Authentication error in removeItem: {}", e.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required"));
        }
    }

    /**
     * Update item quantity - Enhanced with stock validation
     */
    @Operation(
        summary = "Update item quantity in cart",
        description = "Updates the quantity of a specific item in the authenticated user's cart.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Item quantity updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid quantity or stock validation failed"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid JWT token"),
        @ApiResponse(responseCode = "404", description = "Item not found in cart"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PutMapping("/items/{productId}")
    public Mono<ResponseEntity<String>> updateItemQuantity(
            @Parameter(description = "Product ID to update", required = true, example = "456")
            @PathVariable Integer productId,
            @Parameter(description = "New quantity", required = true, example = "2")
            @RequestParam int quantity,
            ServerWebExchange exchange) {
        try {
            String token = extractToken(exchange);
            
            return cartService.updateItemQuantityWithValidation(token, productId, quantity)
                    .map(cart -> {
                        LOG.info("Item quantity updated: product={}, quantity={}, user={}", 
                            productId, quantity, cart.getUserId());
                        return ResponseEntity.ok("Item quantity updated");
                    })
                    .onErrorResume(UserValidationException.class, error -> {
                        LOG.warn("User validation failed for updateItemQuantity: {}", error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body("User validation failed"));
                    })
                    .onErrorResume(ProductValidationException.class, error -> {
                        LOG.warn("Product validation failed for updateItemQuantity: {}", error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Stock validation failed: " + error.getMessage()));
                    })
                    .onErrorResume(error -> {
                        LOG.error("Error updating item quantity: product={}, error={}", productId, error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body("Item not found in cart"));
                    });
        } catch (Exception e) {
            LOG.warn("Authentication error in updateItemQuantity: {}", e.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required"));
        }
    }

    /**
     * Clear entire cart - Enhanced with validation
     */
    @Operation(
        summary = "Clear user's cart",
        description = "Removes all items from the authenticated user's cart.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart cleared successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid JWT token"),
        @ApiResponse(responseCode = "404", description = "Cart not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @DeleteMapping("")
    public Mono<ResponseEntity<String>> clearCart(ServerWebExchange exchange) {
        try {
            String token = extractToken(exchange);
            
            return cartService.clearCartWithValidation(token)
                    .map(success -> {
                        LOG.info("Cart cleared successfully: {}", success);
                        return success ? 
                            ResponseEntity.ok("Cart cleared successfully") :
                            ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cart not found");
                    })
                    .onErrorResume(UserValidationException.class, error -> {
                        LOG.warn("User validation failed for clearCart: {}", error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body("User validation failed"));
                    })
                    .onErrorResume(error -> {
                        LOG.error("Error clearing cart: {}", error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Failed to clear cart"));
                    });
        } catch (Exception e) {
            LOG.warn("Authentication error in clearCart: {}", e.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required"));
        }
    }

    /**
     * Get cart summary - Enhanced with validation
     */
    @Operation(
        summary = "Get cart summary",
        description = "Returns a summary of the authenticated user's cart including item count and total price.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart summary retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid JWT token"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/summary")
    public Mono<ResponseEntity<Object>> getCartSummary(ServerWebExchange exchange) {
        try {
            String token = extractToken(exchange);
            
            return Mono.zip(
                    cartService.getCartItemCountWithValidation(token),
                    cartService.getCartTotalWithValidation(token),
                    userValidationService.getUserDetails(token)
            )
            .map(tuple -> {
                int count = tuple.getT1();
                BigDecimal totalAmount = tuple.getT2();
                UserResponse user = tuple.getT3();
                
                return ResponseEntity.ok((Object) new Object() {
                    public final int itemCount = count;
                    public final BigDecimal total = totalAmount;
                    public final String currency = "USD";
                    public final String userEmail = user.getEmail();
                });
            })
            .onErrorResume(UserValidationException.class, error -> {
                LOG.warn("User validation failed for getCartSummary: {}", error.getMessage());
                return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Object>build());
            })
            .onErrorResume(error -> {
                LOG.error("Error getting cart summary: {}", error.getMessage());
                return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).<Object>build());
            });
        } catch (Exception e) {
            LOG.warn("Authentication error in getCartSummary: {}", e.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Object>build());
        }
    }

    /**
     * Validate cart for checkout - Enhanced with real validation
     */
    @Operation(
        summary = "Validate cart for checkout",
        description = "Validates the authenticated user's cart for checkout, including product and stock checks.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart validation result"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid JWT token"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/validate")
    public Mono<ResponseEntity<Object>> validateCart(ServerWebExchange exchange) {
        try {
            String token = extractToken(exchange);
            
            return cartService.validateCartForCheckout(token)
                    .map(validatedCart -> ResponseEntity.ok((Object) new Object() {
                        public final boolean valid = true;
                        public final String message = "Cart is valid for checkout";
                        public final int itemCount = validatedCart.getItemCount();
                        public final BigDecimal total = BigDecimal.valueOf(validatedCart.getTotal());
                    }))
                    .onErrorResume(UserValidationException.class, error -> {
                        LOG.warn("User validation failed for validateCart: {}", error.getMessage());
                        return Mono.just(ResponseEntity.ok((Object) new Object() {
                            public final boolean valid = false;
                            public final String message = "User validation failed: " + error.getMessage();
                        }));
                    })
                    .onErrorResume(ProductValidationException.class, error -> {
                        LOG.warn("Product validation failed for validateCart: {}", error.getMessage());
                        return Mono.just(ResponseEntity.ok((Object) new Object() {
                            public final boolean valid = false;
                            public final String message = "Product validation failed: " + error.getMessage();
                        }));
                    })
                    .onErrorResume(error -> {
                        LOG.error("Error validating cart: {}", error.getMessage());
                        return Mono.just(ResponseEntity.ok((Object) new Object() {
                            public final boolean valid = false;
                            public final String message = "Cart validation failed: " + error.getMessage();
                        }));
                    });
        } catch (Exception e) {
            LOG.warn("Authentication error in validateCart: {}", e.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Object>build());
        }
    }

    /**
     * Refresh cart with current product data
     */
    @Operation(
        summary = "Refresh cart with current product data",
        description = "Refreshes the authenticated user's cart, updating items with the latest product information.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart refreshed successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid JWT token"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/refresh")
    public Mono<ResponseEntity<String>> refreshCart(ServerWebExchange exchange) {
        try {
            String token = extractToken(exchange);
            
            return cartService.refreshCartWithValidation(token)
                    .map(cart -> {
                        LOG.info("Cart refreshed: {} items remain valid", cart.getItemCount());
                        return ResponseEntity.ok("Cart refreshed with current product data");
                    })
                    .onErrorResume(UserValidationException.class, error -> {
                        LOG.warn("User validation failed for refreshCart: {}", error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body("User validation failed"));
                    })
                    .onErrorResume(error -> {
                        LOG.error("Error refreshing cart: {}", error.getMessage());
                        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Failed to refresh cart"));
                    });
        } catch (Exception e) {
            LOG.warn("Authentication error in refreshCart: {}", e.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication required"));
        }
    }

    /**
     * Legacy endpoint for backward compatibility with path parameter
     */
    @Operation(
        summary = "Get cart summary (legacy)",
        description = "Legacy endpoint for backward compatibility. Returns cart summary for authenticated user.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart summary retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid JWT token")
    })
    @GetMapping("/{userId}/summary")
    public Mono<ResponseEntity<Object>> getCartSummaryLegacy(
            @Parameter(description = "User ID (for compatibility only)", required = true, example = "123")
            @PathVariable Integer userId, 
            ServerWebExchange exchange) {
        return getCartSummary(exchange);
    }

    /**
     * Legacy endpoint for backward compatibility with path parameter
     */
    @Operation(
        summary = "Validate cart for checkout (legacy)",
        description = "Legacy endpoint for backward compatibility. Validates cart for authenticated user.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cart validation result"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid JWT token")
    })
    @GetMapping("/{userId}/validate")
    public Mono<ResponseEntity<Object>> validateCartLegacy(
            @Parameter(description = "User ID (for compatibility only)", required = true, example = "123")
            @PathVariable Integer userId, 
            ServerWebExchange exchange) {
        return validateCart(exchange);
    }
}