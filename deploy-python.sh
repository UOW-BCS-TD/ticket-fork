#!/bin/bash

# Python Backend Deployment Script
# Usage: ./deploy-python.sh

echo "🚀 Starting Python backend deployment..."

# Step 1: Find and kill the existing process running on port 5000
echo "🛑 Stopping existing Python app..."
PID=$(lsof -ti :5000)
if [ -n "$PID" ]; then
  echo "🔫 Killing process $PID..."
  kill -9 $PID || { echo "❌ Failed to kill process"; exit 1; }
  sleep 2  # Wait for process to terminate
else
  echo "⚠️ No process found on port 5000 (nothing to kill)."
fi

# Step 2: Navigate to project and activate virtualenv
echo "🔧 Activating virtualenv..."
cd ~/chat_backend || { echo "❌ Project directory not found"; exit 1; }
source venv/bin/activate || { echo "❌ Virtualenv activation failed"; exit 1; }

# Step 3: Install dependencies (optional)
echo "📦 Checking dependencies..."
pip install -r requirements.txt || { echo "❌ Dependency install failed"; exit 1; }

# Step 4: Restart the Python backend
echo "🔄 Starting Python backend..."
nohup python backend.py > python.log 2>&1 &
sleep 5  # Wait for app to start

# Step 5: Verify it's running
NEW_PID=$(lsof -ti :5000)
if [ -n "$NEW_PID" ]; then
  echo "✅ Success! Python backend is running (PID: $NEW_PID)."
  echo "📝 Logs: python.log"
else
  echo "❌ Failed to start Python backend!"
  tail -n 20 python.log  # Show recent logs for debugging
  exit 1
fi