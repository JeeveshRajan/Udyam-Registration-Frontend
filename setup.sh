#!/bin/bash

# Udyam Registration Application Setup Script
# This script sets up the complete application with all dependencies

set -e

echo "🚀 Starting Udyam Registration Application Setup..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    print_success "Node.js $(node -v) ✓"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
        exit 1
    fi
    print_success "npm $(npm -v) ✓"
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.11+ first."
        exit 1
    fi
    print_success "Python $(python3 --version) ✓"
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_success "Docker $(docker --version) ✓"
    else
        print_warning "Docker not found. You can still run the application locally."
    fi
    
    # Check PostgreSQL (optional)
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL client ✓"
    else
        print_warning "PostgreSQL client not found. You can use Docker for the database."
    fi
}

# Setup Python environment
setup_python() {
    print_status "Setting up Python environment..."
    
    cd scraper
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Created Python virtual environment"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    print_success "Installed Python dependencies"
    
    cd ..
}

# Setup Backend
setup_backend() {
    print_status "Setting up Backend..."
    
    cd backend
    
    # Install dependencies
    npm install
    print_success "Installed Node.js dependencies"
    
    # Copy environment file
    if [ ! -f ".env" ]; then
        cp env.example .env
        print_success "Created .env file from template"
    fi
    
    # Generate Prisma client
    npx prisma generate
    print_success "Generated Prisma client"
    
    cd ..
}

# Setup Frontend
setup_frontend() {
    print_status "Setting up Frontend..."
    
    cd frontend
    
    # Install dependencies
    npm install
    print_success "Installed Node.js dependencies"
    
    cd ..
}

# Setup Database
setup_database() {
    print_status "Setting up Database..."
    
    # Check if Docker is available
    if command -v docker &> /dev/null; then
        print_status "Using Docker for database..."
        
        # Start PostgreSQL container
        docker run --name udyam-postgres \
            -e POSTGRES_DB=udyam_registration \
            -e POSTGRES_USER=udyam_user \
            -e POSTGRES_PASSWORD=udyam_password \
            -p 5432:5432 \
            -d postgres:15-alpine
            
        print_success "Started PostgreSQL container"
        
        # Wait for database to be ready
        print_status "Waiting for database to be ready..."
        sleep 10
        
        # Run database migrations
        cd backend
        npx prisma migrate dev --name init
        print_success "Applied database migrations"
        cd ..
        
    else
        print_warning "Docker not available. Please set up PostgreSQL manually and update the .env file."
        print_status "You can run: docker run --name udyam-postgres -e POSTGRES_DB=udyam_registration -e POSTGRES_USER=udyam_user -e POSTGRES_PASSWORD=udyam_password -p 5432:5432 -d postgres:15-alpine"
    fi
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    cd backend
    if npm test; then
        print_success "Backend tests passed"
    else
        print_warning "Some backend tests failed"
    fi
    cd ..
    
    # Python tests
    cd scraper
    source venv/bin/activate
    if python -m pytest test_scraper.py -v; then
        print_success "Python tests passed"
    else
        print_warning "Some Python tests failed"
    fi
    cd ..
}

# Start services
start_services() {
    print_status "Starting services..."
    
    # Start backend
    cd backend
    print_status "Starting backend server..."
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    sleep 5
    
    # Start frontend
    cd frontend
    print_status "Starting frontend server..."
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    sleep 5
    
    print_success "Services started successfully!"
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend: http://localhost:3001"
    echo "📊 Database: localhost:5432"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for user to stop
    trap "stop_services" INT
    wait
}

# Stop services
stop_services() {
    print_status "Stopping services..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    print_success "Services stopped"
    exit 0
}

# Main setup function
main() {
    echo "=================================================="
    echo "Udyam Registration Application Setup"
    echo "=================================================="
    echo ""
    
    # Check requirements
    check_requirements
    
    # Setup environments
    setup_python
    setup_backend
    setup_frontend
    setup_database
    
    # Run tests
    run_tests
    
    echo ""
    print_success "Setup completed successfully! 🎉"
    echo ""
    
    # Ask user if they want to start services
    read -p "Do you want to start the services now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_services
    else
        echo ""
        echo "To start the services manually:"
        echo "1. Backend: cd backend && npm run dev"
        echo "2. Frontend: cd frontend && npm run dev"
        echo ""
        echo "Or use Docker: docker-compose up"
    fi
}

# Run main function
main "$@"
