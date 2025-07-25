const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function findAllFilesWithAtImports() {
  try {
    // Find all TypeScript/JavaScript files with @/ imports
    const output = execSync(`grep -rl "from ['\\"]@/" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v node_modules | grep -v .next | grep -v convert_`, { encoding: 'utf8' });
    return output.split('\n').filter(line => line.trim()).map(line => line.replace('./', ''));
  } catch (error) {
    console.log('No files found with @/ imports, or search failed');
    return [];
  }
}

// Find and convert all files
console.log('🔍 Finding ALL files with @/ imports...\n');

const allFiles = findAllFilesWithAtImports();
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
const skippedFiles = [];

allFiles.forEach((file, index) => {
  // Skip documentation files
  if (file.startsWith('docs/') || file.endsWith('.md')) {
    skippedFiles.push(file);
    return;
  }
  
  console.log(`📁 [${index + 1}/${allFiles.length}] Processing ${file}:`);
  
  if (convertImportsInFile(file)) {
    convertedFiles.push(file);
  }
  
  console.log(''); // Add spacing
});

console.log(`✨ Mass conversion complete!`);
console.log(`   📄 ${convertedFiles.length} files converted`);
console.log(`   ⏭️  ${skippedFiles.length} documentation files skipped`);
console.log(`   📊 ${allFiles.length} total files processed`);

console.log(`\n📝 Converted files:`);
convertedFiles.forEach(file => console.log(`  - ${file}`));

if (skippedFiles.length > 0) {
  console.log(`\n📖 Skipped documentation files:`);
  skippedFiles.slice(0, 5).forEach(file => console.log(`  - ${file}`));
  if (skippedFiles.length > 5) {
    console.log(`  ... and ${skippedFiles.length - 5} more documentation files`);
  }
}

console.log('\n🧪 All code files converted and ready for testing!'); 