const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all remaining files with @/ imports
function findRemainingFiles() {
  try {
    const output = execSync('find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "from [\'\\"]@/" | grep -v node_modules | grep -v .next', { encoding: 'utf8' });
    return output.split('\n').filter(line => line.trim()).map(line => line.replace('./', ''));
  } catch (error) {
    console.log('No more files found with @/ imports, or search failed');
    return [];
  }
}

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

// Find and convert remaining files
console.log('🔍 Finding remaining files with @/ imports...\n');
const remainingFiles = findRemainingFiles();

if (remainingFiles.length === 0) {
  console.log('✨ No remaining files found with @/ imports!');
  process.exit(0);
}

console.log(`📝 Found ${remainingFiles.length} additional files to convert:`);
remainingFiles.forEach(file => console.log(`  - ${file}`));

console.log('\n🔧 Converting remaining files...\n');
const convertedFiles = [];

remainingFiles.forEach(file => {
  console.log(`\n📁 Processing ${file}:`);
  if (convertImportsInFile(file)) {
    convertedFiles.push(file);
  }
});

console.log(`\n✨ Additional conversion complete! ${convertedFiles.length} more files converted:`);
convertedFiles.forEach(file => console.log(`  - ${file}`));

console.log('\n🧪 All files converted and ready for testing!'); 