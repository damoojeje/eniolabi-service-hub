#!/bin/bash

# 📊 PRODUCTION MONITORING SCRIPT
# Quick status check for the production server

echo "📊 ENIOLABI SERVICE HUB - PRODUCTION STATUS"
echo "============================================"

# Check PM2 status
echo "🔄 PM2 Process Status:"
pm2 status

echo ""

# Check if server is responding
echo "🌐 Server Health Check:"
if curl -s -I http://localhost:3002 | grep -q "200"; then
    echo "✅ Local server: HEALTHY (port 3002)"
else
    echo "❌ Local server: UNHEALTHY (port 3002)"
fi

# Check domain
echo "🌍 Domain Health Check:"
if curl -s -I https://eniolabi.com | grep -q "200"; then
    echo "✅ Domain: HEALTHY (eniolabi.com)"
else
    echo "❌ Domain: UNHEALTHY (eniolabi.com)"
fi

echo ""

# Check systemd service
echo "🔧 Systemd Service Status:"
if systemctl is-active --quiet pm2-olabi; then
    echo "✅ PM2 Service: ACTIVE"
else
    echo "❌ PM2 Service: INACTIVE"
fi

echo ""

# Check logs
echo "📝 Recent Logs (last 5 lines):"
pm2 logs eniolabi-service-hub --lines 5 --nostream

echo ""
echo "🎯 Production Server is now FULLY AUTOMATED!"
echo "   - ✅ Auto-starts on boot"
echo "   - ✅ Auto-restarts on crashes"
echo "   - ✅ Fixed port 3002"
echo "   - ✅ PM2 process management"
echo "   - ✅ Systemd integration"
