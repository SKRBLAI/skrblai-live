#!/usr/bin/env node

/**
 * 🧪 SKRBL AI - Test All Agent Webhooks
 * Tests all 14 existing N8N workflows to ensure they're working
 */

const AGENT_WEBHOOKS = [
  {
    name: 'Percy Orchestration Master',
    endpoint: 'percy-orchestration-master',
    url: 'https://skrblai.app.n8n.cloud/webhook/percy-orchestration-master'
  },
  {
    name: 'Branding Identity Master',
    endpoint: 'branding-identity-master',
    url: 'https://skrblai.app.n8n.cloud/webhook/branding-identity-master'
  },
  {
    name: 'Content Creation Master',
    endpoint: 'content-creation-master',
    url: 'https://skrblai.app.n8n.cloud/webhook/content-creation-master'
  },
  {
    name: 'Social Media Master',
    endpoint: 'social-media-master',
    url: 'https://skrblai.app.n8n.cloud/webhook/social-media-master'
  },
  {
    name: 'Analytics Insights Master',
    endpoint: 'analytics-insights-master',
    url: 'https://skrblai.app.n8n.cloud/webhook/analytics-insights-master'
  },
  {
    name: 'Ad Creative Master',
    endpoint: 'ad-creative-master',
    url: 'https://skrblai.app.n8n.cloud/webhook/ad-creative-master'
  },
  {
    name: 'SiteGen Website Master',
    endpoint: 'sitegen-website-master',
    url: 'https://skrblai.app.n8n.cloud/webhook/sitegen-website-master'
  },
  {
    name: 'Video Creation Master',
    endpoint: 'video-creation-master',
    url: 'https://skrblai.app.n8n.cloud/webhook/video-creation-master'
  },
  {
    name: 'Publishing Master',
    endpoint: 'publishing-master',
    url: 'https://skrblai.app.n8n.cloud/webhook/publishing-master'
  },
  {
    name: 'Payments Processing Master',
    endpoint: 'payments-processing-master',
    url: 'https://skrblai.app.n8n.cloud/webhook/payments-processing-master'
  },
  {
    name: 'Sync Master',
    endpoint: 'sync-master',
    url: 'https://skrblai.app.n8n.cloud/webhook/sync-master'
  },
  {
    name: 'Client Success Master',
    endpoint: 'client-success-master',
    url: 'https://skrblai.app.n8n.cloud/webhook/client-success-master'
  },
  {
    name: 'Proposal Generation Master',
    endpoint: 'proposal-generation-master',
    url: 'https://skrblai.app.n8n.cloud/webhook/proposal-generation-master'
  },
  {
    name: 'Business Strategy Master',
    endpoint: 'business-strategy-master',
    url: 'https://skrblai.app.n8n.cloud/webhook/business-strategy-master'
  }
];

async function testWebhook(webhook) {
  const testPayload = {
    message: `Test from SKRBL AI Platform`,
    agent: webhook.endpoint,
    timestamp: new Date().toISOString(),
    test: true
  };

  try {
    console.log(`🧪 Testing ${webhook.name}...`);
    
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const responseText = await response.text();
    
    if (response.ok) {
      console.log(`✅ ${webhook.name}: SUCCESS (${response.status})`);
      if (responseText) {
        console.log(`   📝 Response: ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`);
      }
      return { webhook: webhook.endpoint, status: 'success', response: responseText };
    } else {
      console.log(`❌ ${webhook.name}: FAILED (${response.status})`);
      console.log(`   🔍 Error: ${responseText}`);
      return { webhook: webhook.endpoint, status: 'failed', error: `${response.status}: ${responseText}` };
    }
    
  } catch (error) {
    console.log(`❌ ${webhook.name}: ERROR`);
    console.log(`   🔍 ${error.message}`);
    return { webhook: webhook.endpoint, status: 'error', error: error.message };
  }
}

async function testAllWebhooks() {
  console.log('🚀 SKRBL AI - Testing All Agent Webhooks\n');
  console.log(`Testing ${AGENT_WEBHOOKS.length} webhook endpoints...\n`);
  
  const results = [];
  let successful = 0;
  let failed = 0;
  
  for (const webhook of AGENT_WEBHOOKS) {
    const result = await testWebhook(webhook);
    results.push(result);
    
    if (result.status === 'success') {
      successful++;
    } else {
      failed++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 WEBHOOK TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successful}/${AGENT_WEBHOOKS.length}`);
  console.log(`❌ Failed: ${failed}/${AGENT_WEBHOOKS.length}`);
  
  if (successful === AGENT_WEBHOOKS.length) {
    console.log('\n🎉 ALL WEBHOOKS ARE WORKING PERFECTLY!');
    console.log('Your N8N integration is ready for production! 🚀');
  } else if (successful > 0) {
    console.log('\n⚠️  Some webhooks need attention:');
    results.filter(r => r.status !== 'success').forEach(r => {
      console.log(`   ❌ ${r.webhook}: ${r.error}`);
    });
  } else {
    console.log('\n💥 No webhooks are responding. Check your N8N configuration.');
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Activate any inactive workflows in N8N');
  console.log('2. Configure OpenAI credentials in N8N');
  console.log('3. Test agent responses from your dashboard');
  console.log('4. Monitor workflow executions in N8N');
  
  return results;
}

async function main() {
  try {
    await testAllWebhooks();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main(); 