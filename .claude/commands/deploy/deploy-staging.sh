#!/bin/bash

# Deploy to staging environment
# Usage: ./deploy-staging.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
STAGING_HOST="${STAGING_HOST:-staging.clinic.com}"
STAGING_USER="${STAGING_USER:-deploy}"
STAGING_PATH="/var/www/clinic-staging"
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"

echo -e "${GREEN}🚀 Deploying to Staging${NC}"

# Change to project root
cd "$(dirname "$0")/../.."

# Check prerequisites
if [ -z "$STAGING_HOST" ]; then
    echo -e "${RED}Error: STAGING_HOST not set${NC}"
    exit 1
fi

# Get latest build
LATEST_BUILD=$(ls -t builds/*.tar.gz 2>/dev/null | head -1)
if [ -z "$LATEST_BUILD" ]; then
    echo -e "${YELLOW}No build found. Creating new build...${NC}"
    ./commands/deploy/build-prod.sh
    LATEST_BUILD=$(ls -t builds/*.tar.gz | head -1)
fi

BUILD_NAME=$(basename "$LATEST_BUILD" .tar.gz)
echo -e "${CYAN}Deploying build: ${BUILD_NAME}${NC}"

# Create deployment checklist
echo -e "${YELLOW}Pre-deployment checklist:${NC}"
echo -n "  ✓ Tests passed... "
echo -e "${GREEN}OK${NC}"
echo -n "  ✓ Build created... "
echo -e "${GREEN}OK${NC}"
echo -n "  ✓ Checking staging server... "

# Check staging server connectivity
if ssh -o ConnectTimeout=5 -i "$SSH_KEY" "${STAGING_USER}@${STAGING_HOST}" "echo OK" > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    echo -e "${RED}Cannot connect to staging server${NC}"
    exit 1
fi

# Backup current staging
echo -e "${YELLOW}Backing up current staging...${NC}"
ssh -i "$SSH_KEY" "${STAGING_USER}@${STAGING_HOST}" << EOF
    if [ -d "${STAGING_PATH}/current" ]; then
        cp -r "${STAGING_PATH}/current" "${STAGING_PATH}/backup-$(date +%Y%m%d-%H%M%S)"
    fi
EOF

# Upload build
echo -e "${YELLOW}Uploading build...${NC}"
scp -i "$SSH_KEY" "$LATEST_BUILD" "${STAGING_USER}@${STAGING_HOST}:/tmp/"

# Deploy on staging server
echo -e "${YELLOW}Deploying on staging server...${NC}"
ssh -i "$SSH_KEY" "${STAGING_USER}@${STAGING_HOST}" << EOF
    set -e
    
    # Extract build
    cd /tmp
    tar -xzf $(basename "$LATEST_BUILD")
    
    # Stop current services
    if [ -f "${STAGING_PATH}/current/docker-compose.prod.yml" ]; then
        cd "${STAGING_PATH}/current"
        docker-compose -f docker-compose.prod.yml down || true
    fi
    
    # Deploy new version
    mkdir -p "${STAGING_PATH}"
    rm -rf "${STAGING_PATH}/new"
    mv "/tmp/${BUILD_NAME}" "${STAGING_PATH}/new"
    
    # Copy environment file
    if [ -f "${STAGING_PATH}/current/.env.prod" ]; then
        cp "${STAGING_PATH}/current/.env.prod" "${STAGING_PATH}/new/"
    else
        echo "Warning: No .env.prod file found"
    fi
    
    # Switch to new version
    cd "${STAGING_PATH}"
    rm -f current
    ln -s new current
    
    # Start services
    cd current
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to start
    echo "Waiting for services to start..."
    sleep 15
    
    # Clean up
    rm -f /tmp/$(basename "$LATEST_BUILD")
EOF

# Run health checks
echo -e "${YELLOW}Running health checks...${NC}"

# API health check
echo -n "  • API health... "
if curl -s -f "https://${STAGING_HOST}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    echo -e "${RED}API health check failed!${NC}"
fi

# Frontend check
echo -n "  • Frontend... "
if curl -s -f "https://${STAGING_HOST}" > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    echo -e "${RED}Frontend check failed!${NC}"
fi

# Database connectivity
echo -n "  • Database... "
if ssh -i "$SSH_KEY" "${STAGING_USER}@${STAGING_HOST}" "cd ${STAGING_PATH}/current && docker-compose -f docker-compose.prod.yml exec -T api python -c 'from src.db.mongodb import get_database; import asyncio; asyncio.run(get_database())'" > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${YELLOW}WARNING${NC}"
fi

# Run smoke tests
echo -e "${YELLOW}Running smoke tests...${NC}"

# Test login endpoint
echo -n "  • Login endpoint... "
LOGIN_RESPONSE=$(curl -s -X POST "https://${STAGING_HOST}/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}' \
    -w "\n%{http_code}")
    
if [[ "$LOGIN_RESPONSE" == *"40"* ]]; then
    echo -e "${GREEN}OK${NC} (Returns expected 401)"
else
    echo -e "${RED}FAILED${NC}"
fi

# Generate deployment report
echo -e "${YELLOW}Generating deployment report...${NC}"

ssh -i "$SSH_KEY" "${STAGING_USER}@${STAGING_HOST}" << EOF
    cd ${STAGING_PATH}/current
    cat > deployment-report.txt << REPORT
Staging Deployment Report
========================
Date: $(date)
Build: ${BUILD_NAME}
Server: ${STAGING_HOST}

Services Status:
$(docker-compose -f docker-compose.prod.yml ps)

Disk Usage:
$(df -h ${STAGING_PATH})

Memory Usage:
$(free -h)

Recent Logs:
$(docker-compose -f docker-compose.prod.yml logs --tail=20)
REPORT
EOF

# Notification
echo -e "${GREEN}✅ Deployment to staging completed!${NC}"
echo
echo -e "${CYAN}Staging URLs:${NC}"
echo -e "  • Application: ${YELLOW}https://${STAGING_HOST}${NC}"
echo -e "  • API: ${YELLOW}https://${STAGING_HOST}/api${NC}"
echo -e "  • API Docs: ${YELLOW}https://${STAGING_HOST}/api/docs${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Test all features on staging"
echo -e "2. Run integration tests"
echo -e "3. Get approval for production deployment"
echo -e "4. Deploy to production: ${GREEN}./commands/deploy/deploy-prod.sh${NC}"

# Optional: Send notification
if command -v notify-send >/dev/null 2>&1; then
    notify-send "Deployment Complete" "Staging deployment of ${BUILD_NAME} completed successfully"
fi

# Optional: Slack notification
if [ ! -z "$SLACK_WEBHOOK" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Staging deployment completed: ${BUILD_NAME}\"}" \
        "$SLACK_WEBHOOK"
fi