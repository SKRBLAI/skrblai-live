# Migrate Supabase Imports to Barrel Export
# This script updates all Supabase imports to use the canonical barrel export

Write-Host "🔄 Migrating Supabase imports to barrel export..." -ForegroundColor Cyan
Write-Host ""

$rootPath = Split-Path -Parent $PSScriptRoot
$filesChanged = 0
$totalReplacements = 0

# Find all TypeScript files
$files = Get-ChildItem -Path $rootPath -Include *.ts,*.tsx -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch '\\node_modules\\' -and 
        $_.FullName -notmatch '\\.next\\' -and
        $_.FullName -notmatch '\\dist\\' 
    }

Write-Host "📁 Found $($files.Count) TypeScript files to check" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileChanged = $false
    
    # Replace client imports
    if ($content -match "from ['`"]@/lib/supabase/client['`"]") {
        $content = $content -replace "from ['`"]@/lib/supabase/client['`"]", "from '@/lib/supabase'"
        $fileChanged = $true
        $totalReplacements++
        Write-Host "  Updated client import in: $($file.Name)" -ForegroundColor Green
    }
    
    # Replace server imports
    if ($content -match "from ['`"]@/lib/supabase/server['`"]") {
        $content = $content -replace "from ['`"]@/lib/supabase/server['`"]", "from '@/lib/supabase'"
        $fileChanged = $true
        $totalReplacements++
        Write-Host "  Updated server import in: $($file.Name)" -ForegroundColor Green
    }
    
    # Replace browser imports (legacy)
    if ($content -match "from ['`"]@/lib/supabase/browser['`"]") {
        $content = $content -replace "from ['`"]@/lib/supabase/browser['`"]", "from '@/lib/supabase'"
        $fileChanged = $true
        $totalReplacements++
        Write-Host "  Updated browser import in: $($file.Name)" -ForegroundColor Green
    }
    
    # Save if changed
    if ($fileChanged) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesChanged++
    }
}

Write-Host ""
Write-Host "✅ Migration Complete!" -ForegroundColor Green
Write-Host "   Files changed: $filesChanged" -ForegroundColor Cyan
Write-Host "   Total replacements: $totalReplacements" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Run: npm run build" -ForegroundColor White
Write-Host "   2. Test auth flows" -ForegroundColor White
Write-Host "   3. Commit changes" -ForegroundColor White
