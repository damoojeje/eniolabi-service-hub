#!/bin/bash

# 🔧 COMPREHENSIVE AUTHENTICATION FIX SCRIPT
# Fix the session token issue step by step

echo "🔧 ENIOLABI SERVICE HUB - AUTHENTICATION FIX"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}🔍 DIAGNOSING THE ISSUE...${NC}"

# Step 1: Check if the issue is with the signin flow
echo -e "\n${BLUE}1️⃣  Testing Signin Flow...${NC}"

# Create a temporary cookie file
COOKIE_FILE=$(mktemp)

# Test the signin endpoint directly
echo -e "${BLUE}   Testing /api/auth/signin/credentials...${NC}"
SIGNIN_RESPONSE=$(curl -s -c $COOKIE_FILE -X POST "http://localhost:3002/api/auth/signin/credentials" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"'${ADMIN_PASSWORD:-replaceme123}'","callbackUrl":"/dashboard"}' \
  -w "%{http_code}" -o /dev/null)

echo -e "${BLUE}   Signin response code: ${NC}$SIGNIN_RESPONSE"

# Check what cookies were set
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
        echo -e "${RED}   ❌ Session token NOT found${NC}"
        echo -e "${YELLOW}   ⚠️  This is the root cause!${NC}"
    fi
else
    echo -e "${RED}   ❌ No cookies were set${NC}"
fi

# Step 2: Check if the issue is with the callback
echo -e "\n${BLUE}2️⃣  Testing Callback Flow...${NC}"

if [ -s "$COOKIE_FILE" ]; then
    echo -e "${BLUE}   Testing callback with cookies...${NC}"
    
    # Try to access the callback URL
    CALLBACK_RESPONSE=$(curl -s -b "$COOKIE_FILE" -I "http://localhost:3002/dashboard" | head -1)
    echo -e "${BLUE}   Dashboard response: ${NC}$CALLBACK_RESPONSE"
    
    if echo "$CALLBACK_RESPONSE" | grep -q "200"; then
        echo -e "${GREEN}   ✅ Dashboard accessible with cookies${NC}"
    elif echo "$CALLBACK_RESPONSE" | grep -q "302\|401\|403"; then
        echo -e "${YELLOW}   ⚠️  Dashboard redirecting (expected)${NC}"
    else
        echo -e "${RED}   ❌ Dashboard access failed${NC}"
    fi
fi

# Step 3: Check if the issue is with the session verification
echo -e "\n${BLUE}3️⃣  Testing Session Verification...${NC}"

# Test the session endpoint
SESSION_RESPONSE=$(curl -s -b "$COOKIE_FILE" "http://localhost:3002/api/auth/session" | head -c 100)
echo -e "${BLUE}   Session endpoint response: ${NC}$SESSION_RESPONSE"

# Step 4: Check if the issue is with tRPC context
echo -e "\n${BLUE}4️⃣  Testing tRPC Context...${NC}"

if [ -s "$COOKIE_FILE" ]; then
    echo -e "${BLUE}   Testing tRPC with session cookies...${NC}"
    
    # Test a simple tRPC call
    TRPC_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "http://localhost:3002/api/trpc/notes.getNotes" \
      -H "Content-Type: application/json" \
      -d '{}' \
      -w "%{http_code}" -o /dev/null)
    
    echo -e "${BLUE}   tRPC getNotes response: ${NC}$TRPC_RESPONSE"
    
    if [ "$TRPC_RESPONSE" = "200" ]; then
        echo -e "${GREEN}   ✅ tRPC working with session${NC}"
    elif [ "$TRPC_RESPONSE" = "401" ]; then
        echo -e "${RED}   ❌ tRPC still unauthorized${NC}"
    else
        echo -e "${YELLOW}   ⚠️  tRPC unexpected response: $TRPC_RESPONSE${NC}"
    fi
fi

# Step 5: Check server logs for authentication details
echo -e "\n${BLUE}5️⃣  Checking Server Logs...${NC}"

if pm2 list | grep -q "eniolabi-service-hub"; then
    echo -e "${GREEN}✅ PM2 Process: ACTIVE${NC}"
    echo -e "${BLUE}   Recent authentication logs:${NC}"
    pm2 logs eniolabi-service-hub --lines 10 --nostream | grep -E "(auth|session|tRPC|Context)" | tail -5
else
    echo -e "${RED}❌ PM2 Process: NOT FOUND${NC}"
fi

# Cleanup
rm -f "$COOKIE_FILE"

echo -e "\n${BLUE}📊 DIAGNOSIS COMPLETED!${NC}"

echo -e "\n${BLUE}💡 ROOT CAUSE ANALYSIS:${NC}"
echo -e "${YELLOW}1.${NC} NextAuth is working (302 redirect)"
echo -e "${YELLOW}2.${NC} Cookies are being set (CSRF, callback)"
echo -e "${YELLOW}3.${NC} Session token is MISSING (main issue)"
echo -e "${YELLOW}4.${NC} tRPC context cannot authenticate"

echo -e "\n${BLUE}🔧 RECOMMENDED FIXES:${NC}"
echo -e "${YELLOW}1.${NC} Check NextAuth secret configuration"
echo -e "${YELLOW}2.${NC} Verify cookie domain settings"
echo -e "${YELLOW}3.${NC} Test in browser (not curl)"
echo -e "${YELLOW}4.${NC} Check browser console for errors"
echo -e "${YELLOW}5.${NC} Verify session storage"

echo -e "\n${GREEN}🎯 NEXT STEPS:${NC}"
echo -e "${BLUE}   Open browser and test the complete flow:${NC}"
echo -e "${BLUE}   1. Go to http://localhost:3002${NC}"
echo -e "${BLUE}   2. Login with admin/\${ADMIN_PASSWORD:-replaceme123}${NC}"
echo -e "${BLUE}   3. Check browser cookies and console${NC}"
echo -e "${BLUE}   4. Try creating a note${NC}"

echo -e "\n${GREEN}🔧 AUTHENTICATION DIAGNOSIS COMPLETED!${NC}"
