FROM gradle:7.6-jdk17 AS build
WORKDIR /app
COPY . .
RUN gradle build -x test --no-daemon

FROM eclipse-temurin:17-jre
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring
COPY --from=build /app/build/libs/*.jar app.jar

# Disable all problematic Spring Boot features
ENTRYPOINT ["java", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-Dmanagement.endpoints.enabled-by-default=false", \
    "-Dmanagement.endpoint.metrics.enabled=false", \
    "-Dmanagement.metrics.export.simple.enabled=false", \
    "-Dspring.jmx.enabled=false", \
    "-Dmanagement.health.redis.enabled=false", \
    "-Dspring.cloud.sleuth.enabled=false", \
    "-Dmanagement.server.port=-1", \
    "-jar", "/app.jar"]