# PowerShell script to start Project Bolt with MongoDB
Write-Host "🚀 Starting Project Bolt with MongoDB..." -ForegroundColor Green
Write-Host ""

# Check if MongoDB is running
Write-Host "📋 Checking if MongoDB is running..." -ForegroundColor Yellow
try {
    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -eq "Running") {
        Write-Host "✅ MongoDB is already running" -ForegroundColor Green
    } else {
        Write-Host "⚠️ MongoDB is not running, attempting to start..." -ForegroundColor Yellow
        Start-Service -Name "MongoDB"
        Write-Host "✅ MongoDB started successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to start MongoDB. Please install MongoDB first." -ForegroundColor Red
    Write-Host "📚 See MONGODB_SETUP.md for installation instructions" -ForegroundColor Yellow
    Read-Host "Press Enter to continue..."
    exit 1
}

Write-Host ""
Write-Host "🔧 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to continue..."
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🧪 Testing MongoDB connection..." -ForegroundColor Yellow
npm run test:db
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ MongoDB connection test failed" -ForegroundColor Red
    Write-Host "📚 Check MONGODB_SETUP.md for troubleshooting" -ForegroundColor Yellow
    Read-Host "Press Enter to continue..."
    exit 1
}

Write-Host ""
Write-Host "🌱 Seeding database with sample data..." -ForegroundColor Yellow
npm run seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Database seeding failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Starting the server..." -ForegroundColor Green
npm run dev

Read-Host "Press Enter to continue..."
