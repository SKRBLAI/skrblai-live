#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load the dead code findings
const findings = JSON.parse(fs.readFileSync('/workspace/analysis/dead-code-findings.json', 'utf8'));

function isLikelyFalsePositive(reference, filePath) {
  const { context, file } = reference;
  const fileName = path.basename(filePath, path.extname(filePath));
  
  // Skip references in the same file
  if (file === filePath) {
    return true;
  }
  
  // Skip references in test files
  if (file.includes('.test.') || file.includes('.spec.') || file.includes('__tests__')) {
    return true;
  }
  
  // Skip references in comments
  if (context.trim().startsWith('//') || context.trim().startsWith('*') || context.trim().startsWith('/*')) {
    return true;
  }
  
  // Skip references that are just common words
  const commonWords = ['test', 'data', 'config', 'utils', 'helper', 'index', 'type', 'interface'];
  if (commonWords.includes(fileName.toLowerCase())) {
    return true;
  }
  
  // Skip references in package.json or other config files
  if (file.includes('package.json') || file.includes('tsconfig.json') || file.includes('.config.')) {
    return true;
  }
  
  // Skip references that are part of URLs or paths that don't look like imports
  if (context.includes('http') || context.includes('www.') || context.includes('.com')) {
    return true;
  }
  
  return false;
}

function findCriticalReferences(filePath, allSourceFiles) {
  const criticalReferences = [];
  const fileName = path.basename(filePath, path.extname(filePath));
  
  // More specific patterns for actual usage
  const criticalPatterns = [
    // Dynamic imports with exact path
    new RegExp(`import\\s*\\(\\s*['"\`]\\s*[./]*${filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*['"\`]\\s*\\)`, 'g'),
    // Require with exact path
    new RegExp(`require\\s*\\(\\s*['"\`]\\s*[./]*${filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*['"\`]\\s*\\)`, 'g'),
    // Component registry with exact component name
    new RegExp(`['"\`]${fileName}['"\`]\\s*:\\s*(?:lazy\\s*\\(|import\\s*\\(|require\\s*\\()`, 'g'),
    // Route definitions with component
    new RegExp(`component\\s*:\\s*(?:lazy\\s*\\(\\s*=>\\s*import\\s*\\(\\s*['"\`][^'"\`]*${fileName}[^'"\`]*['"\`]|${fileName})`, 'g'),
    // MDX component usage
    new RegExp(`<${fileName}[\\s/>]`, 'g')
  ];
  
  for (const sourceFile of allSourceFiles) {
    // Skip certain file types that are unlikely to have critical references
    if (sourceFile.includes('node_modules') || 
        sourceFile.includes('.test.') || 
        sourceFile.includes('.spec.') ||
        sourceFile.includes('package.json') ||
        sourceFile.includes('tsconfig.json')) {
      continue;
    }
    
    try {
      const content = fs.readFileSync(path.join('/workspace', sourceFile), 'utf8');
      
      for (const pattern of criticalPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const line = content.split('\n')[lineNumber - 1]?.trim();
          
          const reference = {
            file: sourceFile,
            line: lineNumber,
            context: line,
            match: match[0],
            type: 'critical'
          };
          
          if (!isLikelyFalsePositive(reference, filePath)) {
            criticalReferences.push(reference);
          }
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  return criticalReferences;
}

function performRefinedSafetyChecks() {
  console.log('Performing refined safety checks...');
  
  // Get all source files for searching
  const allSourceFiles = [];
  function findAllFiles(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative('/workspace', fullPath);
        
        if (entry.isDirectory() && 
            !fullPath.includes('node_modules') && 
            !fullPath.includes('.next') &&
            !fullPath.includes('coverage') &&
            !fullPath.includes('dist')) {
          findAllFiles(fullPath);
        } else if (entry.isFile() && /\.(ts|tsx|js|jsx|json|md|mdx)$/.test(entry.name)) {
          allSourceFiles.push(relativePath);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  findAllFiles('/workspace');
  console.log(`Searching in ${allSourceFiles.length} files for critical references...`);
  
  const safetyResults = {
    checkedFiles: 0,
    filesWithCriticalReferences: 0,
    totalCriticalReferences: 0,
    findings: []
  };
  
  // Check each file marked for removal
  const filesToCheck = findings.findings.filter(f => 
    f.suggestedAction === 'remove' || f.status === 'unused'
  );
  
  console.log(`Checking ${filesToCheck.length} files for critical references...`);
  
  for (const finding of filesToCheck) {
    const filePath = finding.file;
    safetyResults.checkedFiles++;
    
    // Search for critical references only
    const criticalReferences = findCriticalReferences(filePath, allSourceFiles);
    
    if (criticalReferences.length > 0) {
      safetyResults.filesWithCriticalReferences++;
      safetyResults.totalCriticalReferences += criticalReferences.length;
      
      const updatedFinding = {
        ...finding,
        safetyCheck: {
          hasCriticalReferences: true,
          criticalReferenceCount: criticalReferences.length,
          criticalReferences: criticalReferences,
          updatedAction: 'needs_manual_review'
        }
      };
      
      safetyResults.findings.push(updatedFinding);
    } else {
      // No critical references found, safe to remove
      const updatedFinding = {
        ...finding,
        safetyCheck: {
          hasCriticalReferences: false,
          criticalReferenceCount: 0,
          criticalReferences: [],
          updatedAction: finding.suggestedAction
        }
      };
      
      safetyResults.findings.push(updatedFinding);
    }
  }
  
  // Add files that weren't checked (not marked for removal)
  const uncheckedFindings = findings.findings.filter(f => 
    f.suggestedAction !== 'remove' && f.status !== 'unused'
  );
  
  for (const finding of uncheckedFindings) {
    safetyResults.findings.push({
      ...finding,
      safetyCheck: {
        hasCriticalReferences: null, // Not checked
        criticalReferenceCount: 0,
        criticalReferences: [],
        updatedAction: finding.suggestedAction
      }
    });
  }
  
  return {
    summary: {
      ...findings.summary,
      checkedFiles: safetyResults.checkedFiles,
      filesWithCriticalReferences: safetyResults.filesWithCriticalReferences,
      totalCriticalReferences: safetyResults.totalCriticalReferences,
      safeToRemoveAfterCheck: safetyResults.findings.filter(f => 
        f.safetyCheck.updatedAction === 'remove' && !f.safetyCheck.hasCriticalReferences
      ).length,
      blockedByCriticalReferences: safetyResults.findings.filter(f => 
        f.safetyCheck.hasCriticalReferences
      ).length
    },
    findings: safetyResults.findings
  };
}

// Main execution
const safetyResults = performRefinedSafetyChecks();

// Write results
const outputPath = '/workspace/analysis/dead-code-findings-refined.json';
fs.writeFileSync(outputPath, JSON.stringify(safetyResults, null, 2));

console.log(`Refined safety check results written to ${outputPath}`);
console.log('Refined Safety Check Summary:');
console.log(`- Files checked: ${safetyResults.summary.checkedFiles}`);
console.log(`- Files with critical references: ${safetyResults.summary.filesWithCriticalReferences}`);
console.log(`- Total critical references found: ${safetyResults.summary.totalCriticalReferences}`);
console.log(`- Safe to remove after check: ${safetyResults.summary.safeToRemoveAfterCheck}`);
console.log(`- Blocked by critical references: ${safetyResults.summary.blockedByCriticalReferences}`);