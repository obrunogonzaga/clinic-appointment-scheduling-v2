#!/bin/bash

# Clean old log files
# Usage: ./clean-logs.sh [days]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
DAYS="${1:-7}"
DRY_RUN="${2:-false}"

echo -e "${GREEN}🧹 Cleaning Log Files${NC}"
echo -e "Removing logs older than ${CYAN}${DAYS} days${NC}"

# Change to project root
cd "$(dirname "$0")/../.."

# Function to format file size
format_size() {
    local size=$1
    if [ $size -ge 1073741824 ]; then
        echo "$(( size / 1073741824 ))GB"
    elif [ $size -ge 1048576 ]; then
        echo "$(( size / 1048576 ))MB"
    elif [ $size -ge 1024 ]; then
        echo "$(( size / 1024 ))KB"
    else
        echo "${size}B"
    fi
}

# Calculate total size before cleaning
TOTAL_SIZE_BEFORE=0
LOG_COUNT=0

echo -e "${YELLOW}Finding log files...${NC}"

# Find all log files
while IFS= read -r -d '' file; do
    if [ -f "$file" ]; then
        SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
        TOTAL_SIZE_BEFORE=$((TOTAL_SIZE_BEFORE + SIZE))
        LOG_COUNT=$((LOG_COUNT + 1))
        
        if [ "$DRY_RUN" == "--dry-run" ]; then
            echo -e "  Would remove: ${CYAN}$file${NC} ($(format_size $SIZE))"
        fi
    fi
done < <(find . -name "*.log" -type f -mtime +$DAYS -print0)

if [ $LOG_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ No log files older than $DAYS days found${NC}"
    exit 0
fi

echo -e "\nFound ${CYAN}$LOG_COUNT${NC} log files"
echo -e "Total size: ${CYAN}$(format_size $TOTAL_SIZE_BEFORE)${NC}"

if [ "$DRY_RUN" == "--dry-run" ]; then
    echo -e "\n${YELLOW}This is a dry run. No files were deleted.${NC}"
    echo -e "Run without --dry-run to actually delete files."
    exit 0
fi

# Confirmation
read -p "Delete these files? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

# Clean log files
echo -e "\n${YELLOW}Cleaning log files...${NC}"

# Backend logs
if [ -d "backend/logs" ]; then
    echo -n "  • Backend logs... "
    find backend/logs -name "*.log" -type f -mtime +$DAYS -delete
    echo -e "${GREEN}✓${NC}"
fi

# Frontend logs
if [ -d "frontend" ]; then
    echo -n "  • Frontend logs... "
    find frontend -name "*.log" -type f -mtime +$DAYS -delete
    find frontend -name "npm-debug.log*" -type f -delete
    echo -e "${GREEN}✓${NC}"
fi

# Docker logs
echo -n "  • Docker logs... "
find . -name "docker-*.log" -type f -mtime +$DAYS -delete
echo -e "${GREEN}✓${NC}"

# Test logs
echo -n "  • Test logs... "
find . -name "pytest*.log" -type f -delete
find . -name "test-*.log" -type f -mtime +$DAYS -delete
echo -e "${GREEN}✓${NC}"

# Clean empty log directories
echo -n "  • Empty directories... "
find . -name "logs" -type d -empty -delete 2>/dev/null || true
echo -e "${GREEN}✓${NC}"

# Truncate active log files that are too large (>100MB)
echo -e "\n${YELLOW}Checking for large active log files...${NC}"
while IFS= read -r -d '' file; do
    SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
    if [ $SIZE -gt 104857600 ]; then # 100MB
        echo -e "  Truncating: ${CYAN}$file${NC} ($(format_size $SIZE))"
        # Keep last 1000 lines
        tail -n 1000 "$file" > "$file.tmp" && mv "$file.tmp" "$file"
    fi
done < <(find . -name "*.log" -type f -mtime -$DAYS -print0)

# Archive important logs before deletion (optional)
if [ -d "backend/logs" ] && [ "$DAYS" -gt 30 ]; then
    echo -e "\n${YELLOW}Archiving old important logs...${NC}"
    ARCHIVE_DIR="archives/logs/$(date +%Y-%m)"
    mkdir -p "$ARCHIVE_DIR"
    
    find backend/logs -name "*.log" -type f -mtime +30 -mtime -90 -exec gzip {} \; -exec mv {}.gz "$ARCHIVE_DIR/" \; 2>/dev/null || true
    echo -e "${GREEN}✓ Archived to $ARCHIVE_DIR${NC}"
fi

# Calculate space saved
TOTAL_SIZE_AFTER=0
while IFS= read -r -d '' file; do
    if [ -f "$file" ]; then
        SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
        TOTAL_SIZE_AFTER=$((TOTAL_SIZE_AFTER + SIZE))
    fi
done < <(find . -name "*.log" -type f -print0)

SPACE_SAVED=$((TOTAL_SIZE_BEFORE - TOTAL_SIZE_AFTER))

echo -e "\n${GREEN}✅ Log cleanup completed!${NC}"
echo -e "Space saved: ${CYAN}$(format_size $SPACE_SAVED)${NC}"

# Optional: Clean Docker logs
if command -v docker >/dev/null 2>&1; then
    echo -e "\n${YELLOW}Clean Docker logs?${NC}"
    read -p "This will truncate all Docker container logs (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker ps -q | xargs -I {} sh -c 'docker logs {} 2>&1 | tail -n 1000 | docker exec -i {} sh -c "cat > $(docker inspect --format='{{.LogPath}}' {})"' 2>/dev/null || true
        echo -e "${GREEN}✓ Docker logs truncated${NC}"
    fi
fi

# Create new log directories if needed
mkdir -p backend/logs frontend/logs

echo -e "\n${CYAN}Log cleanup summary:${NC}"
echo -e "  • Removed logs older than: ${DAYS} days"
echo -e "  • Space saved: $(format_size $SPACE_SAVED)"
echo -e "  • Large files truncated: Yes"
echo -e "  • Archives created: $([ -d "$ARCHIVE_DIR" ] && echo "Yes" || echo "No")"