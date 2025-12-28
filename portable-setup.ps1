# ============================================
# PORTABLE DEPLOYMENT SETUP SCRIPT
# For Inventory Management System
# Run these commands ONE AT A TIME
# ============================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "STEP 1: VERIFY CURRENT LOCATION" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check if we're in the right folder
$currentPath = Get-Location
Write-Host "Current folder: $currentPath" -ForegroundColor Yellow

# Expected folder name (should be stock-manager)
if ($currentPath -match "stock-manager$") {
    Write-Host " You're in the correct folder (stock-manager)" -ForegroundColor Green
} else {
    Write-Host "  You might be in the wrong folder" -ForegroundColor Red
    Write-Host "Expected folder ending with: stock-manager" -ForegroundColor Yellow
    Write-Host "Run this first: cd 'C:\Users\USER\Desktop\inventory-manager\stock-manager'" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press Enter to continue to Step 2..."
Read-Host
