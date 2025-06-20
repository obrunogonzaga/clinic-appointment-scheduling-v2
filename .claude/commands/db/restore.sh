#!/bin/bash

# Restore database from backup
# Usage: ./restore.sh <backup-name>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}Error: Backup name required${NC}"
    echo "Usage: ./restore.sh <backup-name>"
    echo
    echo "Available backups:"
    ls -1 backups/*.gz 2>/dev/null | sed 's/backups\///g' | sed 's/\.gz//g' || echo "No backups found"
    exit 1
fi

BACKUP_NAME="$1"
BACKUP_DIR="backups"
DB_NAME="lab_scheduler"

echo -e "${GREEN}🔄 Restoring Database from Backup${NC}"

# Change to project root
cd "$(dirname "$0")/../.."

# Check if backup exists
if [ ! -f "$BACKUP_DIR/${BACKUP_NAME}.gz" ]; then
    # Try without .gz extension
    if [ ! -f "$BACKUP_DIR/${BACKUP_NAME}" ]; then
        echo -e "${RED}Error: Backup not found: ${BACKUP_NAME}${NC}"
        echo "Available backups:"
        ls -1 backups/*.gz 2>/dev/null | sed 's/backups\///g' | sed 's/\.gz//g' || echo "No backups found"
        exit 1
    else
        BACKUP_FILE="$BACKUP_DIR/${BACKUP_NAME}"
    fi
else
    BACKUP_FILE="$BACKUP_DIR/${BACKUP_NAME}.gz"
fi

# Show backup info if available
if [ -f "$BACKUP_DIR/${BACKUP_NAME}.info" ]; then
    echo -e "${CYAN}Backup Information:${NC}"
    cat "$BACKUP_DIR/${BACKUP_NAME}.info"
    echo
fi

# Confirmation
echo -e "${YELLOW}⚠️  Warning: This will replace all data in the ${DB_NAME} database!${NC}"
read -p "Are you sure you want to restore? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

# Create a backup of current data before restoring
echo -e "${YELLOW}Creating backup of current data...${NC}"
./commands/db/backup.sh "pre_restore_$(date +%Y%m%d_%H%M%S)"

# Determine MongoDB connection
if docker ps | grep -q lab_scheduler_mongodb; then
    echo -e "${YELLOW}Using Docker MongoDB...${NC}"
    MONGO_USER="admin"
    MONGO_PASS="admin123"
    USE_DOCKER=true
else
    echo -e "${YELLOW}Using local MongoDB...${NC}"
    USE_DOCKER=false
fi

# Restore backup
echo -e "${CYAN}Restoring backup...${NC}"

if [ "$USE_DOCKER" = true ]; then
    # Copy backup file to container and restore
    docker cp "$BACKUP_FILE" lab_scheduler_mongodb:/tmp/restore.gz
    
    docker exec lab_scheduler_mongodb mongorestore \
        --authenticationDatabase admin \
        --username "$MONGO_USER" \
        --password "$MONGO_PASS" \
        --gzip \
        --drop \
        --archive=/tmp/restore.gz
    
    # Clean up
    docker exec lab_scheduler_mongodb rm /tmp/restore.gz
else
    mongorestore \
        --gzip \
        --drop \
        --archive="$BACKUP_FILE"
fi

# Verify restore
echo -e "${YELLOW}Verifying restore...${NC}"

if [ "$USE_DOCKER" = true ]; then
    COLLECTIONS=$(docker exec lab_scheduler_mongodb mongosh --quiet --eval "use ${DB_NAME}; db.getCollectionNames().length" -u "$MONGO_USER" -p "$MONGO_PASS" --authenticationDatabase admin)
    PATIENTS=$(docker exec lab_scheduler_mongodb mongosh --quiet --eval "use ${DB_NAME}; db.patients.countDocuments()" -u "$MONGO_USER" -p "$MONGO_PASS" --authenticationDatabase admin)
else
    COLLECTIONS=$(mongosh --quiet --eval "use ${DB_NAME}; db.getCollectionNames().length")
    PATIENTS=$(mongosh --quiet --eval "use ${DB_NAME}; db.patients.countDocuments()")
fi

echo -e "${GREEN}✅ Database restored successfully!${NC}"
echo -e "  Collections: ${CYAN}${COLLECTIONS}${NC}"
echo -e "  Patients: ${CYAN}${PATIENTS}${NC}"
echo
echo -e "${YELLOW}Note: You may need to restart the API server to pick up the changes.${NC}"

# Optional: Run post-restore tasks
if [ -f "backend/scripts/post_restore.py" ]; then
    echo -e "${YELLOW}Running post-restore tasks...${NC}"
    cd backend
    source venv/bin/activate 2>/dev/null || true
    python scripts/post_restore.py
    cd ..
fi