package com.ecommerce.cart.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI cartServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Cart Service API")
                        .description("E-commerce Cart Microservice with Real External Validation")
                        .version("3.0.0")
                        .contact(new Contact()
                                .name("Cart Service Team")
                                .email("support@ecommerce.com")
                                .url("https://github.com/kousaila502/ecommerce-microservices-platform"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Development Server"),
                        new Server()
                                .url("https://api.ecommerce.com")
                                .description("Production Server")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT Bearer Token Authentication")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}