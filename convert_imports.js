const fs = require('fs');
const path = require('path');

// Files that need conversion based on the grep search
const filesToConvert = [
  // Utils
  'utils/supabase-helpers.ts',
  'utils/getAgentsByRole.ts', 
  'utils/feedback.ts',
  'utils/agentUtils.ts',
  'utils/agentBackstoryUtils.ts',
  
  // Types
  'types/agent.ts',
  'types/modules.d.ts',
  
  // Tests
  'tests/hooks/useAgentBackstory.test.ts',
  'tests/auth/dashboardAuth.test.ts',
  'tests/agentSchema.test.ts',
  
  // Lib
  'lib/trial/trialManager.ts',
  'lib/performance/3DOptimizer.ts',
  'lib/rag/ragEnhancedPowerEngine.ts',
  'lib/powerUser/crossAgentHandoffs.ts',
  'lib/percy/contextManager.js',
  'lib/percy/intelligenceEngine.js',
  'lib/percy/saveChatMemory.ts',
  'lib/percy/getRecentMemory.ts',
  'lib/analytics/emailTriggers.ts',
  'lib/email/cronJobs.ts',
  'lib/hooks/useAnalytics.ts',
  'lib/email/simpleAutomation.ts',
  'lib/auth/dashboardAuth.ts',
  'lib/auth/integrationSupport.ts',
  'lib/agents/accessControl.js',
  'lib/agents/agentRegistry.ts',
  'lib/auth/checkUserRole.ts',
  'lib/agents/intelligenceEngine.ts',
  'lib/agents/handoffSystem.ts',
  'lib/agents/powerEngine.ts',
  'lib/agents/workflowLookup.ts',
  'lib/agents/legacy/AgentConstellationArchive.tsx',
  'lib/3d/Agent3DCardCore.tsx',
  
  // Hooks
  'hooks/useAgentLeague.ts',
  'hooks/useAgentStats.ts',
  'hooks/useUsageBasedPricing.ts',
  'hooks/useTrial.ts',
  'hooks/useUser.ts',
  'hooks/useAgentBackstory.ts',
  
  // Contexts
  'contexts/PercyContext.tsx',
  
  // Components
  'components/agents/WorkflowLaunchButton.tsx'
];

function calculateRelativePath(from, to) {
  // Remove @/ prefix from the 'to' path
  const cleanTo = to.replace(/^@\//, '');
  
  // Get the directory of the 'from' file
  const fromDir = path.dirname(from);
  
  // Calculate relative path
  const relativePath = path.relative(fromDir, cleanTo);
  
  // Convert Windows paths to Unix paths and ensure ./ prefix for same directory
  let result = relativePath.replace(/\\/g, '/');
  if (!result.startsWith('../') && !result.startsWith('./')) {
    result = './' + result;
  }
  
  return result;
}

function convertImportsInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} - file not found`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Regular expression to match import statements with @/ paths
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\w+))?\s+from\s+|)['"](@\/[^'"]+)['"]/g;
  
  content = content.replace(importRegex, (match, importPath) => {
    const relativePath = calculateRelativePath(filePath, importPath);
    const newImport = match.replace(importPath, relativePath);
    console.log(`  ${importPath} → ${relativePath}`);
    modified = true;
    return newImport;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Converted ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No changes needed in ${filePath}`);
    return false;
  }
}

// Convert all files
console.log('🔧 Converting @/ imports to relative paths...\n');
const convertedFiles = [];

filesToConvert.forEach(file => {
  console.log(`\n📁 Processing ${file}:`);
  if (convertImportsInFile(file)) {
    convertedFiles.push(file);
  }
});

console.log(`\n✨ Conversion complete! ${convertedFiles.length} files converted:`);
convertedFiles.forEach(file => console.log(`  - ${file}`));

console.log('\n🧪 Files converted and ready for testing!'); 