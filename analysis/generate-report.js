#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load all analysis data
const entrypoints = JSON.parse(fs.readFileSync('/workspace/analysis/entrypoints.json', 'utf8'));
const depGraph = JSON.parse(fs.readFileSync('/workspace/analysis/dep-graph.json', 'utf8'));
const findings = JSON.parse(fs.readFileSync('/workspace/analysis/dead-code-findings-refined.json', 'utf8'));

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function generateMarkdownReport() {
  const report = [];
  
  // Header
  report.push('# Dead Code & Legacy Component Analysis Report');
  report.push('');
  report.push(`**Generated:** ${new Date().toISOString()}`);
  report.push(`**Workspace:** /workspace`);
  report.push('');
  
  // Executive Summary
  report.push('## Executive Summary');
  report.push('');
  report.push(`This analysis identified **${findings.summary.unusedFiles + findings.summary.legacyFiles + findings.summary.deprecatedFiles}** potentially problematic files out of **${findings.summary.totalFiles}** total source files.`);
  report.push('');
  
  // Summary Statistics
  report.push('### Summary Statistics');
  report.push('');
  report.push('| Metric | Count |');
  report.push('|--------|-------|');
  report.push(`| Total Files Analyzed | ${findings.summary.totalFiles} |`);
  report.push(`| Reachable from Entrypoints | ${findings.summary.reachableFiles} |`);
  report.push(`| Unused Files | ${findings.summary.unusedFiles} |`);
  report.push(`| Legacy Files | ${findings.summary.legacyFiles} |`);
  report.push(`| Deprecated Files | ${findings.summary.deprecatedFiles} |`);
  report.push(`| Safe to Remove | ${findings.summary.safeToRemoveAfterCheck} |`);
  report.push(`| Need Manual Review | ${findings.summary.needsManualReview + findings.summary.blockedByCriticalReferences} |`);
  report.push(`| Can Inline | ${findings.summary.canInline} |`);
  report.push('');
  
  // Entrypoints Summary
  report.push('### Entrypoints Summary');
  report.push('');
  report.push('| Type | Count |');
  report.push('|------|-------|');
  report.push(`| Next.js Pages | ${entrypoints.nextjs_pages.length} |`);
  report.push(`| Next.js Layouts | ${entrypoints.nextjs_layouts.length} |`);
  report.push(`| API Routes | ${entrypoints.api_routes.length} |`);
  report.push(`| CLI Scripts | ${entrypoints.cli_scripts.length} |`);
  report.push(`| Dynamic Imports | ${entrypoints.dynamic_imports.length} |`);
  report.push('');
  
  // Safe Deletion Set
  const safeToRemove = findings.findings.filter(f => 
    f.safetyCheck.updatedAction === 'remove' && !f.safetyCheck.hasCriticalReferences
  );
  
  if (safeToRemove.length > 0) {
    report.push('## Safe Deletion Set');
    report.push('');
    report.push(`The following **${safeToRemove.length}** files have zero inbound edges from entrypoints, no dynamic references, and no registry hits. They are safe to delete:`);
    report.push('');
    
    // Sort by size (largest first) for impact assessment
    const sortedSafeToRemove = safeToRemove.sort((a, b) => b.size.bytes - a.size.bytes);
    
    report.push('| File | Size | Lines | Reason | Exports |');
    report.push('|------|------|-------|--------|---------|');
    
    let totalBytes = 0;
    let totalLines = 0;
    
    for (const finding of sortedSafeToRemove.slice(0, 20)) { // Top 20 largest
      totalBytes += finding.size.bytes;
      totalLines += finding.size.lines;
      
      report.push(`| \`${finding.file}\` | ${formatBytes(finding.size.bytes)} | ${finding.size.lines} | ${finding.reasons.join(', ')} | ${finding.exportedSymbols.join(', ') || 'none'} |`);
    }
    
    if (sortedSafeToRemove.length > 20) {
      report.push(`| ... and ${sortedSafeToRemove.length - 20} more files | | | | |`);
      
      // Calculate total for all files
      for (const finding of sortedSafeToRemove.slice(20)) {
        totalBytes += finding.size.bytes;
        totalLines += finding.size.lines;
      }
    }
    
    report.push('');
    report.push(`**Total potential savings:** ${formatBytes(totalBytes)} (${totalLines} lines)`);
    report.push('');
  }
  
  // Inline Migration Set
  const canInline = findings.findings.filter(f => 
    f.safetyCheck.updatedAction === 'inline-small-bits'
  );
  
  if (canInline.length > 0) {
    report.push('## Inline Migration Set');
    report.push('');
    report.push(`The following **${canInline.length}** files are small helpers that could be inlined into their consumers:`);
    report.push('');
    
    report.push('| File | Size | Lines | Imported By | Exports |');
    report.push('|------|------|-------|-------------|---------|');
    
    for (const finding of canInline.slice(0, 15)) { // Top 15
      const importedByFiles = finding.importedBy > 0 ? `${finding.importedBy} file(s)` : 'none';
      report.push(`| \`${finding.file}\` | ${formatBytes(finding.size.bytes)} | ${finding.size.lines} | ${importedByFiles} | ${finding.exportedSymbols.join(', ') || 'none'} |`);
    }
    
    if (canInline.length > 15) {
      report.push(`| ... and ${canInline.length - 15} more files | | | | |`);
    }
    
    report.push('');
  }
  
  // Blocked Set
  const blocked = findings.findings.filter(f => 
    f.safetyCheck.hasCriticalReferences || f.suggestedAction === 'needs_manual_review'
  );
  
  if (blocked.length > 0) {
    report.push('## Blocked Set (Needs Manual Review)');
    report.push('');
    report.push(`The following **${blocked.length}** files require manual review before removal:`);
    report.push('');
    
    report.push('| File | Status | Reason | Critical References |');
    report.push('|------|--------|--------|---------------------|');
    
    for (const finding of blocked.slice(0, 20)) { // Top 20
      const refCount = finding.safetyCheck.criticalReferenceCount || 0;
      const refText = refCount > 0 ? `${refCount} references` : 'Manual review needed';
      
      report.push(`| \`${finding.file}\` | ${finding.status} | ${finding.reasons.join(', ')} | ${refText} |`);
    }
    
    if (blocked.length > 20) {
      report.push(`| ... and ${blocked.length - 20} more files | | | |`);
    }
    
    report.push('');
  }
  
  // Legacy Components Analysis
  const legacyFiles = findings.findings.filter(f => f.status === 'legacy');
  
  if (legacyFiles.length > 0) {
    report.push('## Legacy Components Analysis');
    report.push('');
    report.push(`Found **${legacyFiles.length}** files with legacy indicators:`);
    report.push('');
    
    report.push('| File | Replaced By | Size | Action |');
    report.push('|------|-------------|------|--------|');
    
    for (const finding of legacyFiles) {
      const replacements = finding.replacedBy.length > 0 ? finding.replacedBy.join(', ') : 'Unknown';
      report.push(`| \`${finding.file}\` | ${replacements} | ${formatBytes(finding.size.bytes)} | ${finding.safetyCheck.updatedAction} |`);
    }
    
    report.push('');
  }
  
  // Deprecated Components Analysis
  const deprecatedFiles = findings.findings.filter(f => f.status === 'deprecated');
  
  if (deprecatedFiles.length > 0) {
    report.push('## Deprecated Components Analysis');
    report.push('');
    report.push(`Found **${deprecatedFiles.length}** files with deprecation annotations:`);
    report.push('');
    
    report.push('| File | Deprecation Notes | Size | Action |');
    report.push('|------|-------------------|------|--------|');
    
    for (const finding of deprecatedFiles) {
      const notes = finding.deprecatedAnnotations.map(a => `Line ${a.line}: ${a.context}`).join('; ') || 'See file';
      report.push(`| \`${finding.file}\` | ${notes} | ${formatBytes(finding.size.bytes)} | ${finding.safetyCheck.updatedAction} |`);
    }
    
    report.push('');
  }
  
  // How to Verify Nothing Breaks
  report.push('## How to Verify Nothing Breaks');
  report.push('');
  report.push('Before removing any files, follow this verification checklist:');
  report.push('');
  report.push('### 1. Build Verification');
  report.push('```bash');
  report.push('npm run build');
  report.push('npm run type-check');
  report.push('```');
  report.push('');
  report.push('### 2. Test Suite');
  report.push('```bash');
  report.push('npm run test');
  report.push('npm run test:smoke');
  report.push('```');
  report.push('');
  report.push('### 3. Runtime Verification');
  report.push('```bash');
  report.push('npm run dev');
  report.push('# Test key user flows:');
  report.push('# - Homepage load');
  report.push('# - Agent pages');
  report.push('# - Dashboard functionality');
  report.push('# - Authentication flow');
  report.push('```');
  report.push('');
  report.push('### 4. Feature Flag Testing');
  report.push('Test with different environment configurations:');
  report.push('```bash');
  report.push('# Test with all flags enabled');
  report.push('NEXT_PUBLIC_FEATURE_FLAGS=all npm run dev');
  report.push('');
  report.push('# Test with minimal flags');
  report.push('NEXT_PUBLIC_FEATURE_FLAGS=minimal npm run dev');
  report.push('```');
  report.push('');
  
  // Git Commands Preview
  report.push('## Git Commands Preview (DO NOT EXECUTE)');
  report.push('');
  report.push('The following commands would remove the safe deletion set:');
  report.push('');
  report.push('```bash');
  report.push('# PREVIEW ONLY - DO NOT EXECUTE');
  
  for (const finding of safeToRemove.slice(0, 10)) {
    report.push(`git rm "${finding.file}"`);
  }
  
  if (safeToRemove.length > 10) {
    report.push(`# ... and ${safeToRemove.length - 10} more files`);
  }
  
  report.push('```');
  report.push('');
  
  // Top 20 Largest Unused Modules
  const largestUnused = findings.findings
    .filter(f => f.status === 'unused')
    .sort((a, b) => b.size.bytes - a.size.bytes)
    .slice(0, 20);
  
  if (largestUnused.length > 0) {
    report.push('## Top 20 Largest Unused Modules');
    report.push('');
    report.push('| File | Size | Lines | Exports | Action |');
    report.push('|------|------|-------|---------|--------|');
    
    for (const finding of largestUnused) {
      report.push(`| \`${finding.file}\` | ${formatBytes(finding.size.bytes)} | ${finding.size.lines} | ${finding.exportedSymbols.length} | ${finding.safetyCheck.updatedAction} |`);
    }
    
    report.push('');
  }
  
  // Recommendations
  report.push('## Recommendations');
  report.push('');
  report.push('### Phase 1: Safe Removals');
  report.push(`1. Remove the ${findings.summary.safeToRemoveAfterCheck} files in the "Safe Deletion Set"`);
  report.push('2. Run full test suite to verify no breakage');
  report.push('3. Create PR: `chore: dead-code sweep (safe removals)`');
  report.push('');
  report.push('### Phase 2: Inline Migrations');
  report.push(`1. Inline the ${findings.summary.canInline} small helper files`);
  report.push('2. Update imports in consuming files');
  report.push('3. Create PR: `refactor: inline deprecated helpers`');
  report.push('');
  report.push('### Phase 3: Manual Review');
  report.push(`1. Review the ${blocked.length} blocked files manually`);
  report.push('2. Verify dynamic references are not critical');
  report.push('3. Move confirmed unused files to `__to_delete__/` directory');
  report.push('4. Create PR: `chore: quarantine unused components`');
  report.push('');
  
  // Exclusions and Guards
  report.push('## Exclusions and Guards Applied');
  report.push('');
  report.push('This analysis excluded:');
  report.push('- `**/*.test.*`, `**/*.spec.*`, `**/*.stories.*`');
  report.push('- `__mocks__/**`, `__tests__/**`');
  report.push('- `node_modules`, `.next`, `.turbo`, `dist`, `build`, `coverage`');
  report.push('- API handlers reachable by URL are treated as entrypoints');
  report.push('- Feature-flag gated modules marked for manual review');
  report.push('');
  
  // Metadata
  report.push('## Analysis Metadata');
  report.push('');
  report.push(`- **Analysis Date:** ${new Date().toISOString()}`);
  report.push(`- **Total Files Processed:** ${findings.summary.totalFiles}`);
  report.push(`- **Entrypoints Identified:** ${entrypoints.nextjs_pages.length + entrypoints.api_routes.length + entrypoints.cli_scripts.length}`);
  report.push(`- **Safety Checks Performed:** ${findings.summary.checkedFiles} files checked`);
  report.push(`- **Critical References Found:** ${findings.summary.totalCriticalReferences}`);
  report.push('');
  
  return report.join('\\n');
}

// Generate the report
const markdownReport = generateMarkdownReport();

// Write to file
const outputPath = '/workspace/analysis/dead-code-report.md';
fs.writeFileSync(outputPath, markdownReport);

console.log(`Dead code report generated: ${outputPath}`);
console.log(`Report contains ${markdownReport.split('\\n').length} lines`);

// Also generate a summary JSON for programmatic access
const summary = {
  timestamp: new Date().toISOString(),
  summary: findings.summary,
  safeToRemove: findings.findings.filter(f => 
    f.safetyCheck.updatedAction === 'remove' && !f.safetyCheck.hasCriticalReferences
  ).map(f => f.file),
  canInline: findings.findings.filter(f => 
    f.safetyCheck.updatedAction === 'inline-small-bits'
  ).map(f => f.file),
  needsReview: findings.findings.filter(f => 
    f.safetyCheck.hasCriticalReferences || f.suggestedAction === 'needs_manual_review'
  ).map(f => f.file)
};

fs.writeFileSync('/workspace/analysis/summary.json', JSON.stringify(summary, null, 2));
console.log('Summary JSON written to /workspace/analysis/summary.json');