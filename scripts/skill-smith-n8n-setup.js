#!/usr/bin/env node

/**
 * SKILL SMITH N8N WORKFLOW GENERATOR
 * 
 * Creates the missing "sports-performance-master" workflow for Skill Smith agent
 * Includes personality injection and modeling after great people (as requested)
 */

const fs = require('fs');
const path = require('path');

// =============================================================================
// SKILL SMITH CONFIGURATION
// =============================================================================

const SKILL_SMITH_CONFIG = {
  agentId: 'skillsmith',
  name: 'Skill Smith',
  superheroName: 'Skill Smith the Sports Performance Forger',
  workflowId: 'sports-performance-master',
  capabilities: [
    'athletic_performance_analysis',
    'training_program_generation', 
    'nutrition_optimization',
    'injury_prevention_strategy',
    'mental_performance_coaching',
    'sports_business_strategy'
  ],
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
  handoffPreferences: ['analytics', 'contentcreation', 'branding', 'social']
};

// =============================================================================
// N8N WORKFLOW TEMPLATE FOR SKILL SMITH
// =============================================================================

function generateSkillSmithWorkflow() {
  return {
    name: `${SKILL_SMITH_CONFIG.superheroName} - ${SKILL_SMITH_CONFIG.workflowId}`,
    active: true,
    nodes: [
      // Webhook Trigger Node
      {
        parameters: {
          httpMethod: "POST",
          path: SKILL_SMITH_CONFIG.workflowId,
          options: {}
        },
        id: "webhook-trigger-skillsmith",
        name: "Sports Performance Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [240, 300],
        webhookId: SKILL_SMITH_CONFIG.workflowId
      },
      
      // Data Processing & Validation Node
      {
        parameters: {
          jsCode: `
// Extract and validate sports performance input data
const inputData = $input.first().json;

// Ensure required fields exist
if (!inputData.userPrompt) {
  throw new Error('userPrompt is required for sports performance analysis');
}

// Process the input for enhanced sports analysis
const processedData = {
  ...inputData,
  agentId: '${SKILL_SMITH_CONFIG.agentId}',
  superheroName: '${SKILL_SMITH_CONFIG.superheroName}',
  capabilities: ${JSON.stringify(SKILL_SMITH_CONFIG.capabilities)},
  timestamp: new Date().toISOString(),
  
  // Enhanced sports context
  sportsContext: {
    analysisType: inputData.analysisType || 'general_performance',
    sport: inputData.sport || 'general_fitness',
    experience_level: inputData.experience_level || 'intermediate',
    goals: inputData.goals || ['improve_performance'],
    current_metrics: inputData.current_metrics || null,
    timeframe: inputData.timeframe || '12_weeks'
  },
  
  // Great minds inspiration context
  inspiration: {
    strategic_approach: 'Lombardi + Belichick strategic thinking',
    mental_framework: 'Tony Robbins motivational psychology',
    scientific_method: 'Dr. Andy Galpin performance science',
    resilience_training: 'Navy SEAL mental toughness protocols'
  }
};

return { json: processedData };
`
        },
        id: "sports-data-processor",
        name: "Sports Performance Data Processor",
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [460, 300]
      },
      
      // OpenAI Sports Performance Node
      {
        parameters: {
          resource: "chat",
          operation: "message",
          model: "gpt-4",
          messages: {
            messages: [
              {
                role: "system",
                content: SKILL_SMITH_CONFIG.systemPrompt
              },
              {
                role: "user", 
                content: `Sports Performance Request: {{ $json.userPrompt }}

Context Information:
- Sport/Activity: {{ $json.sportsContext.sport }}
- Experience Level: {{ $json.sportsContext.experience_level }}
- Goals: {{ $json.sportsContext.goals }}
- Analysis Type: {{ $json.sportsContext.analysisType }}
- Timeframe: {{ $json.sportsContext.timeframe }}
- Current Metrics: {{ $json.sportsContext.current_metrics }}

Please provide a comprehensive sports performance analysis and actionable recommendations.`
              }
            ]
          },
          options: {
            temperature: 0.7,
            maxTokens: 3000
          }
        },
        id: "openai-sports-processor",
        name: "Sports Performance AI Engine",
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
      
      // Sports Performance Response Formatter
      {
        parameters: {
          jsCode: `
// Get the sports performance analysis
const sportsResponse = $input.first().json.message.content;
const inputData = $('sports-data-processor').first().json;

// Format the response for SKRBL AI with sports-specific enhancements
const formattedResponse = {
  success: true,
  executionId: inputData.executionId || \`workout_\${Date.now()}_skill-smith\`,
  agentId: '${SKILL_SMITH_CONFIG.agentId}',
  superheroName: '${SKILL_SMITH_CONFIG.superheroName}',
  result: {
    type: 'sports_performance_analysis',
    output: sportsResponse,
    metadata: {
      processingTime: Date.now() - new Date(inputData.timestamp).getTime(),
      confidence: 95,
      model: 'gpt-4',
      capabilities: ${JSON.stringify(SKILL_SMITH_CONFIG.capabilities)},
      sportsContext: inputData.sportsContext,
      inspiration: inputData.inspiration
    }
  },
  handoffSuggestions: [
    {
      agentId: 'analytics',
      reason: 'Track and analyze your performance metrics over time',
      confidence: 90,
      nextSteps: ['Set up performance tracking dashboard', 'Create baseline measurements']
    },
    {
      agentId: 'contentcreation',
      reason: 'Create content about your athletic journey for social media',
      confidence: 85,
      nextSteps: ['Document training progress', 'Share success stories']
    },
    {
      agentId: 'branding',
      reason: 'Build your personal athletic brand and sponsorship opportunities',
      confidence: 80,
      nextSteps: ['Develop athlete personal brand', 'Create sponsorship materials']
    },
    {
      agentId: 'social',
      reason: 'Share your athletic achievements and inspire others',
      confidence: 75,
      nextSteps: ['Create motivational content', 'Build athletic community']
    }
  ],
  sportsSpecific: {
    performanceCategories: ['strength', 'endurance', 'flexibility', 'mental_toughness'],
    recommendedFollowUp: '2_week_progress_check',
    injuryRisk: 'low_moderate',
    motivationalQuote: 'Forge your victory, one skill at a time!'
  },
  timestamp: new Date().toISOString(),
  status: 'completed'
};

return { json: formattedResponse };
`
        },
        id: "sports-response-formatter",
        name: "Sports Performance Response Formatter", 
        type: "n8n-nodes-base.code",
        typeVersion: 2,
        position: [900, 300]
      },
      
      // Sports Performance Webhook Response
      {
        parameters: {
          respondWith: "json",
          responseBody: "={{ $json }}",
          options: {}
        },
        id: "sports-webhook-response",
        name: "Sports Performance Response",
        type: "n8n-nodes-base.respondToWebhook",
        typeVersion: 1,
        position: [1120, 300]
      }
    ],
    connections: {
      "Sports Performance Webhook": {
        "main": [
          [
            {
              "node": "Sports Performance Data Processor",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Sports Performance Data Processor": {
        "main": [
          [
            {
              "node": "Sports Performance AI Engine",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Sports Performance AI Engine": {
        "main": [
          [
            {
              "node": "Sports Performance Response Formatter",
              "type": "main",
              "index": 0
            }
          ]
        ]
      },
      "Sports Performance Response Formatter": {
        "main": [
          [
            {
              "node": "Sports Performance Response",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    },
    settings: {},
    staticData: null,
    tags: ["sports", "performance", "skill-smith", "athletics"],
    triggerCount: 0,
    updatedAt: new Date().toISOString(),
    versionId: "1"
  };
}

// =============================================================================
// ENVIRONMENT SETUP & WEBHOOK URL GENERATION
// =============================================================================

function generateEnvironmentSetup() {
  const baseUrl = process.env.N8N_BASE_URL || 'https://skrblai.app.n8n.cloud';
  const webhookUrl = `${baseUrl}/webhook/${SKILL_SMITH_CONFIG.workflowId}`;
  
  return {
    webhookUrl,
    environmentVariable: `N8N_WEBHOOK_SKILL_SMITH=${webhookUrl}`,
    testCurl: `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userPrompt": "Create a training program for marathon running",
    "sport": "running",
    "experience_level": "intermediate", 
    "goals": ["improve_endurance", "prevent_injury"],
    "timeframe": "16_weeks",
    "executionId": "test_skill_smith_123"
  }'`
  };
}

// =============================================================================
// EXECUTION FUNCTIONS
// =============================================================================

async function createSkillSmithWorkflow() {
  const workflow = generateSkillSmithWorkflow();
  const envSetup = generateEnvironmentSetup();
  
  // Save workflow JSON for import
  const workflowPath = path.join(__dirname, 'skill-smith-workflow-import.json');
  fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2));
  
  // Save environment setup
  const setupPath = path.join(__dirname, 'skill-smith-setup-instructions.txt');
  const setupInstructions = `
🏃‍♂️ SKILL SMITH N8N SETUP INSTRUCTIONS
======================================

1. IMPORT WORKFLOW:
   - Go to your N8N dashboard
   - Click "Import" or "Import Workflow"  
   - Upload: ${workflowPath}
   - Activate the workflow

2. ADD ENVIRONMENT VARIABLE:
   ${envSetup.environmentVariable}

3. TEST THE WORKFLOW:
   ${envSetup.testCurl}

4. WEBHOOK URL:
   ${envSetup.webhookUrl}

🎯 INSPIRED BY GREAT MINDS:
- Strategic thinking: Vince Lombardi + Bill Belichick
- Motivational psychology: Tony Robbins
- Performance science: Dr. Andy Galpin  
- Mental toughness: Navy SEAL protocols

🚀 CAPABILITIES:
${SKILL_SMITH_CONFIG.capabilities.map(cap => `   - ${cap.replace(/_/g, ' ')}`).join('\n')}

✅ Ready for sports performance optimization!
`;
  
  fs.writeFileSync(setupPath, setupInstructions);
  
  return {
    workflowFile: workflowPath,
    setupFile: setupPath,
    config: SKILL_SMITH_CONFIG,
    environment: envSetup
  };
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  console.log('🏃‍♂️ Creating Skill Smith N8N Workflow...\n');
  
  try {
    const result = await createSkillSmithWorkflow();
    
    console.log('✅ SKILL SMITH WORKFLOW CREATED SUCCESSFULLY!\n');
    console.log(`📁 Workflow File: ${result.workflowFile}`);
    console.log(`📝 Setup Instructions: ${result.setupFile}`);
    console.log(`🔗 Webhook URL: ${result.environment.webhookUrl}\n`);
    
    console.log('🎯 NEXT STEPS:');
    console.log('1. Import the workflow JSON into your N8N instance');
    console.log('2. Add the environment variable to your .env file');
    console.log('3. Test using the provided curl command');
    console.log('4. Integrate with SKRBL AI dashboard\n');
    
    console.log('🏆 SKILL SMITH IS NOW READY TO FORGE ATHLETIC EXCELLENCE!');
    
  } catch (error) {
    console.error('❌ Error creating Skill Smith workflow:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = {
  generateSkillSmithWorkflow,
  createSkillSmithWorkflow,
  SKILL_SMITH_CONFIG
}; 