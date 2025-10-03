// ESLint rule to prevent imports from deprecated files
// Add this to your .eslintrc.js or eslint.config.js

const deprecatedFiles = [
  // Files with @deprecated annotations
  'archived-app/legacy/agent-backstory/[agentId]/page.tsx',
  'archived-app/legacy/book-publishing/page.tsx',
  'archived-app/legacy/branding/page.tsx',
  'archived-app/legacy/social-media/page.tsx',
  'components/home/AgentPreviewSection.tsx',
  'components/home/BusinessResultsShowcase.tsx',
  'components/home/SkillSmithHero.tsx',
  'components/home/SkillSmithStandaloneHero.tsx',
  'components/home/SplitHero.tsx',
  'components/home/SuperAgentPowers.tsx',
  'components/home/UrgencyBanner.tsx',
  'components/home/Hero.tsx',
  'components/home/PercyAvatar.tsx',
  'components/home/Spotlight.tsx',
  'components/legacy/home/PercyOnboardingRevolution.tsx',
  'lib/agents/handoffSystem.ts',
  'lib/agents/workflowLookup.ts',
  'lib/env.ts',
  'lib/supabase/server.ts',
  'utils/agentImages.ts',
  'utils/twilioSms.ts',
  
  // Legacy files
  'components/percy/archive/PercyOnboardingRevolution_LEGACY_v1.tsx',
  'components/legacy/services/services/page.tsx',
  'lib/agents/legacy/AgentConstellationArchive.tsx',
  
  // Add more as needed...
];

const deprecatedImportPaths = deprecatedFiles.map(file => {
  // Convert file paths to possible import paths
  const withoutExtension = file.replace(/\.(tsx?|jsx?)$/, '');
  return [
    `./${withoutExtension}`,
    `../${withoutExtension}`,
    `@/${withoutExtension}`,
    withoutExtension
  ];
}).flat();

module.exports = {
  rules: {
    'no-deprecated-imports': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow imports from deprecated files',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [],
        messages: {
          deprecatedImport: 'Import from deprecated file "{{source}}" is not allowed. {{suggestion}}',
        },
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const importPath = node.source.value;
            
            // Check if this import is from a deprecated file
            const isDeprecated = deprecatedImportPaths.some(depPath => 
              importPath.includes(depPath) || 
              importPath.endsWith(depPath)
            );
            
            if (isDeprecated) {
              // Try to suggest replacement
              let suggestion = 'Please use the recommended replacement.';
              
              // Specific suggestions for known deprecated files
              if (importPath.includes('components/home/Hero')) {
                suggestion = 'Use components/home/HomeHeroScanFirst.tsx instead.';
              } else if (importPath.includes('lib/agents/handoffSystem')) {
                suggestion = 'Import from @/lib/agents/handoffs/handoffSystem instead.';
              } else if (importPath.includes('lib/agents/workflowLookup')) {
                suggestion = 'Import from @/lib/agents/workflows/workflowLookup instead.';
              } else if (importPath.includes('components/home/PercyAvatar')) {
                suggestion = 'Use components/ui/PercyAvatar.tsx instead.';
              }
              
              context.report({
                node: node.source,
                messageId: 'deprecatedImport',
                data: {
                  source: importPath,
                  suggestion: suggestion,
                },
              });
            }
          },
          
          // Also check dynamic imports
          CallExpression(node) {
            if (
              node.callee.type === 'Import' &&
              node.arguments.length === 1 &&
              node.arguments[0].type === 'Literal'
            ) {
              const importPath = node.arguments[0].value;
              
              const isDeprecated = deprecatedImportPaths.some(depPath => 
                importPath.includes(depPath) || 
                importPath.endsWith(depPath)
              );
              
              if (isDeprecated) {
                context.report({
                  node: node.arguments[0],
                  messageId: 'deprecatedImport',
                  data: {
                    source: importPath,
                    suggestion: 'Please use the recommended replacement.',
                  },
                });
              }
            }
          },
        };
      },
    },
  },
};

// Example usage in .eslintrc.js:
/*
module.exports = {
  // ... other config
  rules: {
    // ... other rules
    'no-deprecated-imports': 'error',
  },
  plugins: [
    // ... other plugins
    './analysis/eslint-deprecated-rule.js',
  ],
};
*/