#!/bin/bash

# Deployment Script for React/Vite App
# Usage: ./deploy.sh

echo "🚀 Starting deployment..."

# Step 1: Navigate to the project directory
cd ~/ticket-prod/frontend || { echo "❌ Error: Project directory not found"; exit 1; }

# Step 2: Run npm build
echo "🔧 Building the project..."
npm run build || { echo "❌ Build failed"; exit 1; }

# Step 3: Copy files to /var/www/chat.elvificent.com
echo "📂 Copying files to /var/www/chat.elvificent.com..."
sudo cp -r ~/ticket-prod/frontend/dist/* /var/www/chat.elvificent.com/ || { echo "❌ Copy failed"; exit 1; }

# Step 4: Fix permissions (optional, if needed)
# sudo chown -R www-data:www-data /var/www/chat.elvificent.com

# Step 5: Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx || { echo "❌ Nginx restart failed"; exit 1; }

echo "✅ Deployment successful! Visit https://chat.elvificent.com"