# PowerShell script to start Project Bolt - Backend and Frontend
Write-Host "Starting Project Bolt - Backend and Frontend" -ForegroundColor Green
Write-Host ""

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -eq "Running") {
        Write-Host "MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "MongoDB is not running, attempting to start..." -ForegroundColor Yellow
        Start-Service -Name "MongoDB"
        Write-Host "MongoDB started successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "Failed to start MongoDB. Please install MongoDB first." -ForegroundColor Red
    Read-Host "Press Enter to continue..."
    exit 1
}

Write-Host "Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location backend; npm run dev" -WindowStyle Normal

Write-Host "Waiting 3 seconds for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5177" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
