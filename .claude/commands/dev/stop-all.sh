#!/bin/bash

# Stop all development services
# Usage: ./stop-all.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Stopping Clinic Appointment Scheduling System${NC}"

# Change to project root
cd "$(dirname "$0")/../.."

# Stop Docker services if running
if docker-compose -f docker/docker-compose.yml ps 2>/dev/null | grep -q "Up"; then
    echo -e "${YELLOW}Stopping Docker services...${NC}"
    docker-compose -f docker/docker-compose.yml down
    echo -e "${GREEN}✓ Docker services stopped${NC}"
fi

# Stop local backend if running
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping backend API...${NC}"
        kill $BACKEND_PID
        echo -e "${GREEN}✓ Backend stopped${NC}"
    fi
    rm .backend.pid
fi

# Stop local frontend if running
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping frontend...${NC}"
        kill $FRONTEND_PID
        echo -e "${GREEN}✓ Frontend stopped${NC}"
    fi
    rm .frontend.pid
fi

# Kill any remaining processes on our ports
for port in 8000 5173; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}Killing process on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    fi
done

echo -e "${GREEN}✅ All services stopped successfully!${NC}"