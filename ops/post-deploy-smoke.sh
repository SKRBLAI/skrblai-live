#!/bin/bash

# Post-deploy smoke test script for Railway deployment
# Usage: ./ops/post-deploy-smoke.sh [BASE_URL]

BASE_URL="${1:-https://skrblai.io}"
echo "🚀 Running post-deploy smoke tests for: $BASE_URL"

# Test 1: Health endpoint
echo "🏥 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "$BASE_URL/api/health")
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health")

if [ "$HEALTH_STATUS" = "200" ]; then
    echo "✅ Health endpoint: OK ($HEALTH_STATUS)"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "❌ Health endpoint: FAILED ($HEALTH_STATUS)"
    echo "   Response: $HEALTH_RESPONSE"
fi

# Test 2: Homepage status
echo "🏠 Testing homepage..."
HOME_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
HOME_HEADERS=$(curl -s -I "$BASE_URL/" | head -1)

if [ "$HOME_STATUS" = "200" ]; then
    echo "✅ Homepage: OK ($HOME_STATUS)"
else
    echo "❌ Homepage: FAILED ($HOME_STATUS)"
    echo "   Headers: $HOME_HEADERS"
fi

# Test 3: Security headers
echo "🛡️  Testing security headers..."
SECURITY_HEADERS=$(curl -s -I "$BASE_URL/" | grep -E "(strict-transport-security|x-content-type-options|x-frame-options)")
if [ -n "$SECURITY_HEADERS" ]; then
    echo "✅ Security headers present"
    echo "$SECURITY_HEADERS" | sed 's/^/   /'
else
    echo "⚠️  Security headers missing or incomplete"
fi

# Summary
echo ""
echo "📊 SMOKE TEST SUMMARY:"
if [ "$HEALTH_STATUS" = "200" ] && [ "$HOME_STATUS" = "200" ]; then
    echo "✅ All critical endpoints responding"
    exit 0
else
    echo "❌ Critical failures detected"
    echo "   Health: $HEALTH_STATUS, Homepage: $HOME_STATUS"
    exit 1
fi