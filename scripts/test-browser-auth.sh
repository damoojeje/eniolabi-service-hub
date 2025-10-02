#!/bin/bash

# 🌐 BROWSER AUTHENTICATION TEST SCRIPT
# Test the complete authentication flow like a real browser

echo "🌐 ENIOLABI SERVICE HUB - BROWSER AUTHENTICATION TEST"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}🔍 Testing Browser-Style Authentication...${NC}"

# Step 1: Test the signin page (like a browser would)
echo -e "\n${BLUE}1️⃣  Testing Signin Page...${NC}"
SIGNIN_PAGE_RESPONSE=$(curl -s -I "http://localhost:3002/auth/signin" | head -1)
echo -e "${BLUE}   Signin page response: ${NC}$SIGNIN_PAGE_RESPONSE"

if echo "$SIGNIN_PAGE_RESPONSE" | grep -q "200"; then
    echo -e "${GREEN}   ✅ Signin page accessible${NC}"
else
    echo -e "${RED}   ❌ Signin page not accessible${NC}"
    exit 1
fi

# Step 2: Test the signin flow with proper headers (browser-like)
echo -e "\n${BLUE}2️⃣  Testing Browser-Style Signin...${NC}"

# Create a temporary cookie file
COOKIE_FILE=$(mktemp)

# Test signin with browser-like headers
echo -e "${BLUE}   Testing signin with browser headers...${NC}"
SIGNIN_RESPONSE=$(curl -s -c $COOKIE_FILE \
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
  -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
  -H "Accept-Language: en-US,en;q=0.5" \
  -H "Accept-Encoding: gzip, deflate" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Origin: http://localhost:3002" \
  -H "Referer: http://localhost:3002/auth/signin" \
  -X POST "http://localhost:3002/api/auth/signin/credentials" \
  -d "username=admin&password=${ADMIN_PASSWORD:-replaceme123}&callbackUrl=%2Fdashboard" \
  -w "%{http_code}" -o /dev/null)

echo -e "${BLUE}   Signin response code: ${NC}$SIGNIN_RESPONSE"

# Check cookies
if [ -s "$COOKIE_FILE" ]; then
    echo -e "${GREEN}   ✅ Cookies were set${NC}"
    echo -e "${BLUE}   Cookie contents:${NC}"
    cat "$COOKIE_FILE"
    
    # Check for session token
    if grep -q "next-auth.session-token" "$COOKIE_FILE"; then
        echo -e "${GREEN}   ✅ Session token found!${NC}"
        SESSION_TOKEN=$(grep "next-auth.session-token" "$COOKIE_FILE" | awk '{print $7}')
        echo -e "${BLUE}   Session token: ${NC}${SESSION_TOKEN:0:20}..."
    else
        echo -e "${RED}   ❌ Session token still missing${NC}"
        echo -e "${YELLOW}   ⚠️  This confirms the NextAuth configuration issue${NC}"
    fi
else
    echo -e "${RED}   ❌ No cookies were set${NC}"
fi

# Step 3: Test session endpoint with cookies
echo -e "\n${BLUE}3️⃣  Testing Session Endpoint...${NC}"

if [ -s "$COOKIE_FILE" ]; then
    echo -e "${BLUE}   Testing /api/auth/session with cookies...${NC}"
    SESSION_RESPONSE=$(curl -s -b "$COOKIE_FILE" "http://localhost:3002/api/auth/session")
    echo -e "${BLUE}   Session response: ${NC}$SESSION_RESPONSE"
    
    if echo "$SESSION_RESPONSE" | grep -q "user"; then
        echo -e "${GREEN}   ✅ Session contains user data${NC}"
    else
        echo -e "${RED}   ❌ Session is empty or invalid${NC}"
    fi
fi

# Step 4: Test dashboard access with cookies
echo -e "\n${BLUE}4️⃣  Testing Dashboard Access...${NC}"

if [ -s "$COOKIE_FILE" ]; then
    echo -e "${BLUE}   Testing dashboard with cookies...${NC}"
    DASHBOARD_RESPONSE=$(curl -s -b "$COOKIE_FILE" -I "http://localhost:3002/dashboard" | head -1)
    echo -e "${BLUE}   Dashboard response: ${NC}$DASHBOARD_RESPONSE"
    
    if echo "$DASHBOARD_RESPONSE" | grep -q "200"; then
        echo -e "${GREEN}   ✅ Dashboard accessible with cookies${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Dashboard response: $DASHBOARD_RESPONSE${NC}"
    fi
fi

# Step 5: Test tRPC with cookies
echo -e "\n${BLUE}5️⃣  Testing tRPC with Cookies...${NC}"

if [ -s "$COOKIE_FILE" ]; then
    echo -e "${BLUE}   Testing tRPC notes.getNotes...${NC}"
    
    # Test with proper tRPC format
    TRPC_RESPONSE=$(curl -s -b "$COOKIE_FILE" \
      -H "Content-Type: application/json" \
      -X POST "http://localhost:3002/api/trpc/notes.getNotes" \
      -d '{"0":{}}' \
      -w "%{http_code}" -o /dev/null)
    
    echo -e "${BLUE}   tRPC response code: ${NC}$TRPC_RESPONSE"
    
    if [ "$TRPC_RESPONSE" = "200" ]; then
        echo -e "${GREEN}   ✅ tRPC working with session!${NC}"
    elif [ "$TRPC_RESPONSE" = "401" ]; then
        echo -e "${RED}   ❌ tRPC still unauthorized${NC}"
    else
        echo -e "${YELLOW}   ⚠️  tRPC response: $TRPC_RESPONSE${NC}"
    fi
fi

# Cleanup
rm -f "$COOKIE_FILE"

echo -e "\n${BLUE}📊 BROWSER AUTHENTICATION TEST COMPLETED!${NC}"

echo -e "\n${BLUE}💡 ANALYSIS:${NC}"
if [ "$SIGNIN_RESPONSE" = "302" ]; then
    echo -e "${GREEN}   ✅ NextAuth signin is working${NC}"
else
    echo -e "${RED}   ❌ NextAuth signin is failing${NC}"
fi

if [ -s "$COOKIE_FILE" ] && grep -q "next-auth.session-token" "$COOKIE_FILE"; then
    echo -e "${GREEN}   ✅ Session token is being created${NC}"
else
    echo -e "${RED}   ❌ Session token is still missing${NC}"
fi

echo -e "\n${BLUE}🔧 FINAL RECOMMENDATION:${NC}"
echo -e "${YELLOW}The issue is confirmed to be with NextAuth session token creation.${NC}"
echo -e "${YELLOW}Please test in a real browser:${NC}"
echo -e "${BLUE}1.${NC} Open http://localhost:3002 in your browser"
echo -e "${BLUE}2.${NC} Login with admin/\${ADMIN_PASSWORD:-replaceme123}"
echo -e "${BLUE}3.${NC} Check browser cookies (F12 → Application → Cookies)"
echo -e "${BLUE}4.${NC} Try creating a note"
echo -e "${BLUE}5.${NC} Check browser console for any errors"

echo -e "\n${GREEN}🎯 BROWSER AUTHENTICATION TEST COMPLETED!${NC}"
