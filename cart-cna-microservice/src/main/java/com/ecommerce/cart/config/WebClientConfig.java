package com.ecommerce.cart.config;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Configuration
public class WebClientConfig {

    @Value("${services.user-service.url}")
    private String userServiceUrl;

    @Value("${services.product-service.url}")
    private String productServiceUrl;

    // Connection pool configuration for optimal performance
    @Bean
    public ConnectionProvider connectionProvider() {
        return ConnectionProvider.builder("cart-service-pool")
                .maxConnections(50)
                .maxIdleTime(Duration.ofSeconds(30))
                .maxLifeTime(Duration.ofMinutes(5))
                .pendingAcquireTimeout(Duration.ofSeconds(10))
                .evictInBackground(Duration.ofSeconds(30))
                .build();
    }

    // Optimized HTTP client with timeouts and connection pooling
    @Bean
    public HttpClient httpClient(ConnectionProvider connectionProvider) {
        return HttpClient.create(connectionProvider)
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 3000)
                .doOnConnected(conn -> 
                    conn.addHandlerLast(new ReadTimeoutHandler(5, TimeUnit.SECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(5, TimeUnit.SECONDS)))
                .responseTimeout(Duration.ofSeconds(10));
    }

    // User Service WebClient with specific configuration
    @Bean("userServiceWebClient")
    public WebClient userServiceWebClient(HttpClient httpClient) {
        return WebClient.builder()
                .baseUrl(userServiceUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Accept", "application/json")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024)) // 1MB buffer
                .build();
    }

    // Product Service WebClient with specific configuration
    @Bean("productServiceWebClient")
    public WebClient productServiceWebClient(HttpClient httpClient) {
        return WebClient.builder()
                .baseUrl(productServiceUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Accept", "application/json")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024)) // 2MB buffer
                .build();
    }

    // General WebClient for other services (if needed)
    @Bean("generalWebClient")
    public WebClient generalWebClient(HttpClient httpClient) {
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Accept", "application/json")
                .build();
    }
}