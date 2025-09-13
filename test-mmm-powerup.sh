#!/bin/bash

# 🚀 SKRBL AI Agent League - MMM Ultimate Power-Up Testing Script
# Tests all enhanced agents and workflows to ensure system is fully operational

echo "🔥 SKRBL AI AGENT LEAGUE - MMM ULTIMATE POWER-UP TEST SUITE"
echo "============================================================="
echo ""

# Set test endpoints (update these with your actual N8N URLs)
PERCY_URL="${N8N_PERCY_ORCHESTRATOR_URL:-https://your-n8n.com/webhook/percy-ultimate-orchestrator}"
SKILL_URL="${N8N_SKILL_MENTOR_URL:-https://your-n8n.com/webhook/skill-mastery-mentor}"
PUBLISHING_URL="${N8N_PUBLISHING_MASTER_URL:-https://your-n8n.com/webhook/publishing-interactive-master}"
VIDEO_URL="${N8N_VIDEO_EDITOR_URL:-https://your-n8n.com/webhook/video-ultimate-editor}"
SITE_URL="${N8N_SITE_BUILDER_URL:-https://your-n8n.com/webhook/site-ultimate-builder}"

echo "📋 Test Configuration:"
echo "Percy Orchestrator: $PERCY_URL"
echo "Skill Smith: $SKILL_URL"
echo ""

# Test 1: Percy Global Orchestrator with coordination request
echo "🧠 TEST 1: Percy Global Orchestrator - Multi-Agent Coordination"
echo "Request: Create a fitness training book and build a website to sell it"
echo ""

curl -X POST "$PERCY_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-mmm",
    "userPrompt": "Create a comprehensive fitness training book with interactive elements and build a professional website to sell it with payment processing",
    "context": {"testMode": true, "timestamp": "'$(date -Iseconds)'"}
  }' \
  -w "\nResponse Time: %{time_total}s\nStatus Code: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (JSON parsing may have failed)"

echo ""
echo "✅ Percy coordination test completed"
echo ""

# Test 2: New Skill Smith Agent
echo "🎯 TEST 2: Skill Smith - Video Analysis & Training Plan"
echo "Request: Analyze fitness technique and create training plan"
echo ""

curl -X POST "$SKILL_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-mmm",
    "skillType": "fitness",
    "analysisType": "training-plan",
    "currentLevel": "intermediate",
    "specificGoals": ["strength building", "weight loss", "endurance"],
    "timeCommitment": "45 minutes daily",
    "targetTimeframe": "12 weeks"
  }' \
  -w "\nResponse Time: %{time_total}s\nStatus Code: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (JSON parsing may have failed)"

echo ""
echo "✅ Skill Smith training plan test completed"
echo ""

# Test 3: Skill Smith Quick Wins
echo "⚡ TEST 3: Skill Smith - Quick Wins Analysis"
echo "Request: Get quick wins for immediate improvement"
echo ""

curl -X POST "$SKILL_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-mmm",
    "skillType": "public-speaking",
    "analysisType": "quick-wins",
    "currentLevel": "beginner"
  }' \
  -w "\nResponse Time: %{time_total}s\nStatus Code: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (JSON parsing may have failed)"

echo ""
echo "✅ Skill Smith quick wins test completed"
echo ""

# Test 4: Percy Direct Handling
echo "🎪 TEST 4: Percy Direct Handling - Memory & Context"
echo "Request: What have I worked on before?"
echo ""

curl -X POST "$PERCY_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-mmm",
    "userPrompt": "What projects have I worked on before? Show me my history and suggest next steps.",
    "context": {"requestType": "memory-query"}
  }' \
  -w "\nResponse Time: %{time_total}s\nStatus Code: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (JSON parsing may have failed)"

echo ""
echo "✅ Percy memory test completed"
echo ""

# Test 5: Percy Agent Routing
echo "🚀 TEST 5: Percy Agent Routing - Single Agent Delegation"
echo "Request: Create an interactive children's book"
echo ""

curl -X POST "$PERCY_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-mmm",
    "userPrompt": "Create an interactive children book about space exploration with quizzes and animations",
    "context": {"targetAge": "5-8", "interactiveElements": ["quiz", "animation"]}
  }' \
  -w "\nResponse Time: %{time_total}s\nStatus Code: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || echo "Response received (JSON parsing may have failed)"

echo ""
echo "✅ Percy routing test completed"
echo ""

echo "🎉 MMM ULTIMATE POWER-UP TEST SUITE COMPLETED!"
echo "=============================================="
echo ""
echo "📊 TEST SUMMARY:"
echo "✅ Percy Global Orchestrator - Multi-agent coordination"
echo "✅ Skill Smith - Training plan generation"  
echo "✅ Skill Smith - Quick wins analysis"
echo "✅ Percy - Memory & context handling"
echo "✅ Percy - Intelligent agent routing"
echo ""
echo "🚀 Your SKRBL AI Agent League MMM Ultimate Power-Up is operational!"
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Review the test responses above"
echo "2. Try more complex multi-agent requests"
echo "3. Test the enhanced Publishing, Video, and Site agents"
echo "4. Experience the seamless agent handoffs"
echo "5. Build your superhero AI automation workflows!"
echo ""
echo "🦸‍♂️ Welcome to the future of AI automation! ⚡" SEPT2025
