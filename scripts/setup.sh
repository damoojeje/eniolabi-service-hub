#!/bin/bash

# Eniolabi Service Hub - Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Eniolabi Service Hub - Setup Script"
echo "======================================"

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

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_warning "Node.js version 18+ is recommended. Current version: $NODE_VERSION"
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
}

# Check if PostgreSQL is installed
check_postgresql() {
    print_status "Checking PostgreSQL installation..."
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL is installed"
    else
        print_warning "PostgreSQL is not installed. Please install PostgreSQL 13+ first."
        echo "Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
        echo "macOS: brew install postgresql"
        echo "Windows: https://www.postgresql.org/download/windows/"
    fi
}

# Check if Redis is installed
check_redis() {
    print_status "Checking Redis installation..."
    if command -v redis-server &> /dev/null; then
        print_success "Redis is installed"
    else
        print_warning "Redis is not installed. Please install Redis 6+ first."
        echo "Ubuntu/Debian: sudo apt install redis-server"
        echo "macOS: brew install redis"
        echo "Windows: https://github.com/microsoftarchive/redis/releases"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Set up environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env.local ]; then
        cp .env.example .env.local
        print_success "Created .env.local from .env.example"
        print_warning "Please edit .env.local with your configuration before running the application"
    else
        print_warning ".env.local already exists. Skipping creation."
    fi
}

# Set up database
setup_database() {
    print_status "Setting up database..."
    
    # Check if DATABASE_URL is set
    if grep -q "your_database_credentials" .env.local; then
        print_warning "Please configure DATABASE_URL in .env.local before setting up the database"
        print_warning "Example: DATABASE_URL=\"postgresql://username:password@localhost:5433/database_name\""
        return
    fi
    
    # Push schema to database
    print_status "Pushing database schema..."
    npx prisma db push
    
    # Seed database
    print_status "Seeding database..."
    npx prisma db seed
    
    print_success "Database setup completed"
}

# Generate Prisma client
generate_prisma_client() {
    print_status "Generating Prisma client..."
    npx prisma generate
    print_success "Prisma client generated"
}

# Build application
build_application() {
    print_status "Building application..."
    npm run build
    print_success "Application built successfully"
}

# Main setup function
main() {
    echo
    print_status "Starting setup process..."
    echo
    
    # Check prerequisites
    check_nodejs
    check_postgresql
    check_redis
    
    echo
    print_status "Installing dependencies..."
    install_dependencies
    
    echo
    print_status "Setting up configuration..."
    setup_environment
    
    echo
    print_status "Generating Prisma client..."
    generate_prisma_client
    
    echo
    print_status "Setup completed successfully!"
    echo
    
    print_warning "Next steps:"
    echo "1. Edit .env.local with your configuration"
    echo "2. Set up your PostgreSQL database"
    echo "3. Configure Redis if needed"
    echo "4. Run: npm run dev"
    echo
    
    print_success "Happy coding! 🎉"
}

# Run main function
main "$@"
