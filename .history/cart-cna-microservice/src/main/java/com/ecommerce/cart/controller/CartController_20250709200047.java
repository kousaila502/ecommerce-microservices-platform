package com.ecommerce.cart.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;

import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import com.ecommerce.cart.service.JwtAuthService;
import com.ecommerce.cart.service.CartService;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@CrossOrigin
@RestController
@RequestMapping("/cart")
public class CartController {

    private static final Logger LOG = LoggerFactory.getLogger(CartController.class);

    @Autowired
    private JwtAuthService jwtAuthService;
    
    @Autowired
    private CartService cartService;

    @RequestMapping("/")
    public Mono<ResponseEntity<String>> index() {
        return Mono.just(ResponseEntity.ok("{ \"name\": \"Cart API\", \"version\": \"2.0.0\", \"authenticated\": true }"));
    }

    // Extract user ID from JWT token (CHANGED: returns Integer instead of Long)
    private Mono<Integer> getUserIdFromToken(ServerWebExchange exchange) {
        return Mono.fromCallable(() -> {
            String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new RuntimeException("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);
            if (!jwtAuthService.validateToken(token)) {
                throw new RuntimeException("Invalid or expired token");
            }

            String userIdStr = jwtAuthService.getUserIdFromToken(token);
            return Integer.parseInt(userIdStr);  // CHANGED: Integer.parseInt instead of Long.parseLong
        });
    }

    // Get all carts (admin only - for debugging)
    @GetMapping("/all")
    public Mono<ResponseEntity<Flux<Cart>>> getAllCarts(ServerWebExchange exchange) {
        return getUserIdFromToken(exchange)
                .flatMap(userId -> {
                    // In a real implementation, check if user is admin
                    Flux<Cart> carts = cartService.getAllCarts();
                    return Mono.just(ResponseEntity.ok(carts));
                })
                .onErrorReturn(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    // Get user's cart - THIS IS THE MAIN ENDPOINT ORDER SERVICE CALLS
    @GetMapping("/{userId}")
    public Mono<ResponseEntity<Cart>> getCart(@PathVariable Integer userId, ServerWebExchange exchange) {  // CHANGED: Integer userId
        return getUserIdFromToken(exchange)
                .flatMap(authenticatedUserId -> {
                    if (!authenticatedUserId.equals(userId)) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<Cart>build());
                    }

                    return cartService.getCart(userId)
                            .map(ResponseEntity::ok)
                            .onErrorResume(error -> {
                                LOG.error("Error fetching cart for user {}: {}", userId, error.getMessage());
                                return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).<Cart>build());
                            });
                })
                .onErrorResume(error -> {
                    LOG.warn("Unauthorized access attempt: {}", error.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Cart>build());
                });
    }

    // Add/Update entire cart
    @PostMapping("")
    public Mono<ResponseEntity<String>> updateCart(@RequestBody Mono<Cart> cartMono, ServerWebExchange exchange) {     
        return getUserIdFromToken(exchange)
                .flatMap(authenticatedUserId ->
                    cartMono.flatMap(cart -> {
                        // Ensure cart belongs to authenticated user
                        if (cart.getUserId() == null) {
                            cart.setUserId(authenticatedUserId);
                        } else if (!authenticatedUserId.equals(cart.getUserId())) {
                            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                                    .body("Cannot modify another user's cart"));
                        }

                        LOG.info("Updating cart for user: {}", authenticatedUserId);

                        return cartService.updateCart(cart)
                                .map(updatedCart -> ResponseEntity.ok("Cart updated successfully"))
                                .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("Failed to update cart"));
                    })
                )
                .onErrorReturn(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required"));
    }

    // Add single item to cart
    @PostMapping("/{userId}/items")
    public Mono<ResponseEntity<String>> addItem(@PathVariable Integer userId,  // CHANGED: Integer userId
                                              @RequestBody CartItem item,
                                              ServerWebExchange exchange) {
        return getUserIdFromToken(exchange)
                .flatMap(authenticatedUserId -> {
                    if (!authenticatedUserId.equals(userId)) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body("Cannot modify another user's cart"));
                    }

                    LOG.info("Adding item to cart for user: {}, product: {}", userId, item.getProductId());

                    return cartService.addItemToCart(userId, item)
                            .map(cart -> ResponseEntity.ok("Item added to cart successfully"))
                            .onErrorReturn(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body("Failed to add item to cart"));
                })
                .onErrorReturn(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required"));
    }

    // Remove item from cart
    @DeleteMapping("/{userId}/items/{productId}")
    public Mono<ResponseEntity<String>> removeItem(@PathVariable Integer userId,  // CHANGED: Integer userId
                                                  @PathVariable Integer productId,
                                                  ServerWebExchange exchange) {
        return getUserIdFromToken(exchange)
                .flatMap(authenticatedUserId -> {
                    if (!authenticatedUserId.equals(userId)) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body("Cannot modify another user's cart"));
                    }

                    return cartService.removeItemFromCart(userId, productId)
                            .map(cart -> ResponseEntity.ok("Item removed from cart"))
                            .onErrorReturn(ResponseEntity.status(HttpStatus.NOT_FOUND)
                                    .body("Item not found in cart"));
                })
                .onErrorReturn(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required"));
    }

    // Update item quantity
    @PutMapping("/{userId}/items/{productId}")
    public Mono<ResponseEntity<String>> updateItemQuantity(@PathVariable Integer userId,  // CHANGED: Integer userId
                                                          @PathVariable Integer productId,
                                                          @RequestParam int quantity,
                                                          ServerWebExchange exchange) {
        return getUserIdFromToken(exchange)
                .flatMap(authenticatedUserId -> {
                    if (!authenticatedUserId.equals(userId)) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body("Cannot modify another user's cart"));
                    }

                    return cartService.updateItemQuantity(userId, productId, quantity)
                            .map(cart -> ResponseEntity.ok("Item quantity updated"))
                            .onErrorReturn(ResponseEntity.status(HttpStatus.NOT_FOUND)
                                    .body("Item not found in cart"));
                })
                .onErrorReturn(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required"));
    }

    // Clear entire cart - THIS IS CALLED BY ORDER SERVICE AFTER ORDER CREATION
    @DeleteMapping("/{userId}")
    public Mono<ResponseEntity<String>> clearCart(@PathVariable Integer userId, ServerWebExchange exchange) {  // CHANGED: Integer userId
        return getUserIdFromToken(exchange)
                .flatMap(authenticatedUserId -> {
                    if (!authenticatedUserId.equals(userId)) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body("Cannot modify another user's cart"));
                    }

                    LOG.info("Clearing cart for user: {}", userId);

                    return cartService.clearCart(userId)
                            .map(success -> success ? 
                                ResponseEntity.ok("Cart cleared successfully") :
                                ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cart not found"))
                            .onErrorReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                    .body("Failed to clear cart"));
                })
                .onErrorReturn(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required"));
    }

    // Get cart summary (item count and total)
    @GetMapping("/{userId}/summary")
    public Mono<ResponseEntity<Object>> getCartSummary(@PathVariable Integer userId, ServerWebExchange exchange) {  // CHANGED: Integer userId
        return getUserIdFromToken(exchange)
                .flatMap(authenticatedUserId -> {
                    if (!authenticatedUserId.equals(userId)) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<Object>build());
                    }

                    return cartService.getCart(userId)
                            .map(cart -> ResponseEntity.ok((Object) new Object() {
                                public final int itemCount = cart.getItemCount();
                                public final float total = cart.getTotal();
                                public final String currency = cart.getCurrency();
                            }))
                            .onErrorResume(error ->
                                    Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).<Object>build()));
                })
                .onErrorResume(error ->
                        Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Object>build()));
    }

    // Validate cart (for checkout)
    @GetMapping("/{userId}/validate")
    public Mono<ResponseEntity<Object>> validateCart(@PathVariable Integer userId, ServerWebExchange exchange) {  // CHANGED: Integer userId
        return getUserIdFromToken(exchange)
                .flatMap(authenticatedUserId -> {
                    if (!authenticatedUserId.equals(userId)) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).<Object>build());
                    }

                    return cartService.validateCart(userId)
                            .map(isValid -> ResponseEntity.ok((Object) new Object() {
                                public final boolean valid = isValid;
                                public final String message = isValid ? "Cart is valid" : "Cart is empty or contains invalid items";
                            }))
                            .onErrorResume(error ->
                                    Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).<Object>build()));
                })
                .onErrorResume(error ->
                        Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).<Object>build()));
    }
}