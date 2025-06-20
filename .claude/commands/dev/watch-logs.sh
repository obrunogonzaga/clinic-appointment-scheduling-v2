#!/bin/bash

# Watch logs from all services
# Usage: ./watch-logs.sh [service]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

SERVICE="${1:-all}"

echo -e "${GREEN}📋 Watching logs for: ${YELLOW}$SERVICE${NC}"

# Change to project root
cd "$(dirname "$0")/../.."

# Function to colorize logs
colorize_logs() {
    while IFS= read -r line; do
        case "$line" in
            *ERROR*|*Error*|*error*)
                echo -e "${RED}$line${NC}"
                ;;
            *WARNING*|*Warning*|*warning*)
                echo -e "${YELLOW}$line${NC}"
                ;;
            *INFO*|*Info*|*info*)
                echo -e "${BLUE}$line${NC}"
                ;;
            *DEBUG*|*Debug*|*debug*)
                echo -e "${CYAN}$line${NC}"
                ;;
            *SUCCESS*|*Success*|*success*|*✓*)
                echo -e "${GREEN}$line${NC}"
                ;;
            *)
                echo "$line"
                ;;
        esac
    done
}

# Check if using Docker
if docker-compose -f docker/docker-compose.yml ps 2>/dev/null | grep -q "Up"; then
    echo -e "${YELLOW}Using Docker logs...${NC}"
    
    case "$SERVICE" in
        "all")
            docker-compose -f docker/docker-compose.yml logs -f --tail=50 | colorize_logs
            ;;
        "api"|"backend")
            docker-compose -f docker/docker-compose.yml logs -f --tail=50 api | colorize_logs
            ;;
        "mongodb"|"mongo"|"db")
            docker-compose -f docker/docker-compose.yml logs -f --tail=50 mongodb | colorize_logs
            ;;
        "redis")
            docker-compose -f docker/docker-compose.yml logs -f --tail=50 redis | colorize_logs
            ;;
        *)
            echo -e "${RED}Unknown service: $SERVICE${NC}"
            echo "Available services: all, api, mongodb, redis"
            exit 1
            ;;
    esac
else
    echo -e "${YELLOW}Using local logs...${NC}"
    
    # Create a temporary directory for log aggregation
    LOG_DIR="/tmp/clinic-logs"
    mkdir -p $LOG_DIR
    
    # Function to tail log with prefix
    tail_with_prefix() {
        local prefix=$1
        local file=$2
        local color=$3
        
        if [ -f "$file" ]; then
            tail -f "$file" | while IFS= read -r line; do
                echo -e "${color}[$prefix]${NC} $line"
            done &
        fi
    }
    
    case "$SERVICE" in
        "all")
            # Watch all log files
            tail_with_prefix "API" "backend/logs/app.log" "$MAGENTA" | colorize_logs &
            tail_with_prefix "FRONTEND" "frontend/npm-debug.log" "$CYAN" | colorize_logs &
            tail_with_prefix "MONGODB" "/usr/local/var/log/mongodb/mongo.log" "$BLUE" | colorize_logs &
            
            # Also watch console output if available
            if [ -f .backend.pid ]; then
                BACKEND_PID=$(cat .backend.pid)
                if ps -p $BACKEND_PID > /dev/null 2>&1; then
                    echo -e "${YELLOW}Also watching backend console output${NC}"
                fi
            fi
            
            wait
            ;;
        "api"|"backend")
            if [ -f "backend/logs/app.log" ]; then
                tail -f backend/logs/app.log | colorize_logs
            else
                echo -e "${RED}No backend logs found${NC}"
                echo "Make sure the backend is running"
            fi
            ;;
        "frontend")
            # Try multiple possible log locations
            if [ -f "frontend/npm-debug.log" ]; then
                tail -f frontend/npm-debug.log | colorize_logs
            else
                echo -e "${YELLOW}No frontend log file found, showing console output${NC}"
                echo -e "${YELLOW}Run frontend in a separate terminal to see live logs${NC}"
            fi
            ;;
        *)
            echo -e "${RED}Unknown service: $SERVICE${NC}"
            echo "Available services: all, api, frontend"
            exit 1
            ;;
    esac
fi

# Trap Ctrl+C to clean up
trap 'echo -e "\n${YELLOW}Stopped watching logs${NC}"; kill $(jobs -p) 2>/dev/null; exit' INT

# Keep script running
wait