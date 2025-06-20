#!/bin/bash

# Reset development environment
# Usage: ./reset-env.sh [--hard]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check for hard reset flag
HARD_RESET=false
if [ "$1" == "--hard" ]; then
    HARD_RESET=true
fi

echo -e "${YELLOW}🔄 Resetting Development Environment${NC}"

# Change to project root
cd "$(dirname "$0")/../.."

# Confirmation for hard reset
if [ "$HARD_RESET" = true ]; then
    echo -e "${RED}⚠️  Warning: This will delete all data, dependencies, and Docker volumes!${NC}"
    read -p "Are you sure? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Reset cancelled."
        exit 0
    fi
fi

# Stop all services first
echo -e "${YELLOW}Stopping all services...${NC}"
./commands/dev/stop-all.sh

# Reset backend
echo -e "${YELLOW}Resetting backend...${NC}"
cd backend

# Remove Python artifacts
find . -type f -name "*.pyc" -delete
find . -type d -name "__pycache__" -delete
find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
rm -rf .coverage htmlcov/

# Reset virtual environment if hard reset
if [ "$HARD_RESET" = true ]; then
    echo "Removing virtual environment..."
    rm -rf venv
    echo "Creating fresh virtual environment..."
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pip install -r requirements-dev.txt
fi

# Reset environment file
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

cd ..

# Reset frontend
echo -e "${YELLOW}Resetting frontend...${NC}"
cd frontend

# Remove build artifacts
rm -rf dist/ build/ .parcel-cache/

# Reset node_modules if hard reset
if [ "$HARD_RESET" = true ]; then
    echo "Removing node_modules..."
    rm -rf node_modules package-lock.json
    echo "Installing fresh dependencies..."
    npm install
fi

# Reset environment file
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

cd ..

# Reset Docker if hard reset
if [ "$HARD_RESET" = true ]; then
    echo -e "${YELLOW}Resetting Docker environment...${NC}"
    docker-compose -f docker/docker-compose.yml down -v --remove-orphans
    docker system prune -f
fi

# Clean logs
echo -e "${YELLOW}Cleaning logs...${NC}"
find . -name "*.log" -type f -delete
rm -rf logs/

# Create necessary directories
echo -e "${YELLOW}Creating necessary directories...${NC}"
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p frontend/public/uploads

# Reset database with seed data
echo -e "${YELLOW}Resetting database...${NC}"
if [ "$HARD_RESET" = true ]; then
    # Start only database service
    docker-compose -f docker/docker-compose.yml up -d mongodb
    echo "Waiting for MongoDB to start..."
    sleep 10
    
    # Run initialization script
    docker exec -i lab_scheduler_mongodb mongosh < backend/scripts/mongo-init.js
    echo -e "${GREEN}✓ Database initialized with seed data${NC}"
    
    # Stop database
    docker-compose -f docker/docker-compose.yml down
fi

echo -e "${GREEN}✅ Environment reset complete!${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Review and update .env files if needed"
echo -e "2. Run ${GREEN}./commands/dev/start-all.sh${NC} to start services"
echo -e "3. Run ${GREEN}./commands/db/seed.py${NC} to add sample data"