#!/bin/bash

# Update all dependencies
# Usage: ./update-deps.sh [--major] [--dry-run]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Parse arguments
UPDATE_MAJOR=false
DRY_RUN=false
for arg in "$@"; do
    case $arg in
        --major)
            UPDATE_MAJOR=true
            ;;
        --dry-run)
            DRY_RUN=true
            ;;
    esac
done

echo -e "${GREEN}📦 Updating Dependencies${NC}"
[ "$UPDATE_MAJOR" = true ] && echo -e "${YELLOW}Including major version updates${NC}"
[ "$DRY_RUN" = true ] && echo -e "${YELLOW}Dry run mode - no changes will be made${NC}"

# Change to project root
cd "$(dirname "$0")/../.."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Create backup of lock files
echo -e "\n${YELLOW}Creating backup of lock files...${NC}"
BACKUP_DIR="backups/deps-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -f "frontend/package-lock.json" ]; then
    cp frontend/package-lock.json "$BACKUP_DIR/"
    echo -e "  ✓ Backed up package-lock.json"
fi

if [ -f "backend/requirements.txt" ]; then
    cp backend/requirements*.txt "$BACKUP_DIR/" 2>/dev/null || true
    echo -e "  ✓ Backed up requirements files"
fi

# Update Frontend Dependencies
echo -e "\n${CYAN}Frontend Dependencies${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd frontend

# Check for outdated packages
echo -e "${YELLOW}Checking for outdated packages...${NC}"
npm outdated || true

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Would update the following packages:${NC}"
    if [ "$UPDATE_MAJOR" = true ]; then
        npx npm-check-updates
    else
        npx npm-check-updates -t patch
    fi
else
    # Update npm itself
    echo -e "\n${YELLOW}Updating npm...${NC}"
    npm install -g npm@latest

    # Update packages
    if [ "$UPDATE_MAJOR" = true ]; then
        echo -e "\n${YELLOW}Updating all packages (including major versions)...${NC}"
        npx npm-check-updates -u
        npm install
    else
        echo -e "\n${YELLOW}Updating packages (minor and patch versions only)...${NC}"
        npm update
    fi

    # Audit and fix vulnerabilities
    echo -e "\n${YELLOW}Running security audit...${NC}"
    npm audit || true
    
    read -p "Attempt to fix vulnerabilities? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm audit fix || true
    fi
fi

# Deduplicate dependencies
if [ "$DRY_RUN" != true ]; then
    echo -e "\n${YELLOW}Deduplicating dependencies...${NC}"
    npm dedupe
fi

cd ..

# Update Backend Dependencies
echo -e "\n${CYAN}Backend Dependencies${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd backend

# Activate virtual environment if exists
if [ -d "venv" ]; then
    echo -e "${YELLOW}Activating virtual environment...${NC}"
    source venv/bin/activate
fi

# Check for outdated packages
echo -e "${YELLOW}Checking for outdated packages...${NC}"
pip list --outdated || true

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Would update the following packages:${NC}"
    pip list --outdated
else
    # Update pip itself
    echo -e "\n${YELLOW}Updating pip...${NC}"
    pip install --upgrade pip

    # Update packages
    if [ "$UPDATE_MAJOR" = true ]; then
        echo -e "\n${YELLOW}Updating all packages...${NC}"
        # Create new requirements file with latest versions
        pip freeze > requirements.current.txt
        cat requirements.txt | cut -d'=' -f1 | xargs -n1 pip install -U
        pip freeze > requirements.txt
    else
        echo -e "\n${YELLOW}Updating packages (compatible versions)...${NC}"
        pip install -r requirements.txt --upgrade
    fi

    # Update development dependencies
    if [ -f "requirements-dev.txt" ]; then
        echo -e "\n${YELLOW}Updating development dependencies...${NC}"
        pip install -r requirements-dev.txt --upgrade
    fi

    # Check for security vulnerabilities
    if command_exists safety; then
        echo -e "\n${YELLOW}Running security check...${NC}"
        safety check || true
    else
        echo -e "${YELLOW}Install 'safety' for security checks: pip install safety${NC}"
    fi
fi

cd ..

# Update Docker base images
if command_exists docker && [ "$DRY_RUN" != true ]; then
    echo -e "\n${CYAN}Docker Images${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo -e "${YELLOW}Pulling latest base images...${NC}"
    
    # Extract base images from Dockerfiles
    IMAGES=$(grep -h "^FROM" docker/Dockerfile* 2>/dev/null | awk '{print $2}' | sort -u)
    
    for image in $IMAGES; do
        echo -n "  • Pulling $image... "
        docker pull "$image" > /dev/null 2>&1 && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"
    done
fi

# Run tests after update
if [ "$DRY_RUN" != true ]; then
    echo -e "\n${CYAN}Running Tests${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Frontend tests
    echo -e "${YELLOW}Running frontend tests...${NC}"
    cd frontend
    npm test -- --watchAll=false || echo -e "${RED}⚠️  Some frontend tests failed${NC}"
    cd ..
    
    # Backend tests
    echo -e "\n${YELLOW}Running backend tests...${NC}"
    cd backend
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    python -m pytest tests/ -v --tb=short || echo -e "${RED}⚠️  Some backend tests failed${NC}"
    cd ..
fi

# Generate update report
REPORT_FILE="dependency-update-$(date +%Y%m%d-%H%M%S).md"
cat > "$REPORT_FILE" << EOF
# Dependency Update Report

**Date**: $(date)
**Type**: $([ "$UPDATE_MAJOR" = true ] && echo "Major version update" || echo "Minor/patch update")

## Frontend Updates
\`\`\`
$(cd frontend && npm list --depth=0 2>/dev/null || echo "No changes")
\`\`\`

## Backend Updates
\`\`\`
$(cd backend && pip list 2>/dev/null || echo "No changes")
\`\`\`

## Security Issues
$(cd frontend && npm audit 2>/dev/null | grep -E "found|severity" || echo "No issues found")

## Test Results
- Frontend: $([ -f frontend/test-results.xml ] && echo "Passed" || echo "See logs")
- Backend: $([ -f backend/test-results.xml ] && echo "Passed" || echo "See logs")

## Rollback Instructions
To rollback to previous versions:
\`\`\`bash
# Frontend
cp $BACKUP_DIR/package-lock.json frontend/
cd frontend && npm ci

# Backend
cp $BACKUP_DIR/requirements.txt backend/
cd backend && pip install -r requirements.txt
\`\`\`
EOF

echo -e "\n${GREEN}✅ Dependency update completed!${NC}"
echo -e "\nBackup location: ${CYAN}$BACKUP_DIR${NC}"
echo -e "Update report: ${CYAN}$REPORT_FILE${NC}"
echo
echo -e "${YELLOW}Recommendations:${NC}"
echo -e "1. Review the update report"
echo -e "2. Test all critical features"
echo -e "3. Check for breaking changes in major updates"
echo -e "4. Update your code if needed"
echo -e "5. Commit the updated dependency files"

# Cleanup old backups (keep last 5)
echo -e "\n${YELLOW}Cleaning old backup files...${NC}"
ls -dt backups/deps-* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true