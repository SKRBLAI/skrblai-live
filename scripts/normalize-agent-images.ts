#!/usr/bin/env tsx

/**
 * Agent Image Normalizer
 * Renames agent image files to follow the standardized naming convention:
 * - Directory: public/images/agents/
 * - Primary: <slug>.png
 * - Fallbacks: <slug>-nobg.png, <slug>.webp
 * - All lowercase filenames for Linux production compatibility
 */

import { existsSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { execSync } from 'child_process';
import { canonicalizeAgentSlug } from '../utils/agentImages';

// Import agent registry to get canonical agent IDs
async function getAgentIds(): Promise<string[]> {
  try {
    // Use dynamic import to avoid build-time dependencies
    const { default: agentRegistry } = await import('../lib/agents/agentRegistry');
    return agentRegistry.map((agent: any) => agent.id);
  } catch (error) {
    console.error('❌ Failed to load agent registry:', error);
    // Fallback to known agent IDs
    return [
      'percy', 'branding', 'social', 'analytics', 'contentcreation', 'videocontent',
      'publishing', 'site', 'adcreative', 'sync', 'clientsuccess', 'payment',
      'biz', 'proposal', 'skillsmith', 'ira'
    ];
  }
}

interface RenameOperation {
  oldPath: string;
  newPath: string;
  operation: 'case-rename' | 'move' | 'none';
  agentId: string;
  imageType: 'png' | 'nobg' | 'webp';
}

function findAgentImageFiles(agentId: string, imagesDir: string): string[] {
  const canonicalSlug = canonicalizeAgentSlug(agentId);
  const files = readdirSync(imagesDir);
  
  // Find files that might belong to this agent (case-insensitive)
  const candidates = files.filter(file => {
    const baseName = basename(file, extname(file)).toLowerCase();
    const cleanName = baseName
      .replace(/-nobg$/, '')
      .replace(/-(skrblai|agent)$/, '')
      .replace(/^agents?-/, '');
    
    return cleanName === canonicalSlug || 
           cleanName === agentId.toLowerCase() ||
           baseName.includes(canonicalSlug);
  });
  
  return candidates.map(file => join(imagesDir, file));
}

function planRenameOperations(agentIds: string[], imagesDir: string): RenameOperation[] {
  const operations: RenameOperation[] = [];
  
  for (const agentId of agentIds) {
    const canonicalSlug = canonicalizeAgentSlug(agentId);
    const candidateFiles = findAgentImageFiles(agentId, imagesDir);
    
    for (const filePath of candidateFiles) {
      const fileName = basename(filePath);
      const ext = extname(fileName).toLowerCase();
      const baseName = basename(fileName, ext);
      
      let targetName: string;
      let imageType: 'png' | 'nobg' | 'webp';
      
      // Determine target name based on current file characteristics
      if (baseName.toLowerCase().includes('nobg') || baseName.toLowerCase().includes('no-bg')) {
        targetName = `${canonicalSlug}-nobg${ext}`;
        imageType = 'nobg';
      } else if (ext === '.webp') {
        targetName = `${canonicalSlug}.webp`;
        imageType = 'webp';
      } else if (ext === '.png') {
        targetName = `${canonicalSlug}.png`;
        imageType = 'png';
      } else {
        continue; // Skip unsupported formats
      }
      
      const targetPath = join(imagesDir, targetName);
      
      // Determine operation type
      let operation: 'case-rename' | 'move' | 'none';
      if (filePath === targetPath) {
        operation = 'none';
      } else if (filePath.toLowerCase() === targetPath.toLowerCase()) {
        operation = 'case-rename';
      } else {
        operation = 'move';
      }
      
      if (operation !== 'none') {
        operations.push({
          oldPath: filePath,
          newPath: targetPath,
          operation,
          agentId,
          imageType
        });
      }
    }
  }
  
  return operations;
}

function executeRename(op: RenameOperation): boolean {
  try {
    if (op.operation === 'case-rename') {
      // Git-safe case-only rename using two-step process
      const tempPath = `${op.newPath}.tmp`;
      console.log(`   📁 Case rename: ${basename(op.oldPath)} → ${basename(op.newPath)}`);
      execSync(`git mv "${op.oldPath}" "${tempPath}"`, { stdio: 'pipe' });
      execSync(`git mv "${tempPath}" "${op.newPath}"`, { stdio: 'pipe' });
    } else if (op.operation === 'move') {
      console.log(`   📂 Move: ${basename(op.oldPath)} → ${basename(op.newPath)}`);
      execSync(`git mv "${op.oldPath}" "${op.newPath}"`, { stdio: 'pipe' });
    }
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to rename ${op.oldPath}:`, error);
    return false;
  }
}

async function main() {
  console.log('🎨 Agent Image Normalizer');
  console.log('=========================\n');
  
  const imagesDir = join(process.cwd(), 'public', 'images', 'agents');
  
  // Verify images directory exists
  if (!existsSync(imagesDir)) {
    console.error(`❌ Images directory not found: ${imagesDir}`);
    process.exit(1);
  }
  
  console.log(`📁 Images directory: ${imagesDir}`);
  
  // Load agent IDs from registry
  console.log('🤖 Loading agent registry...');
  const agentIds = await getAgentIds();
  console.log(`   Found ${agentIds.length} agents: ${agentIds.join(', ')}\n`);
  
  // Plan rename operations
  console.log('🔍 Planning rename operations...');
  const operations = planRenameOperations(agentIds, imagesDir);
  
  if (operations.length === 0) {
    console.log('✅ All agent images are already normalized!');
    return;
  }
  
  console.log(`   Found ${operations.length} files to normalize:\n`);
  
  // Show summary table
  console.log('📋 Rename Summary:');
  console.log('==================');
  console.log('Agent ID'.padEnd(15) + 'Type'.padEnd(8) + 'Operation'.padEnd(12) + 'Before → After');
  console.log('-'.repeat(70));
  
  for (const op of operations) {
    const beforeName = basename(op.oldPath);
    const afterName = basename(op.newPath);
    console.log(
      op.agentId.padEnd(15) + 
      op.imageType.padEnd(8) + 
      op.operation.padEnd(12) + 
      `${beforeName} → ${afterName}`
    );
  }
  
  console.log('\n🚀 Executing renames...');
  
  let successCount = 0;
  for (const op of operations) {
    if (executeRename(op)) {
      successCount++;
    }
  }
  
  console.log(`\n📊 Results:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${operations.length - successCount}`);
  
  if (successCount === operations.length) {
    console.log('\n🎉 All agent images normalized successfully!');
  } else {
    console.log('\n⚠️  Some operations failed. Please check the errors above.');
    process.exit(1);
  }
  
  // Final verification
  console.log('\n🔍 Final verification...');
  const finalOps = planRenameOperations(agentIds, imagesDir);
  if (finalOps.length === 0) {
    console.log('✅ Verification passed - all images are now normalized!');
  } else {
    console.log('❌ Verification failed - some images still need normalization');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}