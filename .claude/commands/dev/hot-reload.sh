#!/bin/bash

# Enable hot reload for development
# Usage: ./hot-reload.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GREEN}🔥 Enabling Hot Reload for Development${NC}"

# Change to project root
cd "$(dirname "$0")/../.."

# Install nodemon for backend if not installed
if ! command -v nodemon &> /dev/null; then
    echo -e "${YELLOW}Installing nodemon globally...${NC}"
    npm install -g nodemon
fi

# Create nodemon configuration for Python
cat > nodemon.json << EOF
{
  "watch": ["backend/src"],
  "ext": "py",
  "ignore": ["*.pyc", "__pycache__/*", "backend/venv/*", "backend/tests/*"],
  "exec": "cd backend && source venv/bin/activate && uvicorn src.main:app --reload --host 0.0.0.0 --port 8000",
  "env": {
    "PYTHONUNBUFFERED": "1"
  }
}
EOF

echo -e "${CYAN}Starting services with hot reload...${NC}"

# Start MongoDB if not running
if ! docker ps | grep -q lab_scheduler_mongodb; then
    echo -e "${YELLOW}Starting MongoDB...${NC}"
    docker-compose -f docker/docker-compose.yml up -d mongodb redis
fi

# Start backend with nodemon in background
echo -e "${YELLOW}Starting backend with hot reload...${NC}"
nodemon &
BACKEND_PID=$!

# Start frontend with hot reload
echo -e "${YELLOW}Starting frontend with hot reload...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Save PIDs
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo -e "${GREEN}✅ Hot reload enabled for both frontend and backend!${NC}"
echo
echo -e "${CYAN}How it works:${NC}"
echo -e "  • Frontend: Changes to React components will update instantly"
echo -e "  • Backend: Changes to Python files will restart the server"
echo -e "  • CSS: Tailwind changes will rebuild automatically"
echo
echo -e "${YELLOW}File watchers active for:${NC}"
echo -e "  • backend/src/**/*.py"
echo -e "  • frontend/src/**/*.(js|jsx|css)"
echo
echo -e "${GREEN}Tips:${NC}"
echo -e "  • Keep terminal open to see rebuild logs"
echo -e "  • Check browser console for hot reload messages"
echo -e "  • Backend changes take ~2 seconds to restart"
echo
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Stopping hot reload...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    rm -f .backend.pid .frontend.pid nodemon.json
    exit
}

# Trap Ctrl+C
trap cleanup INT

# Wait for processes
wait