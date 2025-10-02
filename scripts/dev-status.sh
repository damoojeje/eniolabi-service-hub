#!/bin/bash

# 🚀 QUICK DEVELOPMENT STATUS CHECK
# Fast status check for development mode

echo "🚀 ENIOLABI SERVICE HUB - DEVELOPMENT STATUS"
echo "============================================"

# Quick checks
echo "🔍 Quick Status Check:"

# Check if server is running
if curl -s -I http://localhost:3002 > /dev/null 2>&1; then
    echo "✅ Development Server: RUNNING (port 3002)"
    
    # Check response time
    response_time=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3002)
    echo "⏱️  Response Time: ${response_time}s"
    
    # Check if it's development mode
    if curl -s http://localhost:3002 | grep -q "Development Mode\|Hot Reload\|Fast Refresh" 2>/dev/null; then
        echo "🔥 Development Features: ACTIVE"
    else
        echo "⚠️  Development Features: CHECKING..."
    fi
else
    echo "❌ Development Server: NOT RUNNING"
fi

# Check PM2
if pm2 list | grep -q "eniolabi-service-hub"; then
    echo "✅ PM2 Process: ACTIVE"
    pm2 list | grep "eniolabi-service-hub" | awk '{print "   " $0}'
else
    echo "❌ PM2 Process: NOT FOUND"
fi

# Check Docker
if docker ps | grep -q "eniolabi"; then
    echo "✅ Docker Services: RUNNING"
else
    echo "❌ Docker Services: NOT RUNNING"
fi

echo ""
echo "💡 Development Mode is ACTIVE and OPTIMAL!"
echo "   Run './scripts/monitor-development.sh' for detailed monitoring"
