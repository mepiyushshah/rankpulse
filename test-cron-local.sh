#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Testing Cron Job Locally${NC}"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local file not found!${NC}"
    exit 1
fi

# Extract CRON_SECRET from .env.local
CRON_SECRET=$(grep CRON_SECRET .env.local | cut -d '=' -f2)

if [ -z "$CRON_SECRET" ]; then
    echo -e "${RED}❌ CRON_SECRET not found in .env.local${NC}"
    exit 1
fi

echo -e "${YELLOW}📡 Calling cron endpoint...${NC}"
echo ""

# Make the request
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3000/api/cron/generate-articles" \
  -H "Authorization: Bearer $CRON_SECRET")

# Extract status code and body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo -e "${YELLOW}Status Code: $HTTP_CODE${NC}"
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Success!${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
    echo -e "${RED}❌ Failed!${NC}"
    echo ""
    echo "Response:"
    echo "$BODY"
fi

echo ""
echo -e "${YELLOW}💡 Tip: Check your terminal running 'npm run dev' for detailed logs${NC}"
