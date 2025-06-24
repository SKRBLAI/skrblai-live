#!/usr/bin/env node

/**
 * 🎯 SKRBL AI - Auto N8N Setup
 * 
 * The EASIEST way to connect all your agents to N8N
 * Just run: node scripts/auto-setup-n8n.js
 */

const fs = require('fs');
const path = require('path');

// =============================================================================
// QUICK SETUP CONFIGURATION
// =============================================================================

const QUICK_SETUP = {
  // Your N8N instance details
  n8nUrl: process.env.N8N_BASE_URL || 'YOUR_N8N_URL_HERE',
  
  // All your agents (already configured)
  agents: [
    'percy-orchestration-master',
    'branding-identity-master', 
    'content-creation-master',
    'social-media-master',
    'analytics-insights-master',
    'ad-creative-master',
    'sitegen-website-master',
    'video-creation-master',
    'publishing-master',
    'payments-processing-master',
    'sync-master',
    'client-success-master',
    'proposal-generation-master',
    'business-strategy-master'
  ]
};

// =============================================================================
// INSTANT SETUP FUNCTIONS
// =============================================================================

function generateN8nCommands() {
  console.log('🚀 SKRBL AI - Auto N8N Setup Commands\n');
  console.log('🎯 OPTION 1: FASTEST SETUP (Recommended)\n');
  
  console.log('💡 Copy these webhook URLs into your agent configurations:\n');
  
  QUICK_SETUP.agents.forEach((workflowId, index) => {
    const webhookUrl = `${QUICK_SETUP.n8nUrl}/webhook/${workflowId}`;
    console.log(`${(index + 1).toString().padStart(2)}. ${workflowId}`);
    console.log(`   🔗 ${webhookUrl}\n`);
  });
  
  console.log('🔧 OPTION 2: ENVIRONMENT VARIABLES\n');
  console.log('Add these to your .env file:\n');
  
  QUICK_SETUP.agents.forEach(workflowId => {
    const envName = `N8N_WEBHOOK_${workflowId.toUpperCase().replace(/-/g, '_')}`;
    const webhookUrl = `${QUICK_SETUP.n8nUrl}/webhook/${workflowId}`;
    console.log(`${envName}=${webhookUrl}`);
  });
  
  console.log('\n🎯 OPTION 3: BULK WORKFLOW CREATION\n');
  console.log('Run this to create all workflows automatically:');
  console.log('node scripts/n8n-bulk-workflow-generator.js\n');
  
  console.log('⚡ QUICK START STEPS:\n');
  console.log('1. Set your N8N_BASE_URL environment variable');
  console.log('2. Copy webhook URLs above into N8N');
  console.log('3. Test with: curl -X POST [webhook_url] -d \'{"userPrompt":"test"}\'');
  console.log('4. All done! Your agents are connected! 🎉');
}

function createN8nTestScript() {
  const testScript = `#!/usr/bin/env node

/**
 * Test all N8N webhooks quickly
 */

const testWebhooks = async () => {
  const webhooks = [
${QUICK_SETUP.agents.map(workflowId => 
    `    '${QUICK_SETUP.n8nUrl}/webhook/${workflowId}'`
  ).join(',\n')}
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
      
      console.log(\`✅ \${webhook.split('/').pop()}: \${response.status}\`);
    } catch (error) {
      console.log(\`❌ \${webhook.split('/').pop()}: ERROR\`);
    }
  }
};

testWebhooks();`;

  fs.writeFileSync(path.join(__dirname, 'test-n8n-webhooks.js'), testScript);
  console.log('📝 Created test script: scripts/test-n8n-webhooks.js');
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

function main() {
  if (QUICK_SETUP.n8nUrl === 'YOUR_N8N_URL_HERE') {
    console.log('❌ Please set your N8N_BASE_URL environment variable first!');
    console.log('💡 Example: export N8N_BASE_URL=https://your-n8n-instance.com');
    return;
  }
  
  generateN8nCommands();
  createN8nTestScript();
  
  console.log('\n🎉 Auto setup complete! Follow the steps above to connect N8N.');
}

if (require.main === module) {
  main();
} 