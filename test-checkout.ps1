# Test Stripe Checkout Endpoint
# This will show you the actual error

Write-Host "Testing Stripe Checkout..." -ForegroundColor Cyan

$body = @{
    sku = "biz_plan_starter_m"
    vertical = "business"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest `
        -Uri "https://skrblai.io/api/checkout" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing

    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error:" -ForegroundColor Red
    $_.Exception.Message
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body:" -ForegroundColor Yellow
        $responseBody
    }
}
