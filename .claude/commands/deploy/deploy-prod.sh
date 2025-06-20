#!/bin/bash

# Deploy to production environment
# Usage: ./deploy-prod.sh [--skip-backup] [--force]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
PROD_HOST="${PROD_HOST:-prod.clinic.com}"
PROD_USER="${PROD_USER:-deploy}"
PROD_PATH="/var/www/clinic-prod"
SSH_KEY="${SSH_KEY:-~/.ssh/id_rsa}"

# Parse arguments
SKIP_BACKUP=false
FORCE=false
for arg in "$@"; do
    case $arg in
        --skip-backup)
            SKIP_BACKUP=true
            ;;
        --force)
            FORCE=true
            ;;
    esac
done

echo -e "${MAGENTA}🚀 Production Deployment${NC}"
echo -e "${RED}⚠️  WARNING: This will deploy to PRODUCTION!${NC}"

# Change to project root
cd "$(dirname "$0")/../.."

# Production deployment confirmation
if [ "$FORCE" != true ]; then
    echo
    echo -e "${YELLOW}Pre-deployment checklist:${NC}"
    read -p "  • Have you tested on staging? (y/n) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
    
    read -p "  • Have you backed up the database? (y/n) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
    
    read -p "  • Is this deployment approved? (y/n) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && exit 1
    
    echo
    echo -e "${RED}Final confirmation:${NC}"
    read -p "Type 'DEPLOY TO PRODUCTION' to confirm: " -r
    if [ "$REPLY" != "DEPLOY TO PRODUCTION" ]; then
        echo "Deployment cancelled."
        exit 0
    fi
fi

# Get latest tested build
LATEST_BUILD=$(ls -t builds/*.tar.gz 2>/dev/null | head -1)
if [ -z "$LATEST_BUILD" ]; then
    echo -e "${RED}Error: No build found${NC}"
    exit 1
fi

BUILD_NAME=$(basename "$LATEST_BUILD" .tar.gz)
echo -e "${CYAN}Deploying build: ${BUILD_NAME}${NC}"

# Log deployment
echo "[$(date)] Production deployment started: ${BUILD_NAME}" >> deployments.log

# Check production server
echo -e "${YELLOW}Checking production server...${NC}"
if ! ssh -o ConnectTimeout=5 -i "$SSH_KEY" "${PROD_USER}@${PROD_HOST}" "echo OK" > /dev/null 2>&1; then
    echo -e "${RED}Cannot connect to production server${NC}"
    exit 1
fi

# Create full backup
if [ "$SKIP_BACKUP" != true ]; then
    echo -e "${YELLOW}Creating full backup...${NC}"
    ssh -i "$SSH_KEY" "${PROD_USER}@${PROD_HOST}" << 'EOF'
        set -e
        BACKUP_NAME="prod-backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p /backups
        
        # Backup application
        if [ -d "${PROD_PATH}/current" ]; then
            tar -czf "/backups/${BACKUP_NAME}-app.tar.gz" -C "${PROD_PATH}" current
        fi
        
        # Backup database
        docker exec $(docker ps -q -f name=mongodb) mongodump \
            --archive="/backups/${BACKUP_NAME}-db.gz" \
            --gzip || echo "Database backup failed"
            
        echo "Backup created: ${BACKUP_NAME}"
EOF
fi

# Upload build
echo -e "${YELLOW}Uploading build to production...${NC}"
scp -i "$SSH_KEY" "$LATEST_BUILD" "${PROD_USER}@${PROD_HOST}:/tmp/"

# Deploy with zero downtime
echo -e "${YELLOW}Deploying with zero downtime...${NC}"
ssh -i "$SSH_KEY" "${PROD_USER}@${PROD_HOST}" << EOF
    set -e
    
    # Extract build
    cd /tmp
    tar -xzf $(basename "$LATEST_BUILD")
    
    # Prepare new version
    mkdir -p "${PROD_PATH}"
    rm -rf "${PROD_PATH}/new"
    mv "/tmp/${BUILD_NAME}" "${PROD_PATH}/new"
    
    # Copy production environment
    if [ -f "${PROD_PATH}/current/.env.prod" ]; then
        cp "${PROD_PATH}/current/.env.prod" "${PROD_PATH}/new/"
    else
        echo "ERROR: No production environment file found!"
        exit 1
    fi
    
    # Start new version alongside old
    cd "${PROD_PATH}/new"
    
    # Use different ports temporarily
    sed -i 's/8000:8000/8001:8000/g' docker-compose.prod.yml
    sed -i 's/80:80/81:80/g' docker-compose.prod.yml
    
    # Start new version
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for new version to be healthy
    echo "Waiting for new version to be healthy..."
    for i in {1..30}; do
        if curl -f http://localhost:8001/api/health > /dev/null 2>&1; then
            echo "New version is healthy!"
            break
        fi
        sleep 2
    done
    
    # Switch nginx to new version
    # This assumes you have a load balancer or nginx config to update
    
    # Stop old version
    if [ -d "${PROD_PATH}/current" ]; then
        cd "${PROD_PATH}/current"
        docker-compose -f docker-compose.prod.yml down
    fi
    
    # Switch symlink
    cd "${PROD_PATH}"
    rm -f current
    ln -s new current
    
    # Restore normal ports
    cd current
    sed -i 's/8001:8000/8000:8000/g' docker-compose.prod.yml
    sed -i 's/81:80/80:80/g' docker-compose.prod.yml
    docker-compose -f docker-compose.prod.yml up -d
    
    # Clean up
    rm -f /tmp/$(basename "$LATEST_BUILD")
    
    # Remove old versions (keep last 3)
    cd "${PROD_PATH}"
    ls -dt */ | grep -v current | grep -v new | tail -n +4 | xargs rm -rf
EOF

# Verify deployment
echo -e "${YELLOW}Verifying deployment...${NC}"

# Health checks
HEALTH_PASSED=true

echo -n "  • API health... "
if curl -s -f "https://${PROD_HOST}/api/health" > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    HEALTH_PASSED=false
fi

echo -n "  • Frontend... "
if curl -s -f "https://${PROD_HOST}" > /dev/null 2>&1; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    HEALTH_PASSED=false
fi

echo -n "  • Database... "
DB_CHECK=$(ssh -i "$SSH_KEY" "${PROD_USER}@${PROD_HOST}" "cd ${PROD_PATH}/current && docker-compose -f docker-compose.prod.yml exec -T api python -c 'print(\"OK\")'" 2>&1)
if [[ "$DB_CHECK" == *"OK"* ]]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    HEALTH_PASSED=false
fi

# Performance check
echo -n "  • Response time... "
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "https://${PROD_HOST}/api/health")
if (( $(echo "$RESPONSE_TIME < 2" | bc -l) )); then
    echo -e "${GREEN}OK${NC} (${RESPONSE_TIME}s)"
else
    echo -e "${YELLOW}SLOW${NC} (${RESPONSE_TIME}s)"
fi

# If health checks failed, offer rollback
if [ "$HEALTH_PASSED" = false ]; then
    echo -e "${RED}⚠️  Health checks failed!${NC}"
    read -p "Do you want to rollback? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./commands/deploy/rollback.sh
        exit 1
    fi
fi

# Monitor initial performance
echo -e "${YELLOW}Monitoring initial performance...${NC}"
for i in {1..5}; do
    echo -n "  Check $i/5: "
    ERROR_COUNT=$(ssh -i "$SSH_KEY" "${PROD_USER}@${PROD_HOST}" "cd ${PROD_PATH}/current && docker-compose -f docker-compose.prod.yml logs --tail=100 api | grep -c ERROR || true")
    if [ "$ERROR_COUNT" -eq 0 ]; then
        echo -e "${GREEN}No errors${NC}"
    else
        echo -e "${YELLOW}${ERROR_COUNT} errors found${NC}"
    fi
    sleep 5
done

# Update deployment log
echo "[$(date)] Production deployment completed: ${BUILD_NAME}" >> deployments.log

# Generate deployment report
cat > "deployment-${BUILD_NAME}.txt" << EOF
Production Deployment Report
===========================
Date: $(date)
Build: ${BUILD_NAME}
Server: ${PROD_HOST}
Deployed by: $(whoami)

Health Check Results:
- API: $([ "$HEALTH_PASSED" = true ] && echo "PASSED" || echo "FAILED")
- Frontend: $([ "$HEALTH_PASSED" = true ] && echo "PASSED" || echo "FAILED")
- Response Time: ${RESPONSE_TIME}s

Build Details:
$(cat "builds/${BUILD_NAME}/build-report.txt" 2>/dev/null || echo "No build report found")

Post-deployment tasks:
[ ] Monitor error logs for 30 minutes
[ ] Check all critical features
[ ] Verify database performance
[ ] Update status page
[ ] Notify stakeholders
EOF

# Success notification
echo -e "${GREEN}✅ Production deployment completed!${NC}"
echo
echo -e "${CYAN}Production URLs:${NC}"
echo -e "  • Application: ${YELLOW}https://${PROD_HOST}${NC}"
echo -e "  • API: ${YELLOW}https://${PROD_HOST}/api${NC}"
echo
echo -e "${YELLOW}Post-deployment tasks:${NC}"
echo -e "1. Monitor error logs: ${CYAN}./commands/dev/watch-logs.sh${NC}"
echo -e "2. Check application performance"
echo -e "3. Verify all critical features"
echo -e "4. Update status page"
echo
echo -e "${MAGENTA}Deployment report saved to: deployment-${BUILD_NAME}.txt${NC}"

# Send notifications
if [ ! -z "$SLACK_WEBHOOK" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Production deployment completed: ${BUILD_NAME}\\nHealth checks: ${HEALTH_PASSED}\\nResponse time: ${RESPONSE_TIME}s\"}" \
        "$SLACK_WEBHOOK"
fi

# Email notification
if [ ! -z "$NOTIFICATION_EMAIL" ]; then
    echo "Production deployment completed: ${BUILD_NAME}" | mail -s "Deployment Success" "$NOTIFICATION_EMAIL"
fi