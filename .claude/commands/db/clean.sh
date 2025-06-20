#!/bin/bash

# Clean all database data
# Usage: ./clean.sh [--force]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check for force flag
FORCE=false
if [ "$1" == "--force" ]; then
    FORCE=true
fi

echo -e "${RED}🗑️  Database Cleanup${NC}"

# Change to project root
cd "$(dirname "$0")/../.."

# Configuration
DB_NAME="lab_scheduler"

# Confirmation
if [ "$FORCE" != true ]; then
    echo -e "${RED}⚠️  WARNING: This will DELETE ALL DATA in the ${DB_NAME} database!${NC}"
    echo -e "${YELLOW}This action cannot be undone!${NC}"
    echo
    read -p "Type 'DELETE ALL DATA' to confirm: " -r
    if [ "$REPLY" != "DELETE ALL DATA" ]; then
        echo "Cleanup cancelled."
        exit 0
    fi
fi

# Create backup first
echo -e "${YELLOW}Creating backup before cleanup...${NC}"
./commands/db/backup.sh "pre_clean_$(date +%Y%m%d_%H%M%S)"

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

# Get list of collections
echo -e "${YELLOW}Collections to be cleaned:${NC}"
if [ "$USE_DOCKER" = true ]; then
    docker exec lab_scheduler_mongodb mongosh --quiet \
        -u "$MONGO_USER" -p "$MONGO_PASS" --authenticationDatabase admin \
        --eval "use ${DB_NAME}; db.getCollectionNames().forEach(function(c) { print('  • ' + c + ': ' + db[c].countDocuments() + ' documents'); })"
else
    mongosh --quiet --eval "use ${DB_NAME}; db.getCollectionNames().forEach(function(c) { print('  • ' + c + ': ' + db[c].countDocuments() + ' documents'); })"
fi

echo
echo -e "${YELLOW}Cleaning database...${NC}"

# Clean all collections
if [ "$USE_DOCKER" = true ]; then
    docker exec lab_scheduler_mongodb mongosh \
        -u "$MONGO_USER" -p "$MONGO_PASS" --authenticationDatabase admin \
        --eval "use ${DB_NAME}; db.getCollectionNames().forEach(function(c) { if(c !== 'system.indexes') { db[c].deleteMany({}); print('Cleaned: ' + c); } })"
else
    mongosh --eval "use ${DB_NAME}; db.getCollectionNames().forEach(function(c) { if(c !== 'system.indexes') { db[c].deleteMany({}); print('Cleaned: ' + c); } })"
fi

echo -e "${GREEN}✅ Database cleaned successfully!${NC}"
echo
echo -e "${YELLOW}To restore data, run:${NC}"
echo -e "  ./commands/db/restore.sh <backup-name>"
echo
echo -e "${YELLOW}To add sample data, run:${NC}"
echo -e "  python commands/db/seed.py"