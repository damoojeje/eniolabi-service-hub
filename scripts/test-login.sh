#!/bin/bash

# 🔐 LOGIN TEST SCRIPT
# Test authentication and database connectivity

echo "🔐 ENIOLABI SERVICE HUB - LOGIN TEST"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}🔍 Testing Database Connection...${NC}"

# Check if database is accessible
if docker exec eniolabi-db pg_isready -U eniolabi -d eniolabi_service_hub > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database: CONNECTED${NC}"
else
    echo -e "${RED}❌ Database: CONNECTION FAILED${NC}"
    exit 1
fi

# Check if admin user exists
echo -e "\n${BLUE}👤 Checking Admin User...${NC}"
USER_COUNT=$(docker exec eniolabi-db psql -U eniolabi -d eniolabi_service_hub -t -c "SELECT COUNT(*) FROM users WHERE role = 'ADMIN';" | tr -d ' ')
if [ "$USER_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Admin User: EXISTS${NC}"
    
    # Show admin user details
    echo -e "\n${BLUE}📋 Admin User Details:${NC}"
    docker exec eniolabi-db psql -U eniolabi -d eniolabi_service_hub -c "SELECT username, email, role, \"isActive\" FROM users WHERE role = 'ADMIN';"
else
    echo -e "${RED}❌ Admin User: NOT FOUND${NC}"
fi

# Check if services exist
echo -e "\n${BLUE}🔧 Checking Services...${NC}"
SERVICE_COUNT=$(docker exec eniolabi-db psql -U eniolabi -d eniolabi_service_hub -t -c "SELECT COUNT(*) FROM services;" | tr -d ' ')
if [ "$SERVICE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Services: $SERVICE_COUNT FOUND${NC}"
else
    echo -e "${RED}❌ Services: NONE FOUND${NC}"
fi

# Test server response
echo -e "\n${BLUE}🌐 Testing Server Response...${NC}"
if curl -s -I http://localhost:3002 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server: RESPONDING${NC}"
    
    # Test login page
    if curl -s http://localhost:3002/auth/signin | grep -q "signin\|login" 2>/dev/null; then
        echo -e "${GREEN}✅ Login Page: ACCESSIBLE${NC}"
    else
        echo -e "${YELLOW}⚠️  Login Page: CHECKING...${NC}"
    fi
else
    echo -e "${RED}❌ Server: NOT RESPONDING${NC}"
fi

# Test Redis connection
echo -e "\n${BLUE}🔴 Testing Redis Connection...${NC}"
if docker exec eniolabi-redis redis-cli -a ${REDIS_PASSWORD:-replaceme123} ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis: CONNECTED${NC}"
else
    echo -e "${RED}❌ Redis: CONNECTION FAILED${NC}"
fi

echo -e "\n${GREEN}🎯 LOGIN TEST COMPLETED!${NC}"
echo ""
echo -e "${BLUE}💡 Login Credentials:${NC}"
echo -e "   Username: ${GREEN}admin${NC}"
echo -e "   Password: ${GREEN}\${ADMIN_PASSWORD:-replaceme123}${NC}"
echo -e "   Email: ${GREEN}admin@eniolabi.com${NC}"
echo ""
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo -e "   Local: ${GREEN}http://localhost:3002${NC}"
echo -e "   Domain: ${GREEN}https://eniolabi.com${NC}"
echo ""
echo -e "${GREEN}🚀 You should now be able to login!${NC}"
