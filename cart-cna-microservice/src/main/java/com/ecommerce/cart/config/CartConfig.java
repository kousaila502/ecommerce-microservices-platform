package com.ecommerce.cart.config;

import javax.annotation.PreDestroy;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.ReactiveKeyCommands;
import org.springframework.data.redis.connection.ReactiveRedisConnectionFactory;
import org.springframework.data.redis.connection.ReactiveStringCommands;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.ReactiveRedisOperations;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.ecommerce.cart.model.Cart;

@Configuration
public class CartConfig {

    private static final Logger LOG = LoggerFactory.getLogger(CartConfig.class);

    @Autowired
    RedisConnectionFactory factory;

    @Bean
    ReactiveRedisTemplate<String, Cart> redisOperations(ReactiveRedisConnectionFactory factory) {
        try {
            Jackson2JsonRedisSerializer<Cart> serializer = new Jackson2JsonRedisSerializer<>(Cart.class);

            RedisSerializationContext.RedisSerializationContextBuilder<String, Cart> builder =
                    RedisSerializationContext.newSerializationContext(new StringRedisSerializer());

            RedisSerializationContext<String, Cart> context = builder.value(serializer).build();

            return new ReactiveRedisTemplate<>(factory, context);
        } catch (Exception e) {
            LOG.error("Failed to create ReactiveRedisTemplate: {}", e.getMessage());
            // Return a mock template that doesn't fail but logs warnings
            return createMockRedisTemplate();
        }
    }

    // Create beans conditionally - only if Redis is available
    @Bean
    @ConditionalOnProperty(name = "spring.redis.host", havingValue = "localhost", matchIfMissing = false)
    public ReactiveKeyCommands keyCommandsLocal(final ReactiveRedisConnectionFactory reactiveRedisConnectionFactory) {
        return createKeyCommands(reactiveRedisConnectionFactory);
    }

    @Bean
    @ConditionalOnProperty(name = "spring.redis.host", havingValue = "discrete-raccoon-6606.upstash.io", matchIfMissing = false)
    public ReactiveKeyCommands keyCommandsUpstash(final ReactiveRedisConnectionFactory reactiveRedisConnectionFactory) {
        return createKeyCommands(reactiveRedisConnectionFactory);
    }

    @Bean
    @ConditionalOnProperty(name = "spring.redis.host", havingValue = "localhost", matchIfMissing = false)
    public ReactiveStringCommands stringCommandsLocal(final ReactiveRedisConnectionFactory reactiveRedisConnectionFactory) {
        return createStringCommands(reactiveRedisConnectionFactory);
    }

    @Bean
    @ConditionalOnProperty(name = "spring.redis.host", havingValue = "discrete-raccoon-6606.upstash.io", matchIfMissing = false)
    public ReactiveStringCommands stringCommandsUpstash(final ReactiveRedisConnectionFactory reactiveRedisConnectionFactory) {
        return createStringCommands(reactiveRedisConnectionFactory);
    }

    // Safe methods that handle connection failures
    private ReactiveKeyCommands createKeyCommands(ReactiveRedisConnectionFactory factory) {
        try {
            return factory.getReactiveConnection().keyCommands();
        } catch (Exception e) {
            LOG.warn("Failed to create Redis KeyCommands: {}", e.getMessage());
            return null;
        }
    }

    private ReactiveStringCommands createStringCommands(ReactiveRedisConnectionFactory factory) {
        try {
            return factory.getReactiveConnection().stringCommands();
        } catch (Exception e) {
            LOG.warn("Failed to create Redis StringCommands: {}", e.getMessage());
            return null;
        }
    }

    private ReactiveRedisTemplate<String, Cart> createMockRedisTemplate() {
        LOG.warn("Creating mock Redis template - Redis operations will be disabled");
        // This would need a proper mock implementation
        // For now, return null and handle in CartService
        return null;
    }

    /*@PreDestroy
    public void cleanRedis() {
        try {
            factory.getConnection().flushDb();
        } catch (Exception e) {
            LOG.warn("Failed to clean Redis on shutdown: {}", e.getMessage());
        }
    }*/
}
