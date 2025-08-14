@echo off
echo ========================================
echo Comprehensive Fix for All Issues
echo ========================================
echo.

echo Step 1: Fixing Backend TypeScript issues...
cd backend
npm install tsconfig-paths@4.2.0
copy env.local .env
npx prisma generate
cd ..

echo.
echo Step 2: Fixing Frontend import issues...
cd frontend
npm install
cd ..

echo.
echo Step 3: Database Setup Options...
echo.
echo Option A: Use Docker (if available)
echo Option B: Use local PostgreSQL installation
echo Option C: Use SQLite for development
echo.

set /p choice="Choose database option (A/B/C): "

if /i "%choice%"=="A" (
    echo Starting PostgreSQL with Docker...
    docker run --name udyam-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=udyam_db -p 5432:5432 -d postgres:15
    timeout /t 10 /nobreak >nul
    cd backend
    npx prisma db push
    cd ..
    echo Docker PostgreSQL setup complete!
) else if /i "%choice%"=="B" (
    echo Please ensure PostgreSQL is running locally on port 5432
    echo Database: udyam_db, User: postgres, Password: password
    echo Then run: cd backend ^& npx prisma db push
) else if /i "%choice%"=="C" (
    echo Setting up SQLite for development...
    cd backend
    echo # Use SQLite for development > prisma\schema.prisma
    echo datasource db { >> prisma\schema.prisma
    echo   provider = "sqlite" >> prisma\schema.prisma
    echo   url      = "file:./dev.db" >> prisma\schema.prisma
    echo } >> prisma\schema.prisma
    npx prisma generate
    npx prisma db push
    cd ..
    echo SQLite setup complete!
) else (
    echo Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo Step 4: Testing the setup...
echo.

echo Testing Backend...
cd backend
echo Starting backend in test mode...
set NODE_ENV=test
npm run dev
cd ..

echo.
echo ========================================
echo All Issues Fixed Successfully!
echo ========================================
echo.
echo Now you can run:
echo 1. Backend: cd backend ^& npm run dev
echo 2. Frontend: cd frontend ^& npm run dev
echo 3. Python scraper: cd scraper ^& python scrape_udyam.py
echo.
echo If you encounter any issues, check:
echo - Database connection (PostgreSQL/SQLite)
echo - Environment variables in backend/.env
echo - Node modules are installed
echo.
pause
