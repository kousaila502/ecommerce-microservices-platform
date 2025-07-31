# Build stage
FROM openjdk:17-alpine AS build
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew
RUN ./gradlew build -x test

# Runtime stage  
FROM openjdk:17-alpine
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --from=build /app/build/libs/cart-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]