#!/bin/bash

# 🔐 AUTHENTICATION DEBUGGING SCRIPT
# Comprehensive testing of login flow and session management

echo "🔐 ENIOLABI SERVICE HUB - AUTHENTICATION DEBUG"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}🔍 Testing Database and Services...${NC}"

# Check database
if docker exec eniolabi-db pg_isready -U eniolabi -d eniolabi_service_hub > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database: CONNECTED${NC}"
else
    echo -e "${RED}❌ Database: CONNECTION FAILED${NC}"
    exit 1
fi

# Check Redis
if docker exec eniolabi-redis redis-cli -a ${REDIS_PASSWORD:-replaceme123} ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis: CONNECTED${NC}"
else
    echo -e "${RED}❌ Redis: CONNECTION FAILED${NC}"
    exit 1
fi

# Check server
if curl -s -I http://localhost:3002 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server: RESPONDING${NC}"
else
    echo -e "${RED}❌ Server: NOT RESPONDING${NC}"
    exit 1
fi

echo -e "\n${BLUE}👤 Checking Admin User...${NC}"
USER_COUNT=$(docker exec eniolabi-db psql -U eniolabi -d eniolabi_service_hub -t -c "SELECT COUNT(*) FROM users WHERE role = 'ADMIN';" | tr -d ' ')
if [ "$USER_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Admin User: EXISTS${NC}"
    
    # Show admin user details
    echo -e "\n${BLUE}📋 Admin User Details:${NC}"
    docker exec eniolabi-db psql -U eniolabi -d eniolabi_service_hub -c "SELECT username, email, role, \"isActive\" FROM users WHERE role = 'ADMIN';"
else
    echo -e "${RED}❌ Admin User: NOT FOUND${NC}"
    exit 1
fi

echo -e "\n${BLUE}🌐 Testing Authentication Endpoints...${NC}"

# Test login page accessibility
if curl -s http://localhost:3002/auth/signin | grep -q "signin\|login" 2>/dev/null; then
    echo -e "${GREEN}✅ Login Page: ACCESSIBLE${NC}"
else
    echo -e "${RED}❌ Login Page: NOT ACCESSIBLE${NC}"
fi

# Test dashboard (should redirect to login)
DASHBOARD_RESPONSE=$(curl -s -I http://localhost:3002/dashboard | head -1)
if echo "$DASHBOARD_RESPONSE" | grep -q "302\|401\|403"; then
    echo -e "${GREEN}✅ Dashboard Protection: WORKING${NC}"
else
    echo -e "${YELLOW}⚠️  Dashboard Protection: CHECKING...${NC}"
fi

echo -e "\n${BLUE}🔐 Testing tRPC Authentication...${NC}"

# Test unauthenticated tRPC call
echo -e "${BLUE}   Testing unauthenticated notes.createNote...${NC}"
UNAUTH_RESPONSE=$(curl -s -X POST "http://localhost:3002/api/trpc/notes.createNote" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test","category":"general","tags":[],"isPinned":false}' \
  -w "%{http_code}" -o /dev/null)

if [ "$UNAUTH_RESPONSE" = "401" ]; then
    echo -e "${GREEN}   ✅ Unauthenticated call: CORRECTLY REJECTED (401)${NC}"
else
    echo -e "${RED}   ❌ Unauthenticated call: UNEXPECTED RESPONSE ($UNAUTH_RESPONSE)${NC}"
fi

# Test authenticated tRPC call (this will fail but should show different error)
echo -e "${BLUE}   Testing authenticated notes.createNote...${NC}"
echo -e "${YELLOW}   ⚠️  This will fail (no session), but should show different error${NC}"

# Test with a fake session cookie
FAKE_SESSION_RESPONSE=$(curl -s -X POST "http://localhost:3002/api/trpc/notes.createNote" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=fake-token" \
  -d '{"title":"Test","content":"Test","category":"general","tags":[],"isPinned":false}' \
  -w "%{http_code}" -o /dev/null)

if [ "$FAKE_SESSION_RESPONSE" = "401" ]; then
    echo -e "${GREEN}   ✅ Fake session: CORRECTLY REJECTED (401)${NC}"
else
    echo -e "${YELLOW}   ⚠️  Fake session: UNEXPECTED RESPONSE ($FAKE_SESSION_RESPONSE)${NC}"
fi

echo -e "\n${BLUE}📊 Checking Server Logs...${NC}"

# Check recent PM2 logs
if pm2 list | grep -q "eniolabi-service-hub"; then
    echo -e "${GREEN}✅ PM2 Process: ACTIVE${NC}"
    echo -e "${BLUE}   Recent error logs:${NC}"
    pm2 logs eniolabi-service-hub --lines 5 --nostream | grep "❌\|ERROR\|error" | tail -5
else
    echo -e "${RED}❌ PM2 Process: NOT FOUND${NC}"
fi

echo -e "\n${BLUE}🔧 Environment Check...${NC}"

# Check environment variables
echo -e "${BLUE}   NEXTAUTH_SECRET: ${NC}$(grep -o 'NEXTAUTH_SECRET=[^,]*' ecosystem.config.js | cut -d'=' -f2 | head -c 20)..."
echo -e "${BLUE}   NEXTAUTH_URL: ${NC}$(grep -o 'NEXTAUTH_URL=[^,]*' ecosystem.config.js | cut -d'=' -f2)"
echo -e "${BLUE}   NODE_ENV: ${NC}$(grep -o 'NODE_ENV=[^,]*' ecosystem.config.js | cut -d'=' -f2)"

echo -e "\n${BLUE}💡 Troubleshooting Steps...${NC}"
echo -e "${YELLOW}1.${NC} Clear browser cookies and cache"
echo -e "${YELLOW}2.${NC} Try logging in again with admin/\${ADMIN_PASSWORD:-replaceme123}"
echo -e "${YELLOW}3.${NC} Check browser console for JavaScript errors"
echo -e "${YELLOW}4.${NC} Check browser Network tab for failed requests"
echo -e "${YELLOW}5.${NC} Verify session cookies are being set"

echo -e "\n${BLUE}🎯 Expected Behavior:${NC}"
echo -e "${GREEN}✅${NC} Login should create a session"
echo -e "${GREEN}✅${NC} Session should persist across page reloads"
echo -e "${GREEN}✅${NC} tRPC calls should include session cookies"
echo -e "${GREEN}✅${NC} Notes creation should work with valid session"

echo -e "\n${GREEN}🔍 AUTHENTICATION DEBUG COMPLETED!${NC}"
echo -e "${BLUE}   Check the troubleshooting steps above to resolve the issue.${NC}"
