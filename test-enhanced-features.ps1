# Inventory Manager Enhanced Features Test
# This script tests all the new enhanced features

Write-Host " ENHANCED FEATURES TEST SCRIPT" -ForegroundColor Cyan
Write-Host "=" * 50

# Function to test endpoints with error handling
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Name
    )
    
    try {
        Write-Host "`n Testing: $Name" -ForegroundColor Yellow
        Write-Host "   URL: $Url" -ForegroundColor Gray
        
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5
        Write-Host "    SUCCESS" -ForegroundColor Green
        
        # Show some data if available
        if ($response -and $response.summary) {
            Write-Host "   Products: $($response.summary.totalProducts)" -ForegroundColor Gray
            Write-Host "   Value: $($response.summary.totalValue)" -ForegroundColor Gray
        } elseif ($response -and $response.Length) {
            Write-Host "   Items returned: $($response.Length)" -ForegroundColor Gray
        } elseif ($response -and $response.count) {
            Write-Host "   Count: $($response.count)" -ForegroundColor Gray
        }
        
        return $true
    } catch {
        Write-Host "    ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Test all endpoints
$endpoints = @(
    @{Url = "http://localhost:3000/api/health"; Name = "Health Check"},
    @{Url = "http://localhost:3000/api/products"; Name = "All Products"},
    @{Url = "http://localhost:3000/api/inventory/summary"; Name = "Inventory Summary"},
    @{Url = "http://localhost:3000/api/alerts/low-stock"; Name = "Low Stock Alerts"},
    @{Url = "http://localhost:3000/api/inventory/profit-by-category"; Name = "Profit by Category"},
    @{Url = "http://localhost:3000/api/inventory/suppliers"; Name = "Suppliers List"},
    @{Url = "http://localhost:3000/api/categories"; Name = "Categories"}
)

$successCount = 0
$totalTests = $endpoints.Count

foreach ($endpoint in $endpoints) {
    if (Test-Endpoint -Url $endpoint.Url -Name $endpoint.Name) {
        $successCount++
    }
}

Write-Host "`n" + "=" * 50
Write-Host " TEST RESULTS" -ForegroundColor Cyan
Write-Host "   Tests passed: $successCount/$totalTests" -ForegroundColor $(if ($successCount -eq $totalTests) { "Green" } else { "Yellow" })

if ($successCount -eq $totalTests) {
    Write-Host "    ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host "    Some tests failed" -ForegroundColor Yellow
}

Write-Host "`n Opening browser to http://localhost:3000 ..." -ForegroundColor Cyan
try {
    Start-Process "http://localhost:3000"
    Write-Host "    Browser opened successfully" -ForegroundColor Green
} catch {
    Write-Host "    Could not open browser: $_" -ForegroundColor Red
}

Write-Host "`n Press any key to exit this test window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
