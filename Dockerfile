# Use a multi-stage build to keep the final image small

# 1. Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend ./backend
WORKDIR /app/backend
RUN mvn clean package -DskipTests

# 2. Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the jar from the build stage
COPY --from=build /app/backend/target/*.jar app.jar

# Expose the port your app runs on
EXPOSE 8082

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"] 