#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const WORKSPACE_ROOT = '/workspace';
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  '__tests__',
  '.test.',
  '.spec.',
  '.stories.',
  'coverage',
  'dist',
  'build'
];

// Path aliases from tsconfig.json
const PATH_ALIASES = {
  '@/': './',
  '@/lib/': './lib/',
  '@/utils/': './utils/',
  '@/components/': './components/',
  '@/types/': './types/'
};

function shouldExcludeFile(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function resolveAlias(importPath, currentFileDir) {
  // Handle relative imports
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    return path.resolve(currentFileDir, importPath);
  }
  
  // Handle alias imports
  for (const [alias, realPath] of Object.entries(PATH_ALIASES)) {
    if (importPath.startsWith(alias)) {
      const resolved = path.resolve(WORKSPACE_ROOT, importPath.replace(alias, realPath));
      return resolved;
    }
  }
  
  // Handle absolute imports from workspace root
  if (!importPath.startsWith('.') && !importPath.includes('node_modules')) {
    return path.resolve(WORKSPACE_ROOT, importPath);
  }
  
  return null; // External dependency
}

function findPossibleFiles(basePath) {
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  const possibilities = [];
  
  // Direct file
  for (const ext of extensions) {
    possibilities.push(basePath + ext);
  }
  
  // Index file in directory
  for (const ext of extensions) {
    possibilities.push(path.join(basePath, 'index' + ext));
  }
  
  return possibilities.filter(p => fs.existsSync(p));
}

function extractImports(content, filePath) {
  const imports = [];
  const currentDir = path.dirname(filePath);
  
  // Static imports: import ... from '...'
  const staticImportRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
  
  // Dynamic imports: import('...')
  const dynamicImportRegex = /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  
  // Re-exports: export ... from '...'
  const reExportRegex = /export\s+(?:\*|\{[^}]*\})\s+from\s+['"`]([^'"`]+)['"`]/g;
  
  let match;
  
  // Extract static imports
  while ((match = staticImportRegex.exec(content)) !== null) {
    const importPath = match[1];
    const resolved = resolveAlias(importPath, currentDir);
    if (resolved) {
      const possibleFiles = findPossibleFiles(resolved);
      if (possibleFiles.length > 0) {
        imports.push({
          type: 'static',
          source: importPath,
          resolved: possibleFiles[0],
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }
  }
  
  // Extract dynamic imports
  while ((match = dynamicImportRegex.exec(content)) !== null) {
    const importPath = match[1];
    const resolved = resolveAlias(importPath, currentDir);
    if (resolved) {
      const possibleFiles = findPossibleFiles(resolved);
      if (possibleFiles.length > 0) {
        imports.push({
          type: 'dynamic',
          source: importPath,
          resolved: possibleFiles[0],
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }
  }
  
  // Extract re-exports
  while ((match = reExportRegex.exec(content)) !== null) {
    const importPath = match[1];
    const resolved = resolveAlias(importPath, currentDir);
    if (resolved) {
      const possibleFiles = findPossibleFiles(resolved);
      if (possibleFiles.length > 0) {
        imports.push({
          type: 'reexport',
          source: importPath,
          resolved: possibleFiles[0],
          line: content.substring(0, match.index).split('\n').length
        });
      }
    }
  }
  
  return imports;
}

function extractExports(content) {
  const exports = [];
  
  // Default exports
  const defaultExportRegex = /export\s+default\s+(?:class|function|const|let|var)?\s*(\w+)?/g;
  
  // Named exports
  const namedExportRegex = /export\s+(?:class|function|const|let|var|interface|type)\s+(\w+)/g;
  
  // Export declarations
  const exportDeclRegex = /export\s*\{\s*([^}]+)\s*\}/g;
  
  let match;
  
  // Default exports
  while ((match = defaultExportRegex.exec(content)) !== null) {
    exports.push({
      type: 'default',
      name: match[1] || 'default',
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  // Named exports
  while ((match = namedExportRegex.exec(content)) !== null) {
    exports.push({
      type: 'named',
      name: match[1],
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  // Export declarations
  while ((match = exportDeclRegex.exec(content)) !== null) {
    const exportList = match[1].split(',').map(e => e.trim().split(' as ')[0].trim());
    exportList.forEach(name => {
      if (name) {
        exports.push({
          type: 'named',
          name: name,
          line: content.substring(0, match.index).split('\n').length
        });
      }
    });
  }
  
  return exports;
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      bytes: stats.size,
      lines: fs.readFileSync(filePath, 'utf8').split('\n').length
    };
  } catch (error) {
    return { bytes: 0, lines: 0 };
  }
}

function buildDependencyGraph() {
  console.log('Building dependency graph...');
  
  const graph = {
    files: {},
    metadata: {
      totalFiles: 0,
      timestamp: new Date().toISOString(),
      excludePatterns: EXCLUDE_PATTERNS
    }
  };
  
  // Find all source files
  function findSourceFiles(dir) {
    const files = [];
    
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (shouldExcludeFile(fullPath)) {
          continue;
        }
        
        if (entry.isDirectory()) {
          files.push(...findSourceFiles(fullPath));
        } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
    }
    
    return files;
  }
  
  const sourceFiles = findSourceFiles(WORKSPACE_ROOT);
  console.log(`Found ${sourceFiles.length} source files`);
  
  // Process each file
  for (const filePath of sourceFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(WORKSPACE_ROOT, filePath);
      const size = getFileSize(filePath);
      
      const imports = extractImports(content, filePath);
      const exports = extractExports(content);
      
      graph.files[relativePath] = {
        path: relativePath,
        absolutePath: filePath,
        size: size,
        imports: imports,
        exports: exports,
        importedBy: [] // Will be populated in second pass
      };
      
    } catch (error) {
      console.warn(`Warning: Could not process file ${filePath}: ${error.message}`);
    }
  }
  
  // Second pass: populate importedBy relationships
  for (const [filePath, fileData] of Object.entries(graph.files)) {
    for (const importData of fileData.imports) {
      const importedRelativePath = path.relative(WORKSPACE_ROOT, importData.resolved);
      if (graph.files[importedRelativePath]) {
        graph.files[importedRelativePath].importedBy.push({
          file: filePath,
          type: importData.type,
          line: importData.line
        });
      }
    }
  }
  
  graph.metadata.totalFiles = Object.keys(graph.files).length;
  
  return graph;
}

// Main execution
const graph = buildDependencyGraph();

// Write to file
const outputPath = path.join(WORKSPACE_ROOT, 'analysis', 'dep-graph.json');
fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));

console.log(`Dependency graph written to ${outputPath}`);
console.log(`Processed ${graph.metadata.totalFiles} files`);

// Generate summary statistics
const stats = {
  totalFiles: graph.metadata.totalFiles,
  filesWithImports: Object.values(graph.files).filter(f => f.imports.length > 0).length,
  filesWithExports: Object.values(graph.files).filter(f => f.exports.length > 0).length,
  orphanFiles: Object.values(graph.files).filter(f => f.importedBy.length === 0 && f.imports.length === 0).length,
  unusedFiles: Object.values(graph.files).filter(f => f.importedBy.length === 0).length,
  totalImports: Object.values(graph.files).reduce((sum, f) => sum + f.imports.length, 0),
  totalExports: Object.values(graph.files).reduce((sum, f) => sum + f.exports.length, 0)
};

console.log('Summary Statistics:');
console.log(`- Total files: ${stats.totalFiles}`);
console.log(`- Files with imports: ${stats.filesWithImports}`);
console.log(`- Files with exports: ${stats.filesWithExports}`);
console.log(`- Potentially unused files: ${stats.unusedFiles}`);
console.log(`- Total imports: ${stats.totalImports}`);
console.log(`- Total exports: ${stats.totalExports}`);