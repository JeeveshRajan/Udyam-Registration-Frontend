@echo off
echo ========================================
echo Fixing Udyam Registration Setup Issues
echo ========================================
echo.

echo Step 1: Fixing Python dependencies...
cd scraper
pip install -r requirements.txt
cd ..

echo.
echo Step 2: Fixing Backend dependencies...
cd backend
npm install
copy env.local .env
npx prisma generate
cd ..

echo.
echo Step 3: Fixing Frontend dependencies...
cd frontend
npm install
cd ..

echo.
echo Step 4: Setting up database...
echo Starting PostgreSQL container...
docker run --name udyam-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=udyam_db -p 5432:5432 -d postgres:15

echo Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo Running database setup...
cd backend
npx prisma db push
cd ..

echo.
echo ========================================
echo Setup Fixed Successfully!
echo ========================================
echo.
echo Now you can run:
echo 1. Backend: cd backend ^& npm run dev
echo 2. Frontend: cd frontend ^& npm run dev
echo 3. Python scraper: cd scraper ^& python scrape_udyam.py
echo.
pause
