#!/usr/bin/env node

/**
 * Test all N8N webhooks quickly
 */

const testWebhooks = async () => {
  const webhooks = [
    'https://skrblai.app.n8n.cloud/webhook/percy-orchestration-master',
    'https://skrblai.app.n8n.cloud/webhook/branding-identity-master',
    'https://skrblai.app.n8n.cloud/webhook/content-creation-master',
    'https://skrblai.app.n8n.cloud/webhook/social-media-master',
    'https://skrblai.app.n8n.cloud/webhook/analytics-insights-master',
    'https://skrblai.app.n8n.cloud/webhook/ad-creative-master',
    'https://skrblai.app.n8n.cloud/webhook/sitegen-website-master',
    'https://skrblai.app.n8n.cloud/webhook/video-creation-master',
    'https://skrblai.app.n8n.cloud/webhook/publishing-master',
    'https://skrblai.app.n8n.cloud/webhook/payments-processing-master',
    'https://skrblai.app.n8n.cloud/webhook/sync-master',
    'https://skrblai.app.n8n.cloud/webhook/client-success-master',
    'https://skrblai.app.n8n.cloud/webhook/proposal-generation-master',
    'https://skrblai.app.n8n.cloud/webhook/business-strategy-master'
  ];
  
  console.log('🧪 Testing N8N webhooks...');
  
  for (const webhook of webhooks) {
    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userPrompt: 'Test message',
          agentId: 'test',
          timestamp: new Date().toISOString()
        })
      });
      
      console.log(`✅ ${webhook.split('/').pop()}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${webhook.split('/').pop()}: ERROR`);
    }
  }
};

testWebhooks();