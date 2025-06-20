#!/bin/bash

# Backup database
# Usage: ./backup.sh [backup-name]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
BACKUP_DIR="backups"
DB_NAME="lab_scheduler"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="${1:-backup_${TIMESTAMP}}"

echo -e "${GREEN}📦 Creating Database Backup${NC}"

# Change to project root
cd "$(dirname "$0")/../.."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Determine MongoDB connection
if docker ps | grep -q lab_scheduler_mongodb; then
    echo -e "${YELLOW}Using Docker MongoDB...${NC}"
    MONGO_HOST="localhost:27017"
    MONGO_USER="admin"
    MONGO_PASS="admin123"
    USE_DOCKER=true
else
    echo -e "${YELLOW}Using local MongoDB...${NC}"
    MONGO_HOST="localhost:27017"
    USE_DOCKER=false
fi

# Create backup
echo -e "${CYAN}Creating backup: ${BACKUP_NAME}${NC}"

if [ "$USE_DOCKER" = true ]; then
    docker exec lab_scheduler_mongodb mongodump \
        --authenticationDatabase admin \
        --username "$MONGO_USER" \
        --password "$MONGO_PASS" \
        --db "$DB_NAME" \
        --gzip \
        --archive > "$BACKUP_DIR/${BACKUP_NAME}.gz"
else
    mongodump \
        --db "$DB_NAME" \
        --gzip \
        --archive="$BACKUP_DIR/${BACKUP_NAME}.gz"
fi

# Get backup size
BACKUP_SIZE=$(ls -lh "$BACKUP_DIR/${BACKUP_NAME}.gz" | awk '{print $5}')

# Create metadata file
cat > "$BACKUP_DIR/${BACKUP_NAME}.info" << EOF
Backup Information
==================
Name: ${BACKUP_NAME}
Date: $(date)
Database: ${DB_NAME}
Size: ${BACKUP_SIZE}
MongoDB Host: ${MONGO_HOST}
Docker: ${USE_DOCKER}

Collections backed up:
$(if [ "$USE_DOCKER" = true ]; then
    docker exec lab_scheduler_mongodb mongosh --quiet --eval "use ${DB_NAME}; db.getCollectionNames().forEach(function(c) { print(c + ': ' + db[c].countDocuments() + ' documents'); })" -u "$MONGO_USER" -p "$MONGO_PASS" --authenticationDatabase admin
else
    mongosh --quiet --eval "use ${DB_NAME}; db.getCollectionNames().forEach(function(c) { print(c + ': ' + db[c].countDocuments() + ' documents'); })"
fi)
EOF

echo -e "${GREEN}✅ Backup created successfully!${NC}"
echo -e "  Location: ${CYAN}$BACKUP_DIR/${BACKUP_NAME}.gz${NC}"
echo -e "  Size: ${CYAN}${BACKUP_SIZE}${NC}"
echo
echo -e "${YELLOW}To restore this backup, run:${NC}"
echo -e "  ./commands/db/restore.sh ${BACKUP_NAME}"

# Optional: Upload to cloud storage
if [ ! -z "$AWS_S3_BUCKET" ]; then
    echo -e "${YELLOW}Uploading to S3...${NC}"
    aws s3 cp "$BACKUP_DIR/${BACKUP_NAME}.gz" "s3://$AWS_S3_BUCKET/backups/${BACKUP_NAME}.gz"
    echo -e "${GREEN}✓ Uploaded to S3${NC}"
fi

# Clean old backups (keep last 7 days)
echo -e "${YELLOW}Cleaning old backups...${NC}"
find "$BACKUP_DIR" -name "backup_*.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "backup_*.info" -mtime +7 -delete

# List recent backups
echo -e "${CYAN}Recent backups:${NC}"
ls -lht "$BACKUP_DIR" | grep -E "\.gz$" | head -5