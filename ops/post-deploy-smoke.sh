#!/bin/bash
set -e

BASE="https://skrblai.io"
echo "🚀 Post-deploy smoke tests for $BASE"

# Function to check HTTP status and response
check_endpoint() {
  local url=$1
  local expected_status=${2:-200}
  local description=$3
  
  echo "Testing: $description"
  
  # Get status code
  status=$(curl -Is "$url" | head -n1 | cut -d' ' -f2)
  
  if [ "$status" = "$expected_status" ]; then
    echo "✅ $url → $status (expected $expected_status)"
  else
    echo "❌ $url → $status (expected $expected_status)"
    return 1
  fi
}

# Function to check for redirect chains
check_redirects() {
  local url=$1
  local max_redirects=${2:-1}
  local description=$3
  
  echo "Checking redirect chain: $description"
  
  # Get redirect count
  redirects=$(curl -Is "$url" | grep -c "^HTTP" || echo "1")
  redirects=$((redirects - 1))  # Subtract final response
  
  if [ "$redirects" -le "$max_redirects" ]; then
    echo "✅ $url → $redirects redirects (max allowed: $max_redirects)"
  else
    echo "❌ $url → $redirects redirects (max allowed: $max_redirects)"
    return 1
  fi
}

# Function to check for port numbers in response
check_no_ports() {
  local url=$1
  local description=$2
  
  echo "Checking for port numbers: $description"
  
  # Get response body and check for :8080 or similar
  response=$(curl -s "$url" | grep -o ":[0-9]\{4,5\}" | head -5 || true)
  
  if [ -z "$response" ]; then
    echo "✅ $url → No port numbers found in response"
  else
    echo "❌ $url → Found port numbers: $response"
    return 1
  fi
}

echo
echo "=== Testing Core Endpoints ==="

# Test health endpoint
check_endpoint "$BASE/api/health" 200 "Health endpoint"

# Test homepage
check_endpoint "$BASE/" 200 "Homepage"

# Test key pages
check_endpoint "$BASE/sports" 200 "Sports page"
check_endpoint "$BASE/agents" 200 "Agents page"

echo
echo "=== Testing Redirect Behavior ==="

# Test www redirect (should redirect www to apex)
check_redirects "https://www.skrblai.io/" 1 "WWW to apex redirect"

# Test that apex doesn't redirect
check_redirects "$BASE/" 0 "Apex domain (no redirects)"

echo
echo "=== Testing URL Hygiene ==="

# Check that responses don't contain port numbers
check_no_ports "$BASE/" "Homepage content"
check_no_ports "$BASE/api/health" "Health endpoint content"

echo
echo "=== Health Check Content ==="

# Verify health endpoint returns expected JSON
health_response=$(curl -s "$BASE/api/health")
if echo "$health_response" | grep -q '"ok":true'; then
  echo "✅ Health endpoint returns valid JSON with ok:true"
else
  echo "❌ Health endpoint response: $health_response"
  exit 1
fi

echo
echo "🎉 All smoke tests passed!"
echo "✅ $BASE is live and healthy"