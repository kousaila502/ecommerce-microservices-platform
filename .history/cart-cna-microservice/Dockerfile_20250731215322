FROM gradle:7.6-jdk17-alpine AS build
WORKDIR /app
COPY . .
RUN gradle build -x test --no-daemon

FROM openjdk:17-alpine
RUN addgroup -S spring && adduser -S spring -G spring  
USER spring:spring
COPY --from=build /app/build/libs/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]