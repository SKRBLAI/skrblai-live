const fs = require('fs');
const path = require('path');

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
  }
  
  return false;
}

function findAllFilesRecursively(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  
  // Skip these directories
  const skipDirs = ['node_modules', '.next', '.git', 'docs'];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!skipDirs.includes(item)) {
          results = results.concat(findAllFilesRecursively(fullPath, extensions));
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          const relativePath = path.relative('.', fullPath).replace(/\\/g, '/');
          results.push(relativePath);
        }
      }
    }
  } catch (error) {
    console.log(`Error reading directory ${dir}:`, error.message);
  }
  
  return results;
}

function findFilesWithAtImports() {
  console.log('🔍 Scanning for files with @/ imports...');
  
  const allTsFiles = findAllFilesRecursively('.');
  const filesWithAtImports = [];
  
  for (const file of allTsFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('from \'@/') || content.includes('from "@/')) {
        filesWithAtImports.push(file);
      }
    } catch (error) {
      // Skip files that can't be read
      continue;
    }
  }
  
  return filesWithAtImports;
}

// Find and convert all files
console.log('🔧 Windows-compatible import path conversion starting...\n');

const allFiles = findFilesWithAtImports();
console.log(`📝 Found ${allFiles.length} files with @/ imports to convert:`);

if (allFiles.length === 0) {
  console.log('✨ No files found with @/ imports!');
  process.exit(0);
}

// Show first 10 files for reference
allFiles.slice(0, 10).forEach(file => console.log(`  - ${file}`));
if (allFiles.length > 10) {
  console.log(`  ... and ${allFiles.length - 10} more files`);
}

console.log('\n🔧 Converting ALL files with @/ imports...\n');

const convertedFiles = [];

allFiles.forEach((file, index) => {
  console.log(`📁 [${index + 1}/${allFiles.length}] Processing ${file}:`);
  
  if (convertImportsInFile(file)) {
    convertedFiles.push(file);
  }
  
  console.log(''); // Add spacing
});

console.log(`✨ Mass conversion complete!`);
console.log(`   📄 ${convertedFiles.length} files converted`);
console.log(`   📊 ${allFiles.length} total files processed`);

console.log(`\n📝 Converted files:`);
convertedFiles.forEach(file => console.log(`  - ${file}`));

console.log('\n🧪 All code files converted and ready for testing!'); 