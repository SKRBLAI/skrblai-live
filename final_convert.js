const fs = require('fs');
const path = require('path');

// Additional files to convert (found in grep search)
const additionalFiles = [
  'utils/supabase-helpers.ts',
  'utils/agentUtils.ts',
  'utils/agentBackstoryUtils.ts',
  'types/agent.ts',
  'lib/3d/Agent3DCardCore.tsx',
  'hooks/useAgentBackstory.ts',
  'contexts/PercyContext.tsx',
  'components/AgentCard.tsx',
  'ai-agents/videoContentAgent.ts',
  'components/workflows/WorkflowTemplateCard.tsx',
  'app/sports/page.tsx',
  'app/social-media/page.tsx',
  'app/services/not-found.tsx',
  'app/sign-in/page.tsx',
  'app/services/[agent]/page.tsx',
  'components/ui/AgentCard.tsx',
  'components/ui/AgentGrid.tsx',
  'components/ui/AgentModal.tsx',
  'components/ui/CloudinaryImage.tsx',
  'components/ui/PercyTimeline.tsx',
  'components/ui/PercyAssistant.tsx',
  'components/ui/RevenuePulseWidget.tsx',
  'components/ui/UniversalPromptBar.tsx',
  'components/ui/WorkflowLaunchpadModal.tsx',
  'components/ui/PercyHelpBubble.tsx',
  'components/ui/HeroSection.tsx',
  'components/ui/AuthProviderButton.tsx',
  'components/ui/AgentLeagueCard.tsx'
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
    console.log(`⚠️  Skipping ${filePath} - file not found`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let changes = [];
  
  // Regular expression to match import statements with @/ paths
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\w+))?\s+from\s+|)['"](@\/[^'"]+)['"]/g;
  
  content = content.replace(importRegex, (match, importPath) => {
    const relativePath = calculateRelativePath(filePath, importPath);
    const newImport = match.replace(importPath, relativePath);
    changes.push(`${importPath} → ${relativePath}`);
    modified = true;
    return newImport;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Converted ${filePath}`);
    changes.forEach(change => console.log(`   ${change}`));
    return true;
  } else {
    console.log(`⏭️  No @/ imports found in ${filePath}`);
    return false;
  }
}

// Convert all additional files
console.log('🔧 Converting additional critical files...\n');
const convertedFiles = [];

additionalFiles.forEach(file => {
  console.log(`📁 Processing ${file}:`);
  if (convertImportsInFile(file)) {
    convertedFiles.push(file);
  }
  console.log(''); // Add spacing
});

console.log(`✨ Final conversion complete! ${convertedFiles.length} additional files converted:`);
convertedFiles.forEach(file => console.log(`  - ${file}`));

console.log('\n🧪 All critical files converted and ready for testing!'); 