@echo off
echo 🚀 Starting Project Bolt with MongoDB...
echo.

echo 📋 Checking if MongoDB is running...
net start MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB is already running
) else (
    echo ⚠️ MongoDB is not running, attempting to start...
    net start MongoDB
    if %errorlevel% equ 0 (
        echo ✅ MongoDB started successfully
    ) else (
        echo ❌ Failed to start MongoDB. Please install MongoDB first.
        echo 📚 See MONGODB_SETUP.md for installation instructions
        pause
        exit /b 1
    )
)

echo.
echo 🔧 Installing backend dependencies...
cd backend
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🧪 Testing MongoDB connection...
npm run test:db
if %errorlevel% neq 0 (
    echo ❌ MongoDB connection test failed
    echo 📚 Check MONGODB_SETUP.md for troubleshooting
    pause
    exit /b 1
)

echo.
echo 🌱 Seeding database with sample data...
npm run seed
if %errorlevel% neq 0 (
    echo ⚠️ Database seeding failed, but continuing...
)

echo.
echo 🚀 Starting the server...
npm run dev

pause
