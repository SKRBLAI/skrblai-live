#!/bin/bash

# Test Script for Agent Recommendation API
# Run with: bash scripts/test-api.sh

BASE_URL=${NEXT_PUBLIC_BASE_URL:-"http://localhost:3000"}

echo "🧪 Testing Agent Recommendation API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 1: Branding Mission
echo ""
echo "📝 Test 1: Branding Mission"
curl -s "${BASE_URL}/api/agents?recommend=true&mission=branding&type=business" | jq '.success, .mission, .count, .recommendedAgents[].id'

# Test 2: Sports Mission
echo ""
echo "📝 Test 2: Sports Mission"
curl -s "${BASE_URL}/api/agents?recommend=true&mission=sports&type=sports" | jq '.success, .mission, .count, .recommendedAgents[].id'

# Test 3: Content Mission
echo ""
echo "📝 Test 3: Content Mission"
curl -s "${BASE_URL}/api/agents?recommend=true&mission=content&type=business" | jq '.success, .mission, .count, .recommendedAgents[].id'

# Test 4: Analytics Mission
echo ""
echo "📝 Test 4: Analytics Mission"
curl -s "${BASE_URL}/api/agents?recommend=true&mission=analytics&type=business" | jq '.success, .mission, .count, .recommendedAgents[].id'

# Test 5: Unknown Mission (Should fallback to Percy)
echo ""
echo "📝 Test 5: Unknown Mission (Fallback to Percy)"
curl -s "${BASE_URL}/api/agents?recommend=true&mission=unknown&type=business" | jq '.success, .mission, .count, .recommendedAgents[].id'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ API tests completed!"
echo ""

# Test Chat API (Non-Streaming)
echo "🧪 Testing Chat API (Non-Streaming)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
curl -X POST "${BASE_URL}/api/agents/chat/branding" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello! Can you help me with branding?",
    "conversationHistory": [],
    "stream": false
  }' | jq '.success, .agentName, .superheroName, .personalityInjected'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ All tests completed!"
echo ""

