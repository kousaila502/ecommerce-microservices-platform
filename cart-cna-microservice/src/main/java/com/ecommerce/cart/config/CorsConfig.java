package com.ecommerce.cart.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${spring.profiles.active:development}")
    private String activeProfile;

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // ✅ SECURE: Environment-specific allowed origins
        List<String> allowedOrigins = getAllowedOrigins();
        configuration.setAllowedOrigins(allowedOrigins);
        
        // ✅ SECURE: Allow specific HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));
        
        // ✅ SECURE: Allow specific headers
        configuration.setAllowedHeaders(Arrays.asList(
            "Content-Type", 
            "Authorization", 
            "X-Requested-With",
            "Accept",
            "Origin"
        ));
        
        // ✅ SECURE: Disable credentials for security
        configuration.setAllowCredentials(false);
        
        // ✅ SECURE: Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return new CorsWebFilter(source);
    }
    
    private List<String> getAllowedOrigins() {
        if ("production".equals(activeProfile)) {
            return Arrays.asList(
                "https://ecommerce-microservices-platform.vercel.app",
                "https://ecommerce-app-omega-two-64.vercel.app",  // ✅ ADD THIS
                "https://ecommerce-product-service-56575270905a.herokuapp.com"
            );
        } else {
            return Arrays.asList(
                "https://ecommerce-microservices-platform.vercel.app",
                "https://ecommerce-app-omega-two-64.vercel.app",  // ✅ ADD THIS
                "http://localhost:3000",
                "http://localhost:8080",
                "http://localhost:3001"
            );
        }
    }
}