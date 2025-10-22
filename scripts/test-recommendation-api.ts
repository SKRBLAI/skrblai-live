/**
 * Test Script for Agent Recommendation API
 * 
 * Run with: npx ts-node scripts/test-recommendation-api.ts
 * Or: npm run test:api
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

interface TestCase {
  name: string;
  endpoint: string;
  expected: string;
}

const testCases: TestCase[] = [
  {
    name: 'Branding Mission',
    endpoint: '/api/agents?recommend=true&mission=branding&type=business',
    expected: 'Should return branding, contentcreation, adcreative'
  },
  {
    name: 'Sports Mission',
    endpoint: '/api/agents?recommend=true&mission=sports&type=sports',
    expected: 'Should return skillsmith'
  },
  {
    name: 'Content Mission',
    endpoint: '/api/agents?recommend=true&mission=content&type=business',
    expected: 'Should return contentcreation, social, publishing'
  },
  {
    name: 'Analytics Mission',
    endpoint: '/api/agents?recommend=true&mission=analytics&type=business',
    expected: 'Should return analytics, biz'
  },
  {
    name: 'Unknown Mission (Fallback)',
    endpoint: '/api/agents?recommend=true&mission=unknown&type=business',
    expected: 'Should return percy as fallback'
  }
];

async function testRecommendationAPI() {
  console.log('🧪 Testing Agent Recommendation API\n');
  console.log('━'.repeat(60));
  
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      console.log(`\n📝 Test: ${testCase.name}`);
      console.log(`   URL: ${testCase.endpoint}`);
      
      const response = await fetch(`${BASE_URL}${testCase.endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ✅ Success: ${data.success}`);
      console.log(`   ✅ Mission: ${data.mission}`);
      console.log(`   ✅ Count: ${data.count} agents`);
      
      if (data.recommendedAgents && data.recommendedAgents.length > 0) {
        console.log(`   ✅ Agents: ${data.recommendedAgents.map((a: any) => a.id).join(', ')}`);
        console.log(`   ✅ Primary: ${data.primaryAgent?.name || 'None'}`);
        passed++;
      } else {
        console.log(`   ⚠️  No agents returned`);
        failed++;
      }
      
      console.log(`   Expected: ${testCase.expected}`);
      
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '━'.repeat(60));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
  
  if (failed === 0) {
    console.log('✅ All tests passed!\n');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed.\n');
    process.exit(1);
  }
}

async function testChatAPI() {
  console.log('\n🧪 Testing Agent Chat API\n');
  console.log('━'.repeat(60));
  
  try {
    console.log('\n📝 Test: Non-Streaming Chat with Branding Agent');
    
    const response = await fetch(`${BASE_URL}/api/agents/chat/branding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hello! Can you help me create a brand identity?',
        conversationHistory: [],
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Success: ${data.success}`);
    console.log(`   ✅ Agent: ${data.agentName} (${data.superheroName})`);
    console.log(`   ✅ Message Length: ${data.message?.length || 0} characters`);
    console.log(`   ✅ Personality Injected: ${data.personalityInjected}`);
    
    console.log('\n✅ Chat API test passed!\n');
    
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
}

async function runAllTests() {
  console.log('\n🚀 Starting API Tests...\n');
  
  await testRecommendationAPI();
  await testChatAPI();
  
  console.log('━'.repeat(60));
  console.log('\n✅ All API tests completed!\n');
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { testRecommendationAPI, testChatAPI, runAllTests };

