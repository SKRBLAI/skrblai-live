#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load the dependency graph and entrypoints
const depGraph = JSON.parse(fs.readFileSync('/workspace/analysis/dep-graph.json', 'utf8'));
const entrypoints = JSON.parse(fs.readFileSync('/workspace/analysis/entrypoints.json', 'utf8'));

// Configuration
const LEGACY_INDICATORS = [
  'legacy', 'old', 'v1', 'deprecated', 'archive', '__old__', 
  'backup', 'temp', 'tmp', 'unused', 'disabled'
];

const DEPRECATED_PATTERNS = [
  '@deprecated', 'DEPRECATED:', 'MIGRATE:', 'TODO: remove', 'FIXME: remove'
];

function isEntrypoint(filePath) {
  const allEntrypoints = [
    ...entrypoints.nextjs_pages,
    ...entrypoints.nextjs_layouts,
    ...entrypoints.nextjs_error_pages,
    ...entrypoints.api_routes,
    ...entrypoints.cli_scripts,
    ...entrypoints.dynamic_imports,
    ...entrypoints.middleware,
    ...entrypoints.special_files
  ];
  
  return allEntrypoints.includes(filePath);
}

function hasLegacyIndicators(filePath) {
  const lowerPath = filePath.toLowerCase();
  return LEGACY_INDICATORS.some(indicator => 
    lowerPath.includes(indicator) || 
    lowerPath.includes(`/${indicator}/`) ||
    lowerPath.includes(`-${indicator}-`) ||
    lowerPath.includes(`_${indicator}_`)
  );
}

function checkForDeprecatedAnnotations(filePath) {
  try {
    const content = fs.readFileSync(path.join('/workspace', filePath), 'utf8');
    const deprecatedMatches = [];
    
    DEPRECATED_PATTERNS.forEach(pattern => {
      const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let match;
      while ((match = regex.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        deprecatedMatches.push({
          pattern: pattern,
          line: lineNumber,
          context: content.split('\n')[lineNumber - 1]?.trim()
        });
      }
    });
    
    return deprecatedMatches;
  } catch (error) {
    return [];
  }
}

function findReachableFiles(entrypointFiles, graph) {
  const reachable = new Set();
  const queue = [...entrypointFiles];
  
  while (queue.length > 0) {
    const currentFile = queue.shift();
    
    if (reachable.has(currentFile)) {
      continue;
    }
    
    reachable.add(currentFile);
    
    // Add all files imported by this file
    const fileData = graph.files[currentFile];
    if (fileData) {
      fileData.imports.forEach(importData => {
        const importedRelativePath = path.relative('/workspace', importData.resolved);
        if (!reachable.has(importedRelativePath)) {
          queue.push(importedRelativePath);
        }
      });
    }
  }
  
  return reachable;
}

function findSimilarFiles(filePath, allFiles) {
  const baseName = path.basename(filePath, path.extname(filePath));
  const dirName = path.dirname(filePath);
  
  const similar = [];
  
  for (const otherFile of allFiles) {
    if (otherFile === filePath) continue;
    
    const otherBaseName = path.basename(otherFile, path.extname(otherFile));
    const otherDirName = path.dirname(otherFile);
    
    // Same directory, similar name
    if (dirName === otherDirName) {
      if (otherBaseName.includes(baseName) || baseName.includes(otherBaseName)) {
        similar.push(otherFile);
      }
    }
    
    // Similar names across directories
    const similarity = calculateSimilarity(baseName, otherBaseName);
    if (similarity > 0.6) {
      similar.push(otherFile);
    }
  }
  
  return similar;
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function checkFeatureFlags(filePath) {
  try {
    const content = fs.readFileSync(path.join('/workspace', filePath), 'utf8');
    const flagMatches = [];
    
    // Look for feature flag patterns
    const flagPatterns = [
      /NEXT_PUBLIC_(\w+)/g,
      /process\.env\.(\w+)/g,
      /getFeatureFlag\(['"`](\w+)['"`]\)/g
    ];
    
    flagPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        flagMatches.push({
          flag: match[1],
          line: content.substring(0, match.index).split('\n').length
        });
      }
    });
    
    return flagMatches;
  } catch (error) {
    return [];
  }
}

function suggestAction(fileData, isReachable, hasLegacyIndicators, deprecatedAnnotations, featureFlags) {
  const { size, imports, exports, importedBy } = fileData;
  
  // If it's not reachable from any entrypoint
  if (!isReachable) {
    // Small files with few exports might be good for inlining
    if (size.lines <= 40 && exports.length <= 2 && importedBy.length <= 1) {
      return 'inline-small-bits';
    }
    
    // Files with no imports or exports are likely safe to remove
    if (imports.length === 0 && exports.length === 0) {
      return 'remove';
    }
    
    // Files with legacy indicators are candidates for removal
    if (hasLegacyIndicators) {
      return 'remove';
    }
    
    // Files with deprecated annotations
    if (deprecatedAnnotations.length > 0) {
      return 'remove';
    }
    
    // Files gated by feature flags that are OFF
    if (featureFlags.length > 0) {
      return 'keep'; // Need manual review for feature flags
    }
    
    return 'remove';
  }
  
  // If it's reachable but has legacy indicators or deprecated annotations
  if (hasLegacyIndicators || deprecatedAnnotations.length > 0) {
    return 'needs_manual_review';
  }
  
  return 'keep';
}

function analyzeDeadCode() {
  console.log('Analyzing dead code...');
  
  // Get all entrypoint files
  const allEntrypoints = [
    ...entrypoints.nextjs_pages,
    ...entrypoints.nextjs_layouts,
    ...entrypoints.nextjs_error_pages,
    ...entrypoints.api_routes,
    ...entrypoints.cli_scripts,
    ...entrypoints.dynamic_imports,
    ...entrypoints.middleware,
    ...entrypoints.special_files
  ];
  
  console.log(`Found ${allEntrypoints.length} entrypoints`);
  
  // Find all reachable files
  const reachableFiles = findReachableFiles(allEntrypoints, depGraph);
  console.log(`Found ${reachableFiles.size} reachable files`);
  
  const findings = [];
  const allFiles = Object.keys(depGraph.files);
  
  // Analyze each file
  for (const filePath of allFiles) {
    const fileData = depGraph.files[filePath];
    const isReachable = reachableFiles.has(filePath);
    const hasLegacy = hasLegacyIndicators(filePath);
    const deprecatedAnnotations = checkForDeprecatedAnnotations(filePath);
    const featureFlags = checkFeatureFlags(filePath);
    
    let status = 'used';
    const reasons = [];
    
    if (!isReachable) {
      status = 'unused';
      reasons.push('no inbound edges from entrypoints');
    }
    
    if (hasLegacy) {
      status = status === 'unused' ? 'legacy' : 'legacy';
      reasons.push('filename contains legacy indicators');
    }
    
    if (deprecatedAnnotations.length > 0) {
      status = 'deprecated';
      reasons.push('contains @deprecated annotations');
    }
    
    if (featureFlags.length > 0) {
      reasons.push('gated by feature flags');
    }
    
    // Only include files that are potentially problematic
    if (status !== 'used' || reasons.length > 0) {
      const similarFiles = findSimilarFiles(filePath, allFiles);
      const replacedBy = similarFiles.filter(f => reachableFiles.has(f));
      
      const suggestedAction = suggestAction(
        fileData, 
        isReachable, 
        hasLegacy, 
        deprecatedAnnotations, 
        featureFlags
      );
      
      findings.push({
        file: filePath,
        status: status,
        reasons: reasons,
        exportedSymbols: fileData.exports.map(e => e.name),
        replacedBy: replacedBy,
        suggestedAction: suggestedAction,
        size: fileData.size,
        imports: fileData.imports.length,
        importedBy: fileData.importedBy.length,
        deprecatedAnnotations: deprecatedAnnotations,
        featureFlags: featureFlags,
        similarFiles: similarFiles
      });
    }
  }
  
  return {
    findings: findings,
    summary: {
      totalFiles: allFiles.length,
      reachableFiles: reachableFiles.size,
      unusedFiles: findings.filter(f => f.status === 'unused').length,
      legacyFiles: findings.filter(f => f.status === 'legacy').length,
      deprecatedFiles: findings.filter(f => f.status === 'deprecated').length,
      safeToRemove: findings.filter(f => f.suggestedAction === 'remove').length,
      needsManualReview: findings.filter(f => f.suggestedAction === 'needs_manual_review').length,
      canInline: findings.filter(f => f.suggestedAction === 'inline-small-bits').length
    }
  };
}

// Main execution
const analysis = analyzeDeadCode();

// Write results
const outputPath = '/workspace/analysis/dead-code-findings.json';
fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));

console.log(`Dead code analysis written to ${outputPath}`);
console.log('Summary:');
console.log(`- Total files: ${analysis.summary.totalFiles}`);
console.log(`- Reachable files: ${analysis.summary.reachableFiles}`);
console.log(`- Unused files: ${analysis.summary.unusedFiles}`);
console.log(`- Legacy files: ${analysis.summary.legacyFiles}`);
console.log(`- Deprecated files: ${analysis.summary.deprecatedFiles}`);
console.log(`- Safe to remove: ${analysis.summary.safeToRemove}`);
console.log(`- Need manual review: ${analysis.summary.needsManualReview}`);
console.log(`- Can inline: ${analysis.summary.canInline}`);