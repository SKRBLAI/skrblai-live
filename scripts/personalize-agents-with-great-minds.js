#!/usr/bin/env node

/**
 * AGENT PERSONALIZATION WITH GREAT MINDS
 * 
 * Tool to model SKRBL AI agents after great people in your life
 * This enhances the agents with real personality traits and wisdom
 */

const fs = require('fs');
const path = require('path');

// =============================================================================
// PERSONALIZATION TEMPLATES
// =============================================================================

const PERSONALITY_TEMPLATES = {
  
  // Business & Strategy Agents
  'percy': {
    currentPersona: 'Cosmic Concierge',
    suggestedPersona: 'The Ultimate Mentor Figure',
    questions: [
      'Who is the wisest person you know who always helps you make the right decisions?',
      'Which mentor/advisor has the best strategic thinking?',
      'Who do you trust most for complex problem-solving?'
    ],
    traits: ['wisdom', 'strategic_thinking', 'trustworthiness', 'guidance', 'decision_making']
  },

  'branding': {
    currentPersona: 'BrandAlexander the Identity Architect',
    suggestedPersona: 'Creative Visionary Mastermind',
    questions: [
      'Who is the most creative person you know?',
      'Which artist/designer inspires you most?',
      'Who has the best eye for visual aesthetics in your life?'
    ],
    traits: ['creativity', 'visual_thinking', 'innovation', 'aesthetic_sense', 'brand_intuition']
  },

  'contentcreation': {
    currentPersona: 'ContentCarltig the Word Weaver',
    suggestedPersona: 'Master Storyteller & Communicator',
    questions: [
      'Who is the best writer or storyteller you know?',
      'Which person always knows exactly what to say?',
      'Who captivates people with their communication skills?'
    ],
    traits: ['storytelling', 'communication', 'persuasion', 'empathy', 'wordcraft']
  },

  'social': {
    currentPersona: 'SocialNino the Viral Virtuoso',
    suggestedPersona: 'Social Butterfly & Trend Spotter',
    questions: [
      'Who is the most socially connected person you know?',
      'Which person always knows what\'s trending or popular?',
      'Who has the most engaging personality on social media?'
    ],
    traits: ['social_intelligence', 'trend_awareness', 'engagement', 'charisma', 'networking']
  },

  'analytics': {
    currentPersona: 'Analytics Don the Data Detective',
    suggestedPersona: 'Numbers Genius & Pattern Finder',
    questions: [
      'Who is the most analytical person you know?',
      'Which person sees patterns others miss?',
      'Who makes the best data-driven decisions?'
    ],
    traits: ['analytical_thinking', 'pattern_recognition', 'logical_reasoning', 'precision', 'insight']
  },

  'adcreative': {
    currentPersona: 'AdmEthen the Conversion Commander',
    suggestedPersona: 'Sales Psychology Master',
    questions: [
      'Who is the best salesperson you know?',
      'Which person understands human psychology best?',
      'Who could sell anything to anyone?'
    ],
    traits: ['persuasion', 'psychology', 'sales_mastery', 'influence', 'conversion_optimization']
  },

  'skillsmith': {
    currentPersona: 'Skill Smith the Sports Performance Forger',
    suggestedPersona: 'Athletic Performance Coach',
    questions: [
      'Who is the most disciplined athlete or coach you know?',
      'Which person pushes you to be your physical best?',
      'Who has the best mindset for overcoming challenges?'
    ],
    traits: ['discipline', 'motivation', 'performance_optimization', 'resilience', 'coaching']
  }
};

// =============================================================================
// PERSONALIZATION FUNCTIONS
// =============================================================================

function generatePersonalizationQuestions() {
  console.log('🎯 AGENT PERSONALIZATION QUESTIONNAIRE');
  console.log('=====================================\n');
  
  console.log('To make your agents more powerful, let\'s model them after great people in your life!\n');
  
  Object.entries(PERSONALITY_TEMPLATES).forEach(([agentId, template]) => {
    console.log(`🤖 ${template.currentPersona} (${agentId})`);
    console.log(`Suggested Role: ${template.suggestedPersona}`);
    console.log('Questions to consider:');
    template.questions.forEach((q, i) => console.log(`   ${i+1}. ${q}`));
    console.log(`Key Traits: ${template.traits.join(', ')}`);
    console.log('─'.repeat(60));
  });
}

function createPersonalizationTemplate(agentId, personDetails) {
  const template = PERSONALITY_TEMPLATES[agentId];
  if (!template) return null;

  return {
    agentId,
    originalPersona: template.currentPersona,
    newPersona: personDetails.name,
    inspiration: personDetails,
    enhancedSystemPrompt: generateEnhancedPrompt(agentId, personDetails),
    personalityTraits: template.traits,
    realWorldConnection: personDetails.connection
  };
}

function generateEnhancedPrompt(agentId, personDetails) {
  const basePrompts = {
    'percy': `You are Percy the Cosmic Concierge, but your wisdom and guidance style is inspired by ${personDetails.name}.

Embody their qualities:
- ${personDetails.keyQualities.join('\n- ')}

Your approach to helping users should reflect ${personDetails.name}'s style of:
- ${personDetails.helpingStyle}

When making decisions or recommendations, think like ${personDetails.name} would: ${personDetails.decisionMaking}`,

    'branding': `You are BrandAlexander the Identity Architect, channeling the creative vision of ${personDetails.name}.

Draw from their artistic approach:
- ${personDetails.keyQualities.join('\n- ')}

Your design philosophy mirrors ${personDetails.name}'s style: ${personDetails.creativeStyle}

When creating brand identities, use ${personDetails.name}'s approach: ${personDetails.designProcess}`,

    'skillsmith': `You are Skill Smith the Sports Performance Forger, inspired by the athletic excellence and coaching wisdom of ${personDetails.name}.

Channel their athletic mindset:
- ${personDetails.keyQualities.join('\n- ')}

Your training philosophy reflects ${personDetails.name}'s approach: ${personDetails.trainingPhilosophy}

When coaching athletes, use ${personDetails.name}'s methods: ${personDetails.coachingStyle}`
  };

  return basePrompts[agentId] || `You are enhanced with the wisdom and approach of ${personDetails.name}.`;
}

// =============================================================================
// INTERACTIVE PERSONALIZATION
// =============================================================================

function startInteractivePersonalization() {
  console.log('🎯 INTERACTIVE AGENT PERSONALIZATION');
  console.log('====================================\n');
  
  console.log('Let\'s personalize your agents! For each agent, think of someone who embodies that role:\n');
  
  const personalizationData = {};
  
  Object.entries(PERSONALITY_TEMPLATES).forEach(([agentId, template]) => {
    console.log(`\n🤖 ${template.currentPersona}`);
    console.log(`Role: ${template.suggestedPersona}`);
    console.log('\nConsider these questions:');
    template.questions.forEach((q, i) => console.log(`   ${i+1}. ${q}`));
    
    console.log('\n📝 Fill out this template:');
    console.log(`
{
  "name": "Person's Name or Title",
  "relationship": "How you know them (mentor, friend, coach, etc.)",
  "keyQualities": [
    "Quality 1 that makes them great",
    "Quality 2 that makes them great", 
    "Quality 3 that makes them great"
  ],
  "helpingStyle": "How they help/guide others",
  "specificApproach": "Their unique method or philosophy",
  "quotes": ["Memorable things they say"],
  "connection": "Why this person is perfect for this agent role"
}
`);
    console.log('─'.repeat(60));
  });
  
  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Fill out the templates above for each agent you want to personalize');
  console.log('2. Save them as JSON files in scripts/personalizations/');
  console.log('3. Run the personalization script to update your agents');
  console.log('4. Deploy the enhanced agents to N8N');
}

// =============================================================================
// EXAMPLE PERSONALIZATIONS
// =============================================================================

function generateExamplePersonalizations() {
  const examples = {
    'percy': {
      name: 'Your Wise Grandfather',
      relationship: 'family_mentor',
      keyQualities: [
        'Always gives thoughtful advice',
        'Sees the big picture in any situation',
        'Never rushes important decisions',
        'Connects people and resources perfectly'
      ],
      helpingStyle: 'Asks the right questions to help you discover the answer yourself',
      specificApproach: 'Uses stories and analogies to make complex things simple',
      quotes: ['Think it through, but don\'t overthink it', 'The right path usually becomes clear if you listen'],
      connection: 'Perfect for Percy because he guides users to the right agent with wisdom and patience'
    },

    'skillsmith': {
      name: 'Coach Mike (High School Football Coach)',
      relationship: 'sports_mentor',
      keyQualities: [
        'Pushes you beyond your perceived limits',
        'Combines old-school discipline with modern science',
        'Never accepts excuses but always provides solutions',
        'Builds mental toughness through progressive challenges'
      ],
      helpingStyle: 'Direct but supportive, focuses on process over results',
      specificApproach: 'Break big goals into daily habits, measure everything, celebrate small wins',
      quotes: ['Champions are made in the off-season', 'Your body will quit before your mind if you let it'],
      connection: 'Perfect for athletic performance because he understands both physical and mental training'
    },

    'branding': {
      name: 'Sarah the Creative Director',
      relationship: 'professional_inspiration', 
      keyQualities: [
        'Sees visual stories in everything',
        'Understands the emotion behind every color and font',
        'Makes brands feel authentic and memorable',
        'Balances creativity with strategic thinking'
      ],
      helpingStyle: 'Asks about the feeling you want to create, then builds the visual around that',
      specificApproach: 'Start with the story, then choose colors/fonts that tell that story',
      quotes: ['Every brand should feel like a person you want to be friends with'],
      connection: 'Perfect for branding because she creates emotional connections through visual design'
    }
  };

  const examplesPath = path.join(__dirname, 'example-personalizations.json');
  fs.writeFileSync(examplesPath, JSON.stringify(examples, null, 2));
  
  console.log(`\n📝 Example personalizations saved to: ${examplesPath}`);
  console.log('\nUse these as templates for creating your own agent personalizations!');
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================

async function main() {
  const command = process.argv[2] || 'interactive';
  
  switch (command) {
    case 'questions':
      generatePersonalizationQuestions();
      break;
    case 'interactive':
      startInteractivePersonalization();
      break;
    case 'examples':
      generateExamplePersonalizations();
      break;
    default:
      console.log('Usage: node personalize-agents-with-great-minds.js [questions|interactive|examples]');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  PERSONALITY_TEMPLATES,
  createPersonalizationTemplate,
  generateEnhancedPrompt
}; 