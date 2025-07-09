package com.ecommerce.cart.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.core.ReactiveValueOperations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ServerWebExchange;

import com.ecommerce.cart.model.Cart;
import com.ecommerce.cart.model.CartItem;
import com.ecommerce.cart.service.JwtAuthService;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;

@CrossOrigin
@RestController
public class CartController {

    private static final Logger LOG = LoggerFactory.getLogger(CartController.class);

    private ReactiveRedisTemplate<String, Cart> redisTemplate;
    private ReactiveValueOperations<String, Cart> cartOps;
    
    @Autowired
    private JwtAuthService jwtAuthService;

    CartController(ReactiveRedisTemplate<String, Cart> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.cartOps = this.redisTemplate.opsForValue();
    }

    @RequestMapping("/")
    public String index() {
        return "{ \"name\": \"Cart API\", \"version\": \"1.0.0\", \"authenticated\": true }";
    }

    // Extract user ID from JWT token
    private Mono<Long> getUserIdFromToken(ServerWebExchange exchange) {
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
            return Long.parseLong(userIdStr);
        });
    }

    // Get all carts (admin only - for debugging)
    @GetMapping("/cart")
    public Flux<Cart> list() {
        return redisTemplate.keys("cart:*")
                .flatMap(cartOps::get);
    }

    // Get user's cart
    @GetMapping("/cart/{userId}")
    public Mono<ResponseEntity<Cart>> findById(@PathVariable Long userId, ServerWebExchange exchange) {
        return getUserIdFromToken(exchange)
                .flatMap(authenticatedUserId -> {
                    // Users can only access their own cart
                    if (!authenticatedUserId.equals(userId)) {
                        return Mono.<ResponseEntity<Cart>>just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
                    }
                    
                    String redisKey = "cart:" + userId;
                    return cartOps.get(redisKey)
                            .map(cart -> ResponseEntity.ok(cart))
                            .switchIfEmpty(Mono.just(ResponseEntity.ok(new Cart(userId, new ArrayList<>(), 0.0f, "USD"))));
                })
                .onErrorReturn(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    // Add/Update cart
    @PostMapping("/cart")
    public Mono<ResponseEntity<String>> create(@RequestBody Mono<Cart> cartMono, ServerWebExchange exchange) {
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
                        
                        LOG.info("Adding cart to Redis for user: {}", authenticatedUserId);
                        
                        // Calculate total
                        float total = 0;
                        if (cart.getItems() != null) {
                            for (CartItem item : cart.getItems()) {
                                total += item.getPrice() * item.getQuantity();
                            }
                        }
                        cart.setTotal(total);
                        cart.setCurrency("USD");
                        
                        String redisKey = "cart:" + authenticatedUserId;
                        return cartOps.set(redisKey, cart)
                                .then(Mono.just(ResponseEntity.ok("Cart updated successfully")));
                    })
                )
                .onErrorReturn(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required"));
    }

    // Add single item to cart
    @PostMapping("/cart/{userId}/items")
    public Mono<ResponseEntity<String>> addItem(@PathVariable Long userId, 
                                              @RequestBody CartItem item, 
                                              ServerWebExchange exchange) {
        return getUserIdFromToken(exchange)
                .flatMap(authenticatedUserId -> {
                    if (!authenticatedUserId.equals(userId)) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body("Cannot modify another user's cart"));
                    }
                    
                    String redisKey = "cart:" + userId;
                    return cartOps.get(redisKey)
                            .switchIfEmpty(Mono.just(new Cart(userId, new ArrayList<>(), 0.0f, "USD")))
                            .flatMap(cart -> {
                                // Add or update item
                                boolean found = false;
                                for (CartItem existingItem : cart.getItems()) {
                                    if (existingItem.getProductId().equals(item.getProductId())) {
                                        existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
                                        found = true;
                                        break;
                                    }
                                }
                                
                                if (!found) {
                                    cart.getItems().add(item);
                                }
                                
                                // Recalculate total
                                float total = 0;
                                for (CartItem cartItem : cart.getItems()) {
                                    total += cartItem.getPrice() * cartItem.getQuantity();
                                }
                                cart.setTotal(total);
                                
                                return cartOps.set(redisKey, cart)
                                        .then(Mono.just(ResponseEntity.ok("Item added to cart")));
                            });
                })
                .onErrorReturn(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required"));
    }

    // Clear entire cart
    @DeleteMapping("/cart/{userId}")
    public Mono<ResponseEntity<String>> clearCart(@PathVariable Long userId, ServerWebExchange exchange) {
        return getUserIdFromToken(exchange)
                .flatMap(authenticatedUserId -> {
                    if (!authenticatedUserId.equals(userId)) {
                        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body("Cannot modify another user's cart"));
                    }
                    
                    String redisKey = "cart:" + userId;
                    return redisTemplate.delete(redisKey)
                            .then(Mono.just(ResponseEntity.ok("Cart cleared successfully")));
                })
                .onErrorReturn(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Authentication required"));
    }
}