#!/bin/bash

# Rollback deployment
# Usage: ./rollback.sh [environment] [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
ENVIRONMENT="${1:-production}"
VERSION="${2:-previous}"

if [ "$ENVIRONMENT" == "production" ]; then
    HOST="${PROD_HOST:-prod.clinic.com}"
    USER="${PROD_USER:-deploy}"
    PATH_PREFIX="/var/www/clinic-prod"
elif [ "$ENVIRONMENT" == "staging" ]; then
    HOST="${STAGING_HOST:-staging.clinic.com}"
    USER="${STAGING_USER:-deploy}"
    PATH_PREFIX="/var/www/clinic-staging"
else
    echo -e "${RED}Error: Unknown environment: $ENVIRONMENT${NC}"
    echo "Usage: ./rollback.sh [production|staging] [version]"
    exit 1
fi

SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"

echo -e "${YELLOW}🔄 Rolling back ${ENVIRONMENT} deployment${NC}"

# Confirmation
if [ "$ENVIRONMENT" == "production" ]; then
    echo -e "${RED}⚠️  WARNING: This will rollback PRODUCTION!${NC}"
    read -p "Are you sure? (yes/no): " -r
    if [ "$REPLY" != "yes" ]; then
        echo "Rollback cancelled."
        exit 0
    fi
fi

# Connect to server and perform rollback
echo -e "${YELLOW}Connecting to ${HOST}...${NC}"

ssh -i "$SSH_KEY" "${USER}@${HOST}" << EOF
    set -e
    
    cd "${PATH_PREFIX}"
    
    # List available versions
    echo -e "${CYAN}Available versions:${NC}"
    ls -la | grep -E "^d" | grep -v current
    
    if [ "$VERSION" == "previous" ]; then
        # Find the most recent backup
        ROLLBACK_TO=\$(ls -dt backup-* 2>/dev/null | head -1)
        
        if [ -z "\$ROLLBACK_TO" ]; then
            echo -e "${RED}No backup found to rollback to${NC}"
            exit 1
        fi
    else
        ROLLBACK_TO="$VERSION"
    fi
    
    echo -e "${YELLOW}Rolling back to: \$ROLLBACK_TO${NC}"
    
    # Stop current version
    if [ -d "current" ]; then
        cd current
        docker-compose -f docker-compose.prod.yml down || true
        cd ..
    fi
    
    # Switch to rollback version
    rm -f current
    ln -s "\$ROLLBACK_TO" current
    
    # Start rolled back version
    cd current
    docker-compose -f docker-compose.prod.yml up -d
    
    echo -e "${YELLOW}Waiting for services to start...${NC}"
    sleep 15
EOF

# Verify rollback
echo -e "${YELLOW}Verifying rollback...${NC}"

# Health check
echo -n "  • API health... "
if curl -s -f "https://${HOST}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
fi

echo -n "  • Frontend... "
if curl -s -f "https://${HOST}" > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
fi

# Log rollback
echo "[$(date)] Rollback performed on ${ENVIRONMENT} to ${VERSION}" >> deployments.log

echo -e "${GREEN}✅ Rollback completed!${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Verify all services are working"
echo -e "2. Investigate what caused the need for rollback"
echo -e "3. Fix issues before next deployment"

# Send notification
if [ ! -z "$SLACK_WEBHOOK" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"⚠️  Rollback performed on ${ENVIRONMENT} environment\"}" \
        "$SLACK_WEBHOOK"
fi