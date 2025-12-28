# ============================================
# SIMPLE EXTERNAL SERVICES SETUP
# Run each section separately
# ============================================

Write-Host "================================" -ForegroundColor Cyan
Write-Host "EXTERNAL SERVICES SETUP" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Location: stock-manager folder" -ForegroundColor Yellow
Write-Host "Time: 15-20 minutes" -ForegroundColor Cyan
Write-Host "Cost: $0 FREE" -ForegroundColor Green
Write-Host ""
Write-Host "Press Enter to start Step 1..."
$null = Read-Host
Write-Host ""
Write-Host "STEP 1: CHECK LOCATION" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green

$current = Split-Path -Leaf (Get-Location)
Write-Host "You are in: $current" -ForegroundColor Yellow

if ($current -eq "stock-manager") {
    Write-Host " Perfect location!" -ForegroundColor Green
} else {
    Write-Host " Wrong folder!" -ForegroundColor Red
    Write-Host "Run: cd 'C:\Users\USER\Desktop\inventory-manager\stock-manager'" -ForegroundColor Cyan
    Write-Host "Then run this script again." -ForegroundColor White
    exit
}

Write-Host ""
Write-Host "Press Enter for Step 2..."
$null = Read-Host
Write-Host ""
Write-Host "STEP 2: FIX PRISMA SCHEMA" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

if (Test-Path "prisma\schema.prisma") {
    $content = Get-Content "prisma\schema.prisma" -Raw
    if ($content -match 'env\("DB_URL"\)') {
        Write-Host " Fixing DB_URL to DATABASE_URL..." -ForegroundColor Yellow
        $newContent = $content -replace 'env\("DB_URL"\)', 'env("DATABASE_URL")'
        $newContent | Set-Content "prisma\schema.prisma" -Encoding UTF8
        Write-Host " Schema fixed" -ForegroundColor Green
        
        # Regenerate
        Write-Host " Regenerating Prisma client..." -ForegroundColor White
        npx prisma generate
        Write-Host " Prisma client regenerated" -ForegroundColor Green
    } else {
        Write-Host " Schema already correct" -ForegroundColor Green
    }
} else {
    Write-Host "  No schema.prisma found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press Enter for Step 3..."
$null = Read-Host
