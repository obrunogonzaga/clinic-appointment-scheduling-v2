#!/bin/bash

# Start all development services
# Usage: ./start-all.sh [--docker|--local]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to docker mode
MODE="${1:---docker}"

echo -e "${GREEN}🚀 Starting Clinic Appointment Scheduling System${NC}"
echo -e "${YELLOW}Mode: ${MODE}${NC}"

# Change to project root
cd "$(dirname "$0")/../.."

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}⚠️  Port $port is already in use${NC}"
        return 1
    fi
    return 0
}

# Function to wait for service
wait_for_service() {
    local name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    echo -n "Waiting for $name to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
            echo -e " ${GREEN}✓${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        ((attempt++))
    done
    echo -e " ${RED}✗${NC}"
    return 1
}

if [ "$MODE" == "--docker" ]; then
    echo -e "${YELLOW}Starting services with Docker...${NC}"
    
    # Check Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}Docker is not running. Please start Docker Desktop.${NC}"
        exit 1
    fi
    
    # Check required ports
    echo "Checking ports..."
    check_port 8000 || exit 1
    check_port 27017 || exit 1
    check_port 6379 || exit 1
    check_port 5173 || exit 1
    
    # Start backend services
    echo -e "${YELLOW}Starting backend services...${NC}"
    docker-compose -f docker/docker-compose.yml up -d
    
    # Wait for services to be ready
    wait_for_service "MongoDB" "http://localhost:8081" || echo "MongoDB Express not responding"
    wait_for_service "API" "http://localhost:8000/health" || exit 1
    
    # Start frontend
    echo -e "${YELLOW}Starting frontend...${NC}"
    cd frontend
    npm install
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    wait_for_service "Frontend" "http://localhost:5173" || exit 1
    
else
    echo -e "${YELLOW}Starting services locally...${NC}"
    
    # Check required ports
    echo "Checking ports..."
    check_port 8000 || exit 1
    check_port 27017 || exit 1
    check_port 5173 || exit 1
    
    # Check MongoDB is running
    if ! pgrep -x "mongod" > /dev/null; then
        echo -e "${YELLOW}Starting MongoDB...${NC}"
        mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork
    fi
    
    # Start backend
    echo -e "${YELLOW}Starting backend API...${NC}"
    cd backend
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python -m venv venv
    fi
    source venv/bin/activate
    pip install -q -r requirements.txt
    uvicorn src.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    cd ..
    
    # Start frontend
    echo -e "${YELLOW}Starting frontend...${NC}"
    cd frontend
    npm install
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait for services
    wait_for_service "API" "http://localhost:8000/health" || exit 1
    wait_for_service "Frontend" "http://localhost:5173" || exit 1
    
    # Save PIDs for stop script
    echo $BACKEND_PID > .backend.pid
    echo $FRONTEND_PID > .frontend.pid
fi

echo -e "${GREEN}✅ All services started successfully!${NC}"
echo
echo -e "${GREEN}Available services:${NC}"
echo -e "  Frontend:       ${YELLOW}http://localhost:5173${NC}"
echo -e "  API:           ${YELLOW}http://localhost:8000${NC}"
echo -e "  API Docs:      ${YELLOW}http://localhost:8000/docs${NC}"
if [ "$MODE" == "--docker" ]; then
    echo -e "  Mongo Express: ${YELLOW}http://localhost:8081${NC} (admin/admin123)"
fi
echo
echo -e "${YELLOW}To stop all services, run: ./commands/dev/stop-all.sh${NC}"
echo -e "${YELLOW}To view logs, run: ./commands/dev/watch-logs.sh${NC}"

# Keep script running if in Docker mode
if [ "$MODE" == "--docker" ]; then
    echo
    echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
    trap 'echo -e "\n${YELLOW}Stopping services...${NC}"; ./commands/dev/stop-all.sh; exit' INT
    wait
fi