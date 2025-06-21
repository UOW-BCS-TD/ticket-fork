#!/bin/bash

# Spring Boot Deployment Script
# Usage: ./deploy-springboot.sh

echo "🚀 Starting Spring Boot deployment..."

# Step 1: Find and kill the existing process running on port 8082
echo "🛑 Stopping existing Spring Boot app..."
PID=$(lsof -ti :8082)
if [ -n "$PID" ]; then
  echo "🔫 Killing process $PID..."
  kill -9 $PID || { echo "❌ Failed to kill process"; exit 1; }
  sleep 2  # Wait for process to terminate
else
  echo "⚠️ No process found on port 8082 (nothing to kill)."
fi

# Step 2: Rebuild the JAR (assuming Maven)
echo "🔨 Building JAR file..."
cd ~/ticket-prod/backend || { echo "❌ Backend directory not found"; exit 1; }
mvn clean package || { echo "❌ Build failed"; exit 1; }

# Step 3: Run the new JAR with nohup
echo "🔄 Starting Spring Boot..."
nohup java -jar target/ticket-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
sleep 5  # Wait for app to start

# Step 4: Verify it's running
NEW_PID=$(lsof -ti :8082)
if [ -n "$NEW_PID" ]; then
  echo "✅ Success! Spring Boot is running (PID: $NEW_PID)."
  echo "📝 Logs: app.log"
else
  echo "❌ Failed to start Spring Boot!"
  tail -n 20 app.log  # Show recent logs for debugging
  exit 1
fi