#!/bin/bash

# 🚀 PRODUCTION STARTUP SCRIPT
# This script builds and starts the app in production mode with PM2

set -e

echo "🚀 STARTING ENIOLABI SERVICE HUB IN PRODUCTION MODE"
echo "=================================================="

# Step 1: Stop any existing development servers
echo "🛑 Stopping development servers..."
pkill -f "next dev" || echo "No development servers running"
sleep 2

# Step 2: Build the application
echo "🔨 Building application for production..."
npm run build
echo "✅ Build completed successfully"

# Step 3: Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Step 4: Start with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Step 5: Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Step 6: Setup PM2 startup script
echo "🔧 Setting up PM2 startup script..."
pm2 startup

# Step 7: Verify the application is running
echo "🧪 Verifying application status..."
sleep 5
pm2 status

echo ""
echo "🎉 PRODUCTION DEPLOYMENT COMPLETED!"
echo "=================================="
echo "Application: eniolabi-service-hub"
echo "Status: Running with PM2"
echo "Port: 3002 (Fixed)"
echo "Mode: Production"
echo ""
echo "📋 Useful PM2 Commands:"
echo "  pm2 status                    - Check app status"
echo "  pm2 logs eniolabi-service-hub - View logs"
echo "  pm2 restart eniolabi-service-hub - Restart app"
echo "  pm2 stop eniolabi-service-hub   - Stop app"
echo "  pm2 delete eniolabi-service-hub - Remove from PM2"
echo ""
echo "🌐 Your domain should now be stable and reliable!"
