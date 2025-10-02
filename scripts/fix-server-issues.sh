#!/bin/bash

# 🚨 EMERGENCY SERVER RECOVERY SCRIPT
# This script automatically fixes server routing issues
# Usage: ./scripts/fix-server-issues.sh

set -e

echo "🚨 EMERGENCY SERVER RECOVERY INITIATED"
echo "======================================"

# Step 1: Document current state
echo "📊 Documenting current server state..."
echo "Running Next.js servers:"
ps aux | grep "next-server" | grep -v grep || echo "No Next.js servers running"
echo ""

echo "Open ports:"
ss -tlnp | grep "300" || echo "No ports 3000-3009 open"
echo ""

echo "Current Nginx configuration:"
cat /etc/nginx/sites-enabled/eniolabi.com | grep "proxy_pass" || echo "No proxy_pass found"
echo ""

# Step 2: Stop ALL conflicting servers
echo "🛑 Stopping ALL Next.js servers..."
pkill -f "next-server" || echo "No servers to stop"
sleep 2

# Step 3: Start fresh server
echo "🚀 Starting fresh development server..."
npm run dev &
sleep 5

# Step 4: Identify new port
echo "🔍 Identifying new server port..."
NEW_PORT=$(ss -tlnp | grep "next" | grep -o "300[0-9]" | head -1)
if [ -z "$NEW_PORT" ]; then
    echo "❌ ERROR: Could not identify new server port"
    exit 1
fi
echo "✅ New server running on port: $NEW_PORT"

# Step 5: Update Nginx
echo "⚙️ Updating Nginx configuration..."
sudo sed -i "s/localhost:300[0-9]/localhost:$NEW_PORT/g" /etc/nginx/sites-enabled/eniolabi.com
echo "✅ Nginx updated to point to port $NEW_PORT"

# Step 6: Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx
echo "✅ Nginx reloaded"

# Step 7: Verify domain works
echo "🧪 Testing domain..."
sleep 3
if curl -s -I https://eniolabi.com | grep -q "200"; then
    echo "✅ SUCCESS: Domain is working!"
else
    echo "❌ ERROR: Domain still not responding"
    echo "Checking Nginx error logs..."
    sudo tail -5 /var/log/nginx/error.log
    exit 1
fi

echo ""
echo "🎉 SERVER RECOVERY COMPLETED SUCCESSFULLY!"
echo "Domain: https://eniolabi.com"
echo "Server Port: $NEW_PORT"
echo "Nginx: Updated and reloaded"
echo ""
echo "📋 Next steps:"
echo "1. Test the domain in your browser"
echo "2. Verify all routes work: /, /notes, /dashboard"
echo "3. If issues persist, check Nginx error logs"
echo "4. Reference CURSOR_RULES.md for future prevention"
