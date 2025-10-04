#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load the dead code findings
const findings = JSON.parse(fs.readFileSync('/workspace/analysis/dead-code-findings.json', 'utf8'));

function searchForStringReferences(filePath, allSourceFiles) {
  const references = [];
  const fileName = path.basename(filePath, path.extname(filePath));
  const relativePath = filePath;
  
  // Patterns to search for
  const searchPatterns = [
    // Direct file path references
    new RegExp(`['"\`]${filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`, 'g'),
    // Component name references
    new RegExp(`['"\`]${fileName}['"\`]`, 'g'),
    // Dynamic import patterns
    new RegExp(`import\\s*\\(\\s*['"\`][^'"\`]*${fileName}[^'"\`]*['"\`]\\s*\\)`, 'g'),
    // Require patterns
    new RegExp(`require\\s*\\(\\s*['"\`][^'"\`]*${fileName}[^'"\`]*['"\`]\\s*\\)`, 'g'),
    // String-based component registries
    new RegExp(`${fileName}\\s*[:=]`, 'g'),
    // MDX or CMS references
    new RegExp(`component\\s*[:=]\\s*['"\`]${fileName}['"\`]`, 'g')
  ];
  
  for (const sourceFile of allSourceFiles) {
    try {
      const content = fs.readFileSync(path.join('/workspace', sourceFile), 'utf8');
      
      for (const pattern of searchPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const line = content.split('\n')[lineNumber - 1]?.trim();
          
          references.push({
            file: sourceFile,
            line: lineNumber,
            context: line,
            pattern: pattern.source,
            match: match[0]
          });
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  return references;
}

function checkForRegistryReferences(filePath, allSourceFiles) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const registryReferences = [];
  
  // Common registry patterns
  const registryPatterns = [
    // Object/Map registries
    new RegExp(`['"\`]${fileName}['"\`]\\s*:`, 'g'),
    // Array registries
    new RegExp(`['"\`]${fileName}['"\`]\\s*,`, 'g'),
    // Function calls with component names
    new RegExp(`\\w+\\s*\\(\\s*['"\`]${fileName}['"\`]`, 'g'),
    // Route definitions
    new RegExp(`path\\s*:\\s*['"\`][^'"\`]*${fileName}[^'"\`]*['"\`]`, 'g'),
    // Component mappings
    new RegExp(`component\\s*:\\s*${fileName}`, 'g')
  ];
  
  for (const sourceFile of allSourceFiles) {
    try {
      const content = fs.readFileSync(path.join('/workspace', sourceFile), 'utf8');
      
      for (const pattern of registryPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const line = content.split('\n')[lineNumber - 1]?.trim();
          
          registryReferences.push({
            file: sourceFile,
            line: lineNumber,
            context: line,
            pattern: pattern.source,
            match: match[0]
          });
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  return registryReferences;
}

function checkForMDXReferences(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const mdxReferences = [];
  
  // Find MDX files
  const mdxFiles = [];
  function findMDXFiles(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !fullPath.includes('node_modules')) {
          findMDXFiles(fullPath);
        } else if (entry.isFile() && /\.(mdx?|json)$/.test(entry.name)) {
          mdxFiles.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
  }
  
  findMDXFiles('/workspace');
  
  // Search in MDX and JSON files
  for (const mdxFile of mdxFiles) {
    try {
      const content = fs.readFileSync(mdxFile, 'utf8');
      
      // Look for component references
      const patterns = [
        new RegExp(`<${fileName}[\\s/>]`, 'g'),
        new RegExp(`['"\`]${fileName}['"\`]`, 'g'),
        new RegExp(`component\\s*[:=]\\s*['"\`]${fileName}['"\`]`, 'g')
      ];
      
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const line = content.split('\n')[lineNumber - 1]?.trim();
          
          mdxReferences.push({
            file: path.relative('/workspace', mdxFile),
            line: lineNumber,
            context: line,
            match: match[0]
          });
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  return mdxReferences;
}

function performSafetyChecks() {
  console.log('Performing safety checks...');
  
  // Get all source files for searching
  const allSourceFiles = [];
  function findAllFiles(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative('/workspace', fullPath);
        
        if (entry.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.next')) {
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
  console.log(`Searching in ${allSourceFiles.length} files for references...`);
  
  const safetyResults = {
    checkedFiles: 0,
    filesWithReferences: 0,
    totalReferences: 0,
    findings: []
  };
  
  // Check each file marked for removal
  const filesToCheck = findings.findings.filter(f => 
    f.suggestedAction === 'remove' || f.status === 'unused'
  );
  
  console.log(`Checking ${filesToCheck.length} files for safety...`);
  
  for (const finding of filesToCheck) {
    const filePath = finding.file;
    safetyResults.checkedFiles++;
    
    // Search for string references
    const stringReferences = searchForStringReferences(filePath, allSourceFiles);
    
    // Search for registry references
    const registryReferences = checkForRegistryReferences(filePath, allSourceFiles);
    
    // Search for MDX references
    const mdxReferences = checkForMDXReferences(filePath);
    
    const allReferences = [
      ...stringReferences,
      ...registryReferences,
      ...mdxReferences
    ];
    
    if (allReferences.length > 0) {
      safetyResults.filesWithReferences++;
      safetyResults.totalReferences += allReferences.length;
      
      // Update the finding with safety information
      const updatedFinding = {
        ...finding,
        safetyCheck: {
          hasReferences: true,
          referenceCount: allReferences.length,
          references: allReferences,
          updatedAction: 'needs_manual_review'
        }
      };
      
      safetyResults.findings.push(updatedFinding);
    } else {
      // No references found, safe to remove
      const updatedFinding = {
        ...finding,
        safetyCheck: {
          hasReferences: false,
          referenceCount: 0,
          references: [],
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
        hasReferences: null, // Not checked
        referenceCount: 0,
        references: [],
        updatedAction: finding.suggestedAction
      }
    });
  }
  
  return {
    summary: {
      ...findings.summary,
      checkedFiles: safetyResults.checkedFiles,
      filesWithReferences: safetyResults.filesWithReferences,
      totalReferences: safetyResults.totalReferences,
      safeToRemoveAfterCheck: safetyResults.findings.filter(f => 
        f.safetyCheck.updatedAction === 'remove' && !f.safetyCheck.hasReferences
      ).length,
      blockedByReferences: safetyResults.findings.filter(f => 
        f.safetyCheck.hasReferences
      ).length
    },
    findings: safetyResults.findings
  };
}

// Main execution
const safetyResults = performSafetyChecks();

// Write results
const outputPath = '/workspace/analysis/dead-code-findings-with-safety.json';
fs.writeFileSync(outputPath, JSON.stringify(safetyResults, null, 2));

console.log(`Safety check results written to ${outputPath}`);
console.log('Safety Check Summary:');
console.log(`- Files checked: ${safetyResults.summary.checkedFiles}`);
console.log(`- Files with references: ${safetyResults.summary.filesWithReferences}`);
console.log(`- Total references found: ${safetyResults.summary.totalReferences}`);
console.log(`- Safe to remove after check: ${safetyResults.summary.safeToRemoveAfterCheck}`);
console.log(`- Blocked by references: ${safetyResults.summary.blockedByReferences}`);