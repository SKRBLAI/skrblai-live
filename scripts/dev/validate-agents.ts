#!/usr/bin/env tsx

/**
 * Agent Data Validation Script
 * 
 * Validates that all agents have required data fields like images and backstories.
 * This script is for development purposes only and will not fail builds.
 */

import { existsSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  agentId: string;
  name: string;
  missingFields: string[];
  warnings: string[];
}

function validateAgentImage(agentId: string, imageSlug?: string): { missing: boolean; warning?: string } {
  const possiblePaths = [
    `/public/images/agents/${imageSlug || agentId}.webp`,
    `/public/images/agents/${imageSlug || agentId}.png`,
    `/public/images/agents/${imageSlug || agentId}-nobg.png`,
    `/public/images/agents/${imageSlug || agentId}-nobg.webp`,
  ];
  
  const absolutePaths = possiblePaths.map(p => join(process.cwd(), p));
  const hasImage = absolutePaths.some(path => existsSync(path));
  
  if (!hasImage) {
    return { missing: true, warning: `No image found. Tried: ${possiblePaths.join(', ')}` };
  }
  
  return { missing: false };
}

function validateAgent(agent: any, backstories: any = {}): ValidationResult {
  const result: ValidationResult = {
    agentId: agent.id,
    name: agent.name || 'Unknown',
    missingFields: [],
    warnings: []
  };
  
  // Check required fields
  if (!agent.name) {
    result.missingFields.push('name');
  }
  
  if (!agent.description) {
    result.missingFields.push('description');
  }
  
  if (!agent.category) {
    result.missingFields.push('category');
  }
  
  // Check image
  const imageValidation = validateAgentImage(agent.id, agent.imageSlug);
  if (imageValidation.missing) {
    result.missingFields.push('image');
    if (imageValidation.warning) {
      result.warnings.push(imageValidation.warning);
    }
  }
  
  // Check backstory
  const backstory = backstories[agent.id];
  if (!backstory || !backstory.backstory) {
    result.missingFields.push('backstory');
  }
  
  if (!backstory?.superheroName) {
    result.warnings.push('Missing superheroName in backstory');
  }
  
  if (!backstory?.catchphrase) {
    result.warnings.push('Missing catchphrase in backstory');
  }
  
  if (!backstory?.powers || backstory.powers.length === 0) {
    result.warnings.push('Missing or empty powers array in backstory');
  }
  
  // Check capabilities
  if (!agent.capabilities || agent.capabilities.length === 0) {
    result.warnings.push('Missing or empty capabilities array');
  }
  
  // Check chat enablement
  if (typeof agent.chatEnabled === 'undefined' && typeof agent.canConverse === 'undefined') {
    result.warnings.push('Neither chatEnabled nor canConverse is defined - defaulting to true');
  }
  
  return result;
}

async function main() {
  console.log('🤖 Agent Data Validation Report');
  console.log('================================\n');
  
  // Load agent data dynamically to avoid dependency issues
  let agentRegistry: any[] = [];
  let agentBackstories: any = {};
  
  try {
    const registryModule = await import('../../lib/agents/agentRegistry');
    agentRegistry = registryModule.default || [];
    
    const backstoriesModule = await import('../../lib/agents/agentBackstories');
    agentBackstories = backstoriesModule.agentBackstories || {};
  } catch (error) {
    console.error('Error loading agent data:', error);
    console.log('⚠️  Running basic validation without agent data');
    return;
  }
  
  const results: ValidationResult[] = [];
  let totalAgents = 0;
  let agentsWithIssues = 0;
  let totalMissingFields = 0;
  let totalWarnings = 0;
  
  // Validate each agent
  for (const agent of agentRegistry) {
    totalAgents++;
    const result = validateAgent(agent, agentBackstories);
    results.push(result);
    
    if (result.missingFields.length > 0 || result.warnings.length > 0) {
      agentsWithIssues++;
      totalMissingFields += result.missingFields.length;
      totalWarnings += result.warnings.length;
      
      console.log(`❌ ${result.name} (${result.agentId}):`);
      
      if (result.missingFields.length > 0) {
        console.log(`   Missing: ${result.missingFields.join(', ')}`);
      }
      
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          console.log(`   ⚠️  ${warning}`);
        });
      }
      
      console.log('');
    }
  }
  
  // Summary
  console.log('Summary:');
  console.log(`📊 Total agents: ${totalAgents}`);
  console.log(`✅ Agents with no issues: ${totalAgents - agentsWithIssues}`);
  console.log(`⚠️  Agents with issues: ${agentsWithIssues}`);
  console.log(`🚫 Total missing critical fields: ${totalMissingFields}`);
  console.log(`⚠️  Total warnings: ${totalWarnings}`);
  
  if (agentsWithIssues === 0) {
    console.log('\n🎉 All agents have complete data!');
  } else {
    console.warn('\n⚠️  Some agents are missing data. Consider adding:');
    console.warn('   - Agent images in /public/images/agents/');
    console.warn('   - Backstory entries in lib/agents/agentBackstories.ts');
    console.warn('   - Complete agent metadata');
  }
  
  // Auto-fix suggestions for missing images
  const agentsNeedingImages = results.filter(r => r.missingFields.includes('image'));
  if (agentsNeedingImages.length > 0) {
    console.log('\n🔧 Auto-fix suggestions:');
    console.log('For agents missing images, you can:');
    console.log('1. Add specific images to /public/images/agents/');
    console.log('2. Or they will fallback to /agents/placeholder.png');
    
    agentsNeedingImages.forEach(agent => {
      console.log(`   - ${agent.agentId}: needs image file`);
    });
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export default main;