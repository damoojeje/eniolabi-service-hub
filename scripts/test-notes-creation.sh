#!/bin/bash

# 📝 NOTES CREATION TEST SCRIPT
# Test the complete flow from login to note creation

echo "📝 ENIOLABI SERVICE HUB - NOTES CREATION TEST"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}🔍 Testing Complete Notes Creation Flow...${NC}"

# Step 1: Test server health
echo -e "\n${BLUE}1️⃣  Testing Server Health...${NC}"
if curl -s -I http://localhost:3002 > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Server: RESPONDING${NC}"
else
    echo -e "${RED}   ❌ Server: NOT RESPONDING${NC}"
    exit 1
fi

# Step 2: Test login page
echo -e "\n${BLUE}2️⃣  Testing Login Page...${NC}"
if curl -s http://localhost:3002/auth/signin | grep -q "signin\|login" 2>/dev/null; then
    echo -e "${GREEN}   ✅ Login Page: ACCESSIBLE${NC}"
else
    echo -e "${RED}   ❌ Login Page: NOT ACCESSIBLE${NC}"
    exit 1
fi

# Step 3: Test authentication flow
echo -e "\n${BLUE}3️⃣  Testing Authentication Flow...${NC}"

# Create a temporary cookie file
COOKIE_FILE=$(mktemp)

# Test login (this will fail but should show us the response)
echo -e "${BLUE}   Testing login endpoint...${NC}"
LOGIN_RESPONSE=$(curl -s -c $COOKIE_FILE -X POST "http://localhost:3002/api/auth/signin/credentials" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"'${ADMIN_PASSWORD:-replaceme123}'","callbackUrl":"/dashboard"}' \
  -w "%{http_code}" -o /dev/null)

echo -e "${BLUE}   Login response code: ${NC}$LOGIN_RESPONSE"

# Check if cookies were set
if [ -s "$COOKIE_FILE" ]; then
    echo -e "${GREEN}   ✅ Cookies: SET${NC}"
    echo -e "${BLUE}   Cookie contents:${NC}"
    cat "$COOKIE_FILE"
else
    echo -e "${YELLOW}   ⚠️  Cookies: NOT SET${NC}"
fi

# Step 4: Test notes creation with cookies
echo -e "\n${BLUE}4️⃣  Testing Notes Creation with Cookies...${NC}"

if [ -s "$COOKIE_FILE" ]; then
    echo -e "${BLUE}   Testing notes creation with session cookies...${NC}"
    
    # Extract session token from cookies
    SESSION_TOKEN=$(grep "next-auth.session-token" "$COOKIE_FILE" | awk '{print $7}')
    
    if [ -n "$SESSION_TOKEN" ]; then
        echo -e "${GREEN}   ✅ Session token found: ${NC}${SESSION_TOKEN:0:20}..."
        
        # Test notes creation with session
        NOTES_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "http://localhost:3002/api/trpc/notes.createNote" \
          -H "Content-Type: application/json" \
          -d '{"title":"Test Note","content":"Test content","category":"general","tags":[],"isPinned":false}' \
          -w "%{http_code}" -o /dev/null)
        
        echo -e "${BLUE}   Notes creation response: ${NC}$NOTES_RESPONSE"
        
        if [ "$NOTES_RESPONSE" = "200" ]; then
            echo -e "${GREEN}   ✅ Notes Creation: SUCCESSFUL${NC}"
        elif [ "$NOTES_RESPONSE" = "401" ]; then
            echo -e "${RED}   ❌ Notes Creation: UNAUTHORIZED (session issue)${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Notes Creation: UNEXPECTED RESPONSE ($NOTES_RESPONSE)${NC}"
        fi
    else
        echo -e "${RED}   ❌ Session token: NOT FOUND${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Skipping notes test (no cookies)${NC}"
fi

# Step 5: Test without cookies (should fail)
echo -e "\n${BLUE}5️⃣  Testing Notes Creation without Cookies...${NC}"
NO_COOKIE_RESPONSE=$(curl -s -X POST "http://localhost:3002/api/trpc/notes.createNote" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Note","content":"Test content","category":"general","tags":[],"isPinned":false}' \
  -w "%{http_code}" -o /dev/null)

if [ "$NO_COOKIE_RESPONSE" = "401" ]; then
    echo -e "${GREEN}   ✅ No-cookie test: CORRECTLY REJECTED (401)${NC}"
else
    echo -e "${RED}   ❌ No-cookie test: UNEXPECTED RESPONSE ($NO_COOKIE_RESPONSE)${NC}"
fi

# Cleanup
rm -f "$COOKIE_FILE"

echo -e "\n${BLUE}📊 Test Summary...${NC}"
echo -e "${BLUE}   Server Health: ${NC}✅"
echo -e "${BLUE}   Login Page: ${NC}✅"
echo -e "${BLUE}   Authentication: ${NC}${YELLOW}⚠️  (Check cookies)${NC}"
echo -e "${BLUE}   Notes Creation: ${NC}${YELLOW}⚠️  (Depends on auth)${NC}"

echo -e "\n${BLUE}💡 Next Steps...${NC}"
echo -e "${YELLOW}1.${NC} Open browser and go to http://localhost:3002"
echo -e "${YELLOW}2.${NC} Login with admin/\${ADMIN_PASSWORD:-replaceme123}"
echo -e "${YELLOW}3.${NC} Check browser cookies (F12 → Application → Cookies)"
echo -e "${YELLOW}4.${NC} Try creating a note"
echo -e "${YELLOW}5.${NC} Check browser console for errors"

echo -e "\n${GREEN}🎯 NOTES CREATION TEST COMPLETED!${NC}"
echo -e "${BLUE}   The issue is likely in the session cookie handling.${NC}"
echo -e "${BLUE}   Check the browser authentication flow.${NC}"
