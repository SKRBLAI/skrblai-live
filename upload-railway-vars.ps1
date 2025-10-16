# PowerShell script to upload all environment variables to Railway
# Usage: .\upload-railway-vars.ps1

Write-Host "Uploading environment variables to Railway..." -ForegroundColor Cyan

# Read .env.railway file
$envFile = Get-Content .env.railway

$count = 0
$errors = 0

foreach ($line in $envFile) {
    # Skip empty lines and comments
    if ($line -match '^\s*$' -or $line -match '^\s*#') {
        continue
    }
    
    # Parse key=value
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        Write-Host "Setting $key..." -ForegroundColor Yellow
        
        # Use railway variables --set
        $result = railway variables --set "$key=$value" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $count++
            Write-Host "  [OK] $key set successfully" -ForegroundColor Green
        } else {
            $errors++
            Write-Host "  [FAIL] Failed to set $key" -ForegroundColor Red
            Write-Host "     Error: $result" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Successfully set: $count variables" -ForegroundColor Green
Write-Host "  Failed: $errors variables" -ForegroundColor Red

if ($errors -eq 0) {
    Write-Host ""
    Write-Host "All variables uploaded successfully!" -ForegroundColor Green
    Write-Host "Railway will automatically redeploy with new variables." -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Some variables failed to upload. Check errors above." -ForegroundColor Yellow
}
