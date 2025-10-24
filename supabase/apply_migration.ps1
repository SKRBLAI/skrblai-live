# Apply Supabase Migration Script
# This script pushes the latest migration to your remote Supabase database

$ErrorActionPreference = "Stop"

Write-Host "🚀 SKRBL AI - Supabase Migration Tool" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Get environment variables
$SUPABASE_URL = $env:NEXT_PUBLIC_SUPABASE_URL
$SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $SUPABASE_URL -or -not $SERVICE_KEY) {
    Write-Host "❌ Missing Supabase credentials in environment" -ForegroundColor Red
    Write-Host "Loading from .env.local..." -ForegroundColor Yellow
    
    # Read .env.local
    $envFile = Get-Content ".env.local"
    foreach ($line in $envFile) {
        if ($line -match "^NEXT_PUBLIC_SUPABASE_URL=(.+)$") {
            $SUPABASE_URL = $matches[1]
        }
        if ($line -match "^SUPABASE_SERVICE_ROLE_KEY=(.+)$") {
            $SERVICE_KEY = $matches[1]
        }
    }
}

Write-Host "📍 Supabase URL: $SUPABASE_URL" -ForegroundColor Green
Write-Host ""

# Extract project ref from URL
if ($SUPABASE_URL -match "https://(.+)\.supabase\.co") {
    $PROJECT_REF = $matches[1]
    Write-Host "🔑 Project Ref: $PROJECT_REF" -ForegroundColor Green
}
else {
    Write-Host "❌ Invalid Supabase URL format" -ForegroundColor Red
    exit 1
}

# Read migration file
$migrationPath = "supabase/migrations/20251024_fix_all_performance_security_warnings.sql"
if (-not (Test-Path $migrationPath)) {
    Write-Host "❌ Migration file not found: $migrationPath" -ForegroundColor Red
    exit 1
}

$migrationSQL = Get-Content $migrationPath -Raw
Write-Host "📄 Migration loaded: $($migrationSQL.Length) characters" -ForegroundColor Green
Write-Host ""

# Confirm before applying
Write-Host "⚠️  WARNING: This will modify your production database!" -ForegroundColor Yellow
Write-Host ""
Write-Host "This migration will fix:" -ForegroundColor White
Write-Host "  ✓ 16 Auth RLS InitPlan performance issues" -ForegroundColor White
Write-Host "  ✓ 31 Multiple Permissive Policies (consolidation)" -ForegroundColor White
Write-Host "  ✓ 7 Function Search Path security vulnerabilities" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "Continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "❌ Migration cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔄 Applying migration..." -ForegroundColor Cyan

# Apply via Supabase Management API
$apiUrl = "https://$PROJECT_REF.supabase.co/rest/v1/rpc"
$headers = @{
    "apikey" = $SERVICE_KEY
    "Authorization" = "Bearer $SERVICE_KEY"
    "Content-Type" = "application/json"
}

try {
    # Execute SQL via REST API (alternative: use psql)
    Write-Host "📊 Executing via direct database connection..." -ForegroundColor Yellow
    
    # Use npx supabase db execute
    $migrationSQL | npx supabase db execute --db-url "postgresql://postgres:$SERVICE_KEY@db.$PROJECT_REF.supabase.co:5432/postgres" --file -
    
    Write-Host ""
    Write-Host "✅ Migration applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run Supabase linter to verify: npx supabase db lint" -ForegroundColor White
    Write-Host "  2. Check your dashboard for policy changes" -ForegroundColor White
    Write-Host "  3. Test your app functionality" -ForegroundColor White
}
catch {
    Write-Host ""
    Write-Host "❌ Migration failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Apply via Supabase Dashboard" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql" -ForegroundColor White
    Write-Host "  2. Open: $migrationPath" -ForegroundColor White
    Write-Host "  3. Copy and execute the SQL" -ForegroundColor White
    exit 1
}
