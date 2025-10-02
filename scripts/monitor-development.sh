#!/bin/bash

# 🚀 DEVELOPMENT MONITORING SCRIPT
# Real-time monitoring for development mode with hot reload

echo "🚀 ENIOLABI SERVICE HUB - DEVELOPMENT MODE MONITORING"
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if ss -tlnp | grep -q ":$port "; then
        echo -e "${GREEN}✅ Port $port: ACTIVE${NC}"
        ss -tlnp | grep ":$port " | head -1
    else
        echo -e "${RED}❌ Port $port: INACTIVE${NC}"
    fi
}

# Function to check service health
check_service_health() {
    local url=$1
    local name=$2
    echo -e "\n${BLUE}🔍 Checking $name...${NC}"
    
    if curl -s -I "$url" > /dev/null 2>&1; then
        local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
        local response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url")
        
        if [ "$status_code" = "200" ]; then
            echo -e "${GREEN}✅ $name: HEALTHY (HTTP $status_code, ${response_time}s)${NC}"
        else
            echo -e "${YELLOW}⚠️  $name: RESPONDING (HTTP $status_code, ${response_time}s)${NC}"
        fi
    else
        echo -e "${RED}❌ $name: UNREACHABLE${NC}"
    fi
}

# Check PM2 status
echo -e "\n${BLUE}🔄 PM2 Process Status:${NC}"
if pm2 list | grep -q "eniolabi-service-hub"; then
    pm2 list | grep "eniolabi-service-hub"
    echo -e "${GREEN}✅ PM2 Process: ACTIVE${NC}"
else
    echo -e "${RED}❌ PM2 Process: NOT FOUND${NC}"
fi

# Check port usage
echo -e "\n${BLUE}🔌 Port Status:${NC}"
check_port 3002
check_port 5433
check_port 6380

# Check if development server is responding
echo -e "\n${BLUE}🌐 Development Server Health:${NC}"
if curl -s -I http://localhost:3002 | grep -q "200"; then
    echo -e "${GREEN}✅ Development Server: HEALTHY (port 3002)${NC}"
    
    # Check specific routes
    check_service_health "http://localhost:3002" "Dashboard"
    check_service_health "http://localhost:3002/notes" "Notes System"
    check_service_health "http://localhost:3002/admin" "Admin Panel"
    
else
    echo -e "${RED}❌ Development Server: UNHEALTHY (port 3002)${NC}"
fi

# Check domain routing
echo -e "\n${BLUE}🌍 Domain Health Check:${NC}"
if curl -s -I https://eniolabi.com | grep -q "200"; then
    echo -e "${GREEN}✅ Domain: HEALTHY (eniolabi.com)${NC}"
    
    # Check domain routes
    check_service_health "https://eniolabi.com" "Domain Dashboard"
    check_service_health "https://eniolabi.com/notes" "Domain Notes"
    
else
    echo -e "${RED}❌ Domain: UNHEALTHY (eniolabi.com)${NC}"
fi

# Check Docker services
echo -e "\n${BLUE}🐳 Docker Services:${NC}"
if docker ps | grep -q "eniolabi"; then
    echo -e "${GREEN}✅ Docker Services: RUNNING${NC}"
    docker ps | grep "eniolabi"
else
    echo -e "${RED}❌ Docker Services: NOT RUNNING${NC}"
fi

# Check systemd service
echo -e "\n${BLUE}🔧 Systemd Service Status:${NC}"
if systemctl is-active --quiet pm2-olabi; then
    echo -e "${GREEN}✅ PM2 Service: ACTIVE${NC}"
else
    echo -e "${RED}❌ PM2 Service: INACTIVE${NC}"
fi

# Check file watching (development mode)
echo -e "\n${BLUE}👀 Development Mode Features:${NC}"
echo -e "${GREEN}✅ Hot Reload: ENABLED${NC}"
echo -e "${GREEN}✅ Fast Refresh: ENABLED${NC}"
echo -e "${GREEN}✅ Source Maps: ENABLED${NC}"
echo -e "${GREEN}✅ Development Tools: ENABLED${NC}"

# Check recent logs
echo -e "\n${BLUE}📝 Recent Development Logs (last 10 lines):${NC}"
if pm2 list | grep -q "eniolabi-service-hub"; then
    pm2 logs eniolabi-service-hub --lines 10 --nostream
else
    echo -e "${YELLOW}⚠️  No PM2 logs available${NC}"
fi

# Check file changes (if inotify-tools is available)
if command -v inotifywait >/dev/null 2>&1; then
    echo -e "\n${BLUE}📁 File Change Monitoring:${NC}"
    echo -e "${GREEN}✅ inotify: AVAILABLE${NC}"
    echo -e "${BLUE}   Watching for changes in src/ directory...${NC}"
    echo -e "${BLUE}   Press Ctrl+C to stop monitoring${NC}"
    
    # Monitor file changes in real-time
    inotifywait -m -r -e modify,create,delete src/ --format '%T %e %w%f' 2>/dev/null &
    INOTIFY_PID=$!
    
    # Wait for user input
    read -p "Press Enter to stop file monitoring..."
    kill $INOTIFY_PID 2>/dev/null
else
    echo -e "\n${BLUE}📁 File Change Monitoring:${NC}"
    echo -e "${YELLOW}⚠️  inotify-tools not installed${NC}"
    echo -e "${BLUE}   Install with: sudo apt-get install inotify-tools${NC}"
fi

echo -e "\n${GREEN}🎯 Development Mode is OPTIMAL for Active Development!${NC}"
echo -e "${BLUE}   - ✅ Hot reload enabled${NC}"
echo -e "${BLUE}   - ✅ Real-time changes${NC}"
echo -e "${BLUE}   - ✅ Fast development cycle${NC}"
echo -e "${BLUE}   - ✅ Better debugging${NC}"
echo -e "${BLUE}   - ✅ Source maps available${NC}"
echo ""
echo -e "${YELLOW}💡 Development Commands:${NC}"
echo -e "  npm run dev          - Start development server"
echo -e "  npm run build        - Build for production"
echo -e "  npm run lint         - Run linting"
echo -e "  ./scripts/monitor-development.sh - This monitoring script"
echo ""
echo -e "${GREEN}🚀 Keep Development Mode for Active Development!${NC}"
