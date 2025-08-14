@echo off
echo ========================================
echo Udyam Registration Form - Setup Script
echo ========================================
echo.

echo Checking system requirements...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✓ Node.js found: 
    node --version
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed. Please install npm.
    pause
    exit /b 1
) else (
    echo ✓ npm found: 
    npm --version
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed. Please install Python 3.8+ from https://python.org/
    pause
    exit /b 1
) else (
    echo ✓ Python found: 
    python --version
)

echo.
echo ========================================
echo Setting up Python scraper...
echo ========================================
echo.

cd scraper
echo Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -r requirements.txt

echo Running scraper tests...
python -m pytest test_scraper.py -v

echo Deactivating virtual environment...
deactivate
cd ..

echo.
echo ========================================
echo Setting up Backend...
echo ========================================
echo.

cd backend
echo Installing Node.js dependencies...
npm install

echo Copying environment file...
if not exist .env (
    copy .env.example .env
    echo Please update .env with your database credentials
)

echo Generating Prisma client...
npx prisma generate

echo Running backend tests...
npm test

cd ..

echo.
echo ========================================
echo Setting up Frontend...
echo ========================================
echo.

cd frontend
echo Installing Node.js dependencies...
npm install

echo Running frontend tests...
npm test

cd ..

echo.
echo ========================================
echo Setting up Database...
echo ========================================
echo.

echo Checking if Docker is available...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Docker found. Starting PostgreSQL container...
    docker run --name udyam-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=udyam_db -p 5432:5432 -d postgres:15
    
    echo Waiting for database to be ready...
    timeout /t 10 /nobreak >nul
    
    echo Running database migrations...
    cd backend
    npx prisma db push
    cd ..
    
    echo ✓ Database setup complete
) else (
    echo Docker not found. Please install Docker Desktop or set up PostgreSQL manually.
    echo Update the DATABASE_URL in backend/.env file.
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update backend/.env with your database credentials
echo 2. Start backend: cd backend ^& npm run dev
echo 3. Start frontend: cd frontend ^& npm run dev
echo 4. Open http://localhost:3000 in your browser
echo.
echo To run the scraper:
echo cd scraper ^& python scrape_udyam.py
echo.
pause
