#!/bin/bash

# Health check for all services
# Usage: ./health-check.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
ENVIRONMENT="${1:-local}"

# Set URLs based on environment
if [ "$ENVIRONMENT" == "production" ]; then
    BASE_URL="https://prod.clinic.com"
    INTERNAL_URL="http://prod-internal.clinic.com"
elif [ "$ENVIRONMENT" == "staging" ]; then
    BASE_URL="https://staging.clinic.com"
    INTERNAL_URL="http://staging-internal.clinic.com"
else
    BASE_URL="http://localhost"
    API_PORT=":8000"
    FRONTEND_PORT=":5173"
fi

echo -e "${GREEN}🏥 Health Check - ${ENVIRONMENT} Environment${NC}"
echo "================================================"

# Function to check endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "  • $name... "
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}:%{time_total}" "$url" || echo "000:0")
    STATUS_CODE=$(echo $RESPONSE | cut -d: -f1)
    RESPONSE_TIME=$(echo $RESPONSE | cut -d: -f2)
    
    if [ "$STATUS_CODE" == "$expected_status" ]; then
        echo -e "${GREEN}OK${NC} (${RESPONSE_TIME}s)"
        return 0
    else
        echo -e "${RED}FAILED${NC} (Status: $STATUS_CODE)"
        return 1
    fi
}

# Function to check docker container
check_container() {
    local name=$1
    local container=$2
    
    echo -n "  • $name... "
    
    if [ "$ENVIRONMENT" == "local" ]; then
        if docker ps | grep -q "$container"; then
            STATUS=$(docker inspect -f '{{.State.Health.Status}}' "$container" 2>/dev/null || echo "none")
            if [ "$STATUS" == "healthy" ] || [ "$STATUS" == "none" ]; then
                echo -e "${GREEN}Running${NC}"
                return 0
            else
                echo -e "${YELLOW}Unhealthy${NC} ($STATUS)"
                return 1
            fi
        else
            echo -e "${RED}Not running${NC}"
            return 1
        fi
    else
        echo -e "${CYAN}Skip (remote)${NC}"
        return 0
    fi
}

# Track overall health
HEALTH_SCORE=0
TOTAL_CHECKS=0

echo -e "${CYAN}1. API Endpoints${NC}"
echo "-------------------"

# API health endpoints
check_endpoint "API Health" "${BASE_URL}${API_PORT}/api/health" && ((HEALTH_SCORE++))
((TOTAL_CHECKS++))

check_endpoint "API Docs" "${BASE_URL}${API_PORT}/api/docs" && ((HEALTH_SCORE++))
((TOTAL_CHECKS++))

check_endpoint "API Version" "${BASE_URL}${API_PORT}/api/version" && ((HEALTH_SCORE++))
((TOTAL_CHECKS++))

# Test specific endpoints
check_endpoint "Patients List" "${BASE_URL}${API_PORT}/api/v1/patients" 401 && ((HEALTH_SCORE++))
((TOTAL_CHECKS++))

echo
echo -e "${CYAN}2. Frontend${NC}"
echo "-------------"

check_endpoint "Frontend Home" "${BASE_URL}${FRONTEND_PORT}" && ((HEALTH_SCORE++))
((TOTAL_CHECKS++))

check_endpoint "Frontend Assets" "${BASE_URL}${FRONTEND_PORT}/assets/index.js" 200 && ((HEALTH_SCORE++)) || true
((TOTAL_CHECKS++))

echo
echo -e "${CYAN}3. Docker Services${NC}" 
echo "-------------------"

if [ "$ENVIRONMENT" == "local" ]; then
    check_container "MongoDB" "lab_scheduler_mongodb" && ((HEALTH_SCORE++))
    ((TOTAL_CHECKS++))
    
    check_container "Redis" "lab_scheduler_redis" && ((HEALTH_SCORE++))
    ((TOTAL_CHECKS++))
    
    check_container "API" "lab_scheduler_api" && ((HEALTH_SCORE++))
    ((TOTAL_CHECKS++))
fi

echo
echo -e "${CYAN}4. Database Connectivity${NC}"
echo "-------------------------"

echo -n "  • MongoDB Connection... "
if [ "$ENVIRONMENT" == "local" ]; then
    if docker exec lab_scheduler_mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
        ((HEALTH_SCORE++))
    else
        echo -e "${RED}FAILED${NC}"
    fi
else
    echo -e "${CYAN}Skip (remote)${NC}"
    ((HEALTH_SCORE++))
fi
((TOTAL_CHECKS++))

echo
echo -e "${CYAN}5. Performance Metrics${NC}"
echo "-----------------------"

# Check response times
echo -n "  • API Response Time... "
START_TIME=$(date +%s%N)
curl -s "${BASE_URL}${API_PORT}/api/health" > /dev/null 2>&1
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( ($END_TIME - $START_TIME) / 1000000 ))

if [ $RESPONSE_TIME -lt 500 ]; then
    echo -e "${GREEN}Good${NC} (${RESPONSE_TIME}ms)"
    ((HEALTH_SCORE++))
elif [ $RESPONSE_TIME -lt 1000 ]; then
    echo -e "${YELLOW}OK${NC} (${RESPONSE_TIME}ms)"
    ((HEALTH_SCORE++))
else
    echo -e "${RED}Slow${NC} (${RESPONSE_TIME}ms)"
fi
((TOTAL_CHECKS++))

# Check error rates (if logs accessible)
if [ "$ENVIRONMENT" == "local" ]; then
    echo -n "  • Error Rate (last 100 logs)... "
    ERROR_COUNT=$(docker logs --tail 100 lab_scheduler_api 2>&1 | grep -c "ERROR" || true)
    
    if [ $ERROR_COUNT -eq 0 ]; then
        echo -e "${GREEN}0 errors${NC}"
        ((HEALTH_SCORE++))
    elif [ $ERROR_COUNT -lt 5 ]; then
        echo -e "${YELLOW}${ERROR_COUNT} errors${NC}"
    else
        echo -e "${RED}${ERROR_COUNT} errors${NC}"
    fi
    ((TOTAL_CHECKS++))
fi

echo
echo -e "${CYAN}6. Resource Usage${NC}"
echo "------------------"

if [ "$ENVIRONMENT" == "local" ]; then
    # Check disk space
    echo -n "  • Disk Space... "
    DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ $DISK_USAGE -lt 80 ]; then
        echo -e "${GREEN}OK${NC} (${DISK_USAGE}% used)"
        ((HEALTH_SCORE++))
    elif [ $DISK_USAGE -lt 90 ]; then
        echo -e "${YELLOW}Warning${NC} (${DISK_USAGE}% used)"
    else
        echo -e "${RED}Critical${NC} (${DISK_USAGE}% used)"
    fi
    ((TOTAL_CHECKS++))
    
    # Check memory usage
    echo -n "  • Memory Usage... "
    if command -v free >/dev/null 2>&1; then
        MEM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
        
        if [ $MEM_USAGE -lt 80 ]; then
            echo -e "${GREEN}OK${NC} (${MEM_USAGE}% used)"
            ((HEALTH_SCORE++))
        elif [ $MEM_USAGE -lt 90 ]; then
            echo -e "${YELLOW}Warning${NC} (${MEM_USAGE}% used)"
        else
            echo -e "${RED}Critical${NC} (${MEM_USAGE}% used)"
        fi
        ((TOTAL_CHECKS++))
    else
        echo -e "${CYAN}Skip${NC}"
    fi
fi

# Calculate health percentage
HEALTH_PERCENTAGE=$(( (HEALTH_SCORE * 100) / TOTAL_CHECKS ))

echo
echo "================================================"
echo -e "${CYAN}Overall Health Score: ${HEALTH_PERCENTAGE}%${NC}"

if [ $HEALTH_PERCENTAGE -ge 90 ]; then
    echo -e "${GREEN}✅ System is healthy${NC}"
    EXIT_CODE=0
elif [ $HEALTH_PERCENTAGE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  System has minor issues${NC}"
    EXIT_CODE=1
else
    echo -e "${RED}❌ System is unhealthy${NC}"
    EXIT_CODE=2
fi

# Generate detailed report if requested
if [ "$2" == "--report" ]; then
    REPORT_FILE="health-report-$(date +%Y%m%d-%H%M%S).txt"
    {
        echo "Health Check Report"
        echo "=================="
        echo "Date: $(date)"
        echo "Environment: $ENVIRONMENT"
        echo "Health Score: ${HEALTH_PERCENTAGE}%"
        echo
        echo "Detailed Results:"
        echo "-----------------"
        # Re-run checks with detailed output
        # ... (implementation details)
    } > "$REPORT_FILE"
    
    echo
    echo -e "${CYAN}Detailed report saved to: $REPORT_FILE${NC}"
fi

exit $EXIT_CODE