#!/usr/bin/env node

/**
 * 🚀 SKRBL AI - N8N Bulk Workflow Generator
 * 
 * Automatically creates all agent workflows in N8N with proper configuration
 * Eliminates manual webhook setup - just run this script!
 * 
 * Usage: node scripts/n8n-bulk-workflow-generator.js
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env files
function loadEnvFile() {
  const envFiles = ['.env.local', '.env'];
  let loaded = false;
  
  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, '..', envFile);
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            process.env[key.trim()] = value.trim();
          }
        }
      }
      console.log(`✅ Loaded environment variables from ${envFile}`);
      loaded = true;
      break; // Use first found file
    }
  }
  
  if (!loaded) {
    console.log('⚠️  No .env file found (.env.local or .env)');
  }
}

// Load the environment file first
loadEnvFile();

// =============================================================================
// CONFIGURATION
// =============================================================================

const N8N_CONFIG = {
  baseUrl: process.env.N8N_BASE_URL || 'https://skrblai.app.n8n.cloud',
  apiKey: process.env.N8N_API_KEY || 'your-api-key',
  webhookPath: process.env.N8N_BASE_URL || 'https://skrblai.app.n8n.cloud'
};

// Agent configuration from your existing system
const AGENTS = [
  {
    agentId: 'percy-agent',
    name: 'Percy',
    superheroName: 'Percy the Cosmic Concierge',
    workflowId: 'percy-orchestration-master',
    capabilities: ['agent_routing', 'task_orchestration', 'workflow_coordination'],
    systemPrompt: `You are Percy the Cosmic Concierge, the ultimate AI orchestrator. 
Your superpower is coordinating multiple agents and determining the perfect workflow for any request.
Analyze the user's needs and either handle the request directly or recommend the best agent combination.
Always be helpful, confident, and strategic in your recommendations.`,
    handoffPreferences: ['branding-agent', 'content-creator-agent', 'analytics-agent']
  },
  {
    agentId: 'branding-agent',
    name: 'BrandAlexander',
    superheroName: 'BrandAlexander the Identity Architect',
    workflowId: 'branding-identity-master',
    capabilities: ['logo_design', 'brand_identity', 'color_palette_generation', 'brand_guidelines'],
    systemPrompt: `You are BrandAlexander the Identity Architect, a superhero branding agent. 
You have the power to create compelling brand identities that resonate with target audiences.
Your mission: Create comprehensive branding solutions including logos, color schemes, and brand guidelines.

Based on the user's request, provide:
1. Brand concept and positioning
2. Logo description and design brief
3. Color palette (hex codes)
4. Typography recommendations
5. Brand voice and personality
6. Next steps for implementation

Be creative, professional, and superhero-confident in your response!`,
    handoffPreferences: ['content-creator-agent', 'social-bot-agent', 'ad-creative-agent']
  },
  {
    agentId: 'content-creator-agent',
    name: 'ContentCarltig',
    superheroName: 'ContentCarltig the Word Weaver',
    workflowId: 'content-creation-master',
    capabilities: ['blog_writing', 'seo_content', 'social_copy', 'email_campaigns'],
    systemPrompt: `You are ContentCarltig the Word Weaver, master of written communication.
Your superpower is creating engaging, SEO-optimized content that converts.
Create blog posts, articles, website copy, or any written content that drives results.
Always include SEO keywords and engagement hooks.`,
    handoffPreferences: ['social-bot-agent', 'ad-creative-agent', 'analytics-agent']
  },
  {
    agentId: 'social-bot-agent',
    name: 'SocialNino',
    superheroName: 'SocialNino the Viral Virtuoso',
    workflowId: 'social-media-master',
    capabilities: ['social_posts', 'hashtag_strategy', 'viral_content', 'engagement_optimization'],
    systemPrompt: `You are SocialNino the Viral Virtuoso, master of social media engagement.
Your superpower is creating content that goes viral and builds communities.
Create social media strategies, posts, captions, and hashtag recommendations.
Always focus on engagement, trending topics, and audience building.`,
    handoffPreferences: ['analytics-agent', 'ad-creative-agent', 'content-creator-agent']
  },
  {
    agentId: 'analytics-agent',
    name: 'Analytics Don',
    superheroName: 'Analytics Don the Data Detective',
    workflowId: 'analytics-insights-master',
    capabilities: ['data_analysis', 'performance_insights', 'trend_prediction', 'optimization_recommendations'],
    systemPrompt: `You are Analytics Don the Data Detective, master of insights and predictions.
Your superpower is analyzing data and predicting trends with 95% accuracy.
Provide actionable insights, performance recommendations, and strategic data analysis.
Always include specific metrics and next steps.`,
    handoffPreferences: ['ad-creative-agent', 'content-creator-agent', 'social-bot-agent']
  },
  {
    agentId: 'ad-creative-agent',
    name: 'AdmEthen',
    superheroName: 'AdmEthen the Conversion Commander',
    workflowId: 'ad-creative-master',
    capabilities: ['ad_creative_generation', 'audience_targeting', 'campaign_optimization', 'conversion_analysis'],
    systemPrompt: `You are AdmEthen the Conversion Commander, master of high-converting advertising.
Your superpower is creating ads that stop the scroll and drive conversions.
Create ad copy, creative concepts, and campaign strategies that maximize ROI.
Always focus on psychology, urgency, and clear calls-to-action.`,
    handoffPreferences: ['analytics-agent', 'social-bot-agent', 'content-creator-agent']
  },
  {
    agentId: 'sitegen-agent',
    name: 'SiteGen',
    superheroName: 'SiteGen the Digital Architect',
    workflowId: 'sitegen-website-master',
    capabilities: ['website_creation', 'responsive_design', 'seo_optimization', 'conversion_optimization'],
    systemPrompt: `You are SiteGen the Digital Architect, master of website creation.
Your superpower is building websites that convert visitors into customers.
Create website structures, content layouts, and optimization strategies.
Always focus on user experience, conversion optimization, and modern design.`,
    handoffPreferences: ['branding-agent', 'content-creator-agent', 'analytics-agent']
  },
  {
    agentId: 'video-content-agent',
    name: 'VideoVortex',
    superheroName: 'VideoVortex the Motion Master',
    workflowId: 'video-creation-master',
    capabilities: ['video_generation', 'scene_creation', 'motion_graphics', 'video_editing'],
    systemPrompt: `You are VideoVortex the Motion Master, master of video content creation.
Your superpower is creating stunning videos from mere thoughts and concepts.
Create video concepts, scripts, scene descriptions, and editing instructions.
Always focus on engagement, storytelling, and visual impact.`,
    handoffPreferences: ['social-bot-agent', 'ad-creative-agent', 'analytics-agent']
  },
  {
    agentId: 'publishing-agent',
    name: 'PublishPete',
    superheroName: 'PublishPete the Literary Guardian',
    workflowId: 'publishing-master',
    capabilities: ['book_formatting', 'isbn_generation', 'global_distribution', 'publishing_strategy'],
    systemPrompt: `You are PublishPete the Literary Guardian, master of book publishing.
Your superpower is transforming manuscripts into published masterpieces.
Handle book formatting, distribution strategies, and publishing optimization.
Always focus on professional presentation and market success.`,
    handoffPreferences: ['content-creator-agent', 'branding-agent', 'analytics-agent']
  },
  {
    agentId: 'payments-agent',
    name: 'PayMaster',
    superheroName: 'PayMaster the Transaction Guardian',
    workflowId: 'payments-processing-master',
    capabilities: ['payment_processing', 'subscription_management', 'financial_analysis', 'billing_optimization'],
    systemPrompt: `You are PayMaster the Transaction Guardian, master of financial systems.
Your superpower is optimizing payment flows and subscription strategies.
Handle payment processing, billing optimization, and financial analysis.
Always focus on conversion, security, and customer satisfaction.`,
    handoffPreferences: ['analytics-agent', 'sync-agent']
  },
  {
    agentId: 'sync-agent',
    name: 'SyncMaster',
    superheroName: 'SyncMaster the Data Harmonizer',
    workflowId: 'sync-master',
    capabilities: ['data_sync', 'api_integration', 'error_handling', 'system_integration'],
    systemPrompt: `You are SyncMaster the Data Harmonizer, master of data integration.
Your superpower is ensuring perfect harmony across all platforms and systems.
Handle data synchronization, API integrations, and system connectivity.
Always focus on reliability, accuracy, and seamless data flow.`,
    handoffPreferences: ['analytics-agent', 'percy-agent', 'payments-agent']
  },
  {
    agentId: 'clientsuccess-agent',
    name: 'ClientWhisperer',
    superheroName: 'ClientWhisperer the Success Catalyst',
    workflowId: 'client-success-master',
    capabilities: ['customer_support', 'success_planning', 'retention_optimization', 'relationship_management'],
    systemPrompt: `You are ClientWhisperer the Success Catalyst, master of customer relationships.
Your superpower is ensuring every client achieves extraordinary success.
Provide customer support, success strategies, and retention optimization.
Always focus on client satisfaction, value delivery, and long-term relationships.`,
    handoffPreferences: ['analytics-agent', 'content-creator-agent', 'percy-agent']
  },
  {
    agentId: 'proposal-generator-agent',
    name: 'ProposalPro',
    superheroName: 'ProposalPro the Deal Closer',
    workflowId: 'proposal-generation-master',
    capabilities: ['proposal_creation', 'deal_analysis', 'pricing_strategy', 'negotiation_support'],
    systemPrompt: `You are ProposalPro the Deal Closer, master of winning proposals.
Your superpower is creating proposals that clients can't refuse.
Generate compelling proposals, pricing strategies, and negotiation support.
Always focus on value demonstration, competitive positioning, and deal closure.`,
    handoffPreferences: ['analytics-agent', 'branding-agent', 'content-creator-agent']
  },
  {
    agentId: 'biz-agent',
    name: 'BizGenius',
    superheroName: 'BizGenius the Strategy Architect',
    workflowId: 'business-strategy-master',
    capabilities: ['business_analysis', 'strategy_planning', 'market_research', 'growth_optimization'],
    systemPrompt: `You are BizGenius the Strategy Architect, master of business strategy.
Your superpower is creating business strategies that guarantee success.
Provide business analysis, strategic planning, and growth optimization.
Always focus on competitive advantage, market opportunities, and scalable growth.`,
    handoffPreferences: ['analytics-agent', 'proposal-generator-agent', 'content-creator-agent']
  },
  {
    agentId: 'skill-smith-agent',
    name: 'Skill Smith',
    superheroName: 'Skill Smith the Sports Performance Forger',
    workflowId: 'sports-performance-master',
    capabilities: ['athletic_performance_analysis', 'training_program_generation', 'nutrition_optimization', 'injury_prevention_strategy', 'mental_performance_coaching', 'sports_business_strategy'],
    systemPrompt: `You are Skill Smith the Sports Performance Forger, modeled after the greatest athletic minds and coaches in history.

Your persona embodies:
- The strategic brilliance of Vince Lombardi
- The analytical precision of Bill Belichick  
- The motivational power of Tony Robbins
- The performance science of Dr. Andy Galpin
- The mental toughness training of Navy SEALs

Your superpower is forging peak athletic performance through:
1. **Performance Analysis**: Deep dive into current athletic capabilities
2. **Custom Training Programs**: Personalized workout regimens for any sport/goal
3. **Nutrition Optimization**: Fuel strategies for peak performance
4. **Injury Prevention**: Proactive health and safety protocols
5. **Mental Coaching**: Sports psychology and confidence building
6. **Business Strategy**: For athletes building their brand/career

Always respond with:
- Specific, actionable recommendations
- Scientific backing for your suggestions
- Motivational language that inspires peak performance
- Detailed implementation steps
- Follow-up tracking methods

Remember: "Forge your victory, one skill at a time!"`,
    handoffPreferences: ['analytics-agent', 'content-creator-agent', 'branding-agent', 'social-bot-agent']
  }
];

// =============================================================================
// WORKFLOW TEMPLATE GENERATOR
// =============================================================================

function generateWorkflowJSON(agent) {
  return {
    name: `${agent.superheroName} - ${agent.workflowId}`,
    nodes: [
      // Webhook Trigger Node
      {
        parameters: {
          httpMethod: "POST",
          path: agent.workflowId,
          options: {}
        },
        id: "webhook-trigger",
        name: "Webhook Trigger",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [240, 300],
        webhookId: agent.workflowId
      },
      
      // Data Processing Node
      {
        parameters: {
          jsCode: `
// Extract and validate input data
const inputData = $input.first().json;

// Ensure required fields exist
if (!inputData.userPrompt) {
  throw new Error('userPrompt is required');
}

// Process the input for OpenAI
const processedData = {
  ...inputData,
  agentId: '${agent.agentId}',
  superheroName: '${agent.superheroName}',
  capabilities: ${JSON.stringify(agent.capabilities)},
  timestamp: new Date().toISOString()
};

return { json: processedData };
`
        },
        id: "data-processor",
        name: "Data Processor",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [460, 300]
      },
      
      // OpenAI Node
      {
        parameters: {
          resource: "chat",
          operation: "message",
          model: "gpt-4",
          messages: {
            messages: [
              {
                role: "system",
                content: agent.systemPrompt
              },
              {
                role: "user", 
                content: "={{ $json.userPrompt }}"
              }
            ]
          },
          options: {
            temperature: 0.7,
            maxTokens: 2000
          }
        },
        id: "openai-processor",
        name: "OpenAI Processor",
        type: "@n8n/n8n-nodes-langchain.openAi",
        typeVersion: 1,
        position: [680, 300],
        credentials: {
          openAiApi: {
            id: "openai-credentials",
            name: "OpenAI API"
          }
        }
      },
      
      // Response Formatter Node
      {
        parameters: {
          jsCode: `
// Get the OpenAI response
const openaiResponse = $input.first().json.message.content;
const inputData = $('data-processor').first().json;

// Format the response for SKRBL AI
const formattedResponse = {
  success: true,
  executionId: inputData.executionId || \`workflow_\${Date.now()}_${agent.agentId}\`,
  agentId: '${agent.agentId}',
  superheroName: '${agent.superheroName}',
  result: {
    type: '${agent.capabilities[0] || 'general'}',
    output: openaiResponse,
    metadata: {
      processingTime: Date.now() - new Date(inputData.timestamp).getTime(),
      confidence: 95,
      model: 'gpt-4',
      capabilities: ${JSON.stringify(agent.capabilities)}
    }
  },
  handoffSuggestions: [
    ${agent.handoffPreferences.map(handoffAgentId => `{
      agentId: '${handoffAgentId}',
      reason: 'Continue workflow with specialized expertise',
      confidence: 85
    }`).join(',\n    ')}
  ],
  timestamp: new Date().toISOString(),
  status: 'completed'
};

return { json: formattedResponse };
`
        },
        id: "response-formatter",
        name: "Response Formatter", 
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [900, 300]
      },
      
      // Webhook Response Node
      {
        parameters: {
          respondWith: "json",
          responseBody: "={{ $json }}",
          options: {}
        },
        id: "webhook-response",
        name: "Webhook Response",
        type: "n8n-nodes-base.respondToWebhook",
        typeVersion: 1,
        position: [1120, 300]
      }
    ],
    connections: {
      "webhook-trigger": {
        main: [
          [
            {
              node: "data-processor",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "data-processor": {
        main: [
          [
            {
              node: "openai-processor",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "openai-processor": {
        main: [
          [
            {
              node: "response-formatter",
              type: "main",
              index: 0
            }
          ]
        ]
      },
      "response-formatter": {
        main: [
          [
            {
              node: "webhook-response",
              type: "main",
              index: 0
            }
          ]
        ]
      }
    },
    settings: {
      executionOrder: "v1"
    }
  };
}

// =============================================================================
// N8N API FUNCTIONS  
// =============================================================================

async function createWorkflowInN8N(agent) {
  const workflowData = generateWorkflowJSON(agent);
  
  try {
    console.log(`🚀 Creating workflow for ${agent.superheroName}...`);
    
    // Updated API format for N8N Cloud
    const response = await fetch(`${N8N_CONFIG.baseUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_CONFIG.apiKey
      },
      body: JSON.stringify(workflowData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✅ Created workflow: ${agent.workflowId} (ID: ${result.id})`);
    
    return {
      success: true,
      workflowId: result.id,
      webhookUrl: `${N8N_CONFIG.webhookPath}/webhook/${agent.workflowId}`,
      agent: agent.agentId
    };
    
  } catch (error) {
    console.error(`❌ Failed to create workflow for ${agent.agentId}:`, error.message);
    return {
      success: false,
      error: error.message,
      agent: agent.agentId
    };
  }
}

// =============================================================================
// BATCH PROCESSOR
// =============================================================================

async function generateAllWorkflows() {
  console.log('🎯 SKRBL AI - N8N Bulk Workflow Generator Starting...\n');
  console.log(`📡 N8N Instance: ${N8N_CONFIG.baseUrl}`);
  console.log(`🔑 API Key: ${N8N_CONFIG.apiKey ? '✅ Configured' : '❌ Missing'}\n`);
  
  const results = [];
  const successfulWorkflows = [];
  const failedWorkflows = [];
  
  // Process each agent
  for (const agent of AGENTS) {
    const result = await createWorkflowInN8N(agent);
    results.push(result);
    
    if (result.success) {
      successfulWorkflows.push(result);
    } else {
      failedWorkflows.push(result);
    }
    
    // Small delay to avoid overwhelming N8N
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Generate summary report
  console.log('\n' + '='.repeat(60));
  console.log('📊 BULK WORKFLOW GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successfulWorkflows.length}/${AGENTS.length}`);
  console.log(`❌ Failed: ${failedWorkflows.length}/${AGENTS.length}`);
  
  if (successfulWorkflows.length > 0) {
    console.log('\n🎉 SUCCESSFUL WORKFLOWS:');
    successfulWorkflows.forEach(workflow => {
      console.log(`  ✅ ${workflow.agent}: ${workflow.webhookUrl}`);
    });
  }
  
  if (failedWorkflows.length > 0) {
    console.log('\n💥 FAILED WORKFLOWS:');
    failedWorkflows.forEach(workflow => {
      console.log(`  ❌ ${workflow.agent}: ${workflow.error}`);
    });
  }
  
  // Generate environment variables
  console.log('\n🔧 ENVIRONMENT VARIABLES TO ADD:');
  console.log('# Add these to your .env file:');
  successfulWorkflows.forEach(workflow => {
    const envVar = `N8N_WEBHOOK_${workflow.agent.toUpperCase().replace('-', '_')}=${workflow.webhookUrl}`;
    console.log(envVar);
  });
  
  // Save results to file
  const outputPath = path.join(__dirname, 'n8n-workflow-results.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    config: N8N_CONFIG,
    results,
    successful: successfulWorkflows,
    failed: failedWorkflows
  }, null, 2));
  
  console.log(`\n💾 Results saved to: ${outputPath}`);
  console.log('\n🚀 Next Steps:');
  console.log('1. Add the environment variables above to your .env file');
  console.log('2. Restart your SKRBL AI application');
  console.log('3. Test agent workflows from the dashboard');
  console.log('4. Monitor workflow executions in N8N');
  
  return results;
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

async function main() {
  // Validate configuration
  if (!N8N_CONFIG.apiKey || N8N_CONFIG.apiKey === 'your-api-key') {
    console.error('❌ N8N_API_KEY environment variable is required');
    console.log('💡 Set your N8N API key: export N8N_API_KEY=your_actual_api_key');
    process.exit(1);
  }
  
  if (!N8N_CONFIG.baseUrl || N8N_CONFIG.baseUrl === 'https://your-n8n-instance.com') {
    console.error('❌ N8N_BASE_URL environment variable is required');
    console.log('💡 Set your N8N URL: export N8N_BASE_URL=https://your-n8n-instance.com');
    process.exit(1);
  }
  
  try {
    await generateAllWorkflows();
    console.log('\n🎯 Bulk workflow generation completed successfully!');
  } catch (error) {
    console.error('\n💥 Bulk workflow generation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateAllWorkflows,
  generateWorkflowJSON,
  createWorkflowInN8N,
  AGENTS,
  N8N_CONFIG
}; 