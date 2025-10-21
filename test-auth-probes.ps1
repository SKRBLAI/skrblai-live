# Test SKRBL AI Auth Probe Endpoints
# Run this script to verify auth configuration

$baseUrl = "http://localhost:3000"
Write-Host "🔍 Testing SKRBL AI Auth Probes..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Auth Probe
Write-Host "1️⃣ Testing /api/_probe/auth..." -ForegroundColor Yellow
try {
    $authResponse = Invoke-RestMethod -Uri "$baseUrl/api/_probe/auth" -Method Get
    Write-Host "   ✅ Auth probe successful" -ForegroundColor Green
    Write-Host "   Cookie Domain: $($authResponse.cookieDomain)" -ForegroundColor Gray
    Write-Host "   Auth Cookies Found: $($authResponse.authCookiesFound)" -ForegroundColor Gray
    Write-Host "   Session Present: $($authResponse.sessionPresent)" -ForegroundColor Gray
    if ($authResponse.warnings.Count -gt 0) {
        Write-Host "   ⚠️  Warnings: $($authResponse.warnings -join ', ')" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Auth probe failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Supabase Probe
Write-Host "2️⃣ Testing /api/_probe/supabase..." -ForegroundColor Yellow
try {
    $supabaseResponse = Invoke-RestMethod -Uri "$baseUrl/api/_probe/supabase" -Method Get
    Write-Host "   ✅ Supabase probe successful" -ForegroundColor Green
    Write-Host "   URL: $($supabaseResponse.url)" -ForegroundColor Gray
    Write-Host "   Anon Key Present: $($supabaseResponse.anonPresent)" -ForegroundColor Gray
    Write-Host "   Service Key Present: $($supabaseResponse.servicePresent)" -ForegroundColor Gray
    Write-Host "   Anon Connected: $($supabaseResponse.anonConnectOk)" -ForegroundColor Gray
    Write-Host "   Admin Connected: $($supabaseResponse.adminConnectOk)" -ForegroundColor Gray
    Write-Host "   Error Class: $($supabaseResponse.errorClass)" -ForegroundColor Gray
    
    if ($supabaseResponse.errorClass -ne "Success") {
        Write-Host "   ⚠️  Not fully operational!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Supabase probe failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Profile Check Probe
Write-Host "3️⃣ Testing /api/_probe/db/profile-check..." -ForegroundColor Yellow
try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/api/_probe/db/profile-check" -Method Get
    Write-Host "   ✅ Profile check probe successful" -ForegroundColor Green
    Write-Host "   Profiles - Admin: $($profileResponse.profiles.admin.success)" -ForegroundColor Gray
    Write-Host "   Profiles - Anon RLS: $($profileResponse.profiles.anon.rlsBlocked)" -ForegroundColor Gray
    Write-Host "   User Roles - Admin: $($profileResponse.userRoles.admin.success)" -ForegroundColor Gray
    Write-Host "   User Roles - Anon RLS: $($profileResponse.userRoles.anon.rlsBlocked)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Profile check probe failed: $_" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   - If all probes pass, auth system is configured correctly" -ForegroundColor Gray
Write-Host "   - RLS should be blocking anon access (this is expected)" -ForegroundColor Gray
Write-Host "   - Admin client should have full access" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Test sign-up at: $baseUrl/sign-up" -ForegroundColor Gray
Write-Host "   2. Test sign-in at: $baseUrl/sign-in" -ForegroundColor Gray
Write-Host "   3. Monitor console logs for profile sync messages" -ForegroundColor Gray
