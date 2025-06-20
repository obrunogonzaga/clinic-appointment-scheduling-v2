#!/bin/bash

# Run security audit on the project
# Usage: ./security-audit.sh [--fix]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
FIX_MODE=false
REPORT_FILE="security-report-$(date +%Y%m%d-%H%M%S).md"

# Parse arguments
for arg in "$@"; do
    case $arg in
        --fix)
            FIX_MODE=true
            ;;
    esac
done

echo -e "${MAGENTA}🔒 Security Audit${NC}"
echo "═══════════════════════════════════════"
[ "$FIX_MODE" = true ] && echo -e "${YELLOW}Auto-fix mode enabled${NC}\n"

# Change to project root
cd "$(dirname "$0")/../.."

# Initialize report
cat > "$REPORT_FILE" << EOF
# Security Audit Report

**Date**: $(date)
**Project**: Clinic Appointment Scheduling System

## Summary
EOF

TOTAL_ISSUES=0
CRITICAL_ISSUES=0

# Check for exposed secrets
echo -e "${CYAN}1. Checking for exposed secrets...${NC}"
echo -e "\n### Exposed Secrets Check" >> "$REPORT_FILE"

# Check for common secret patterns
SECRET_PATTERNS=(
    "password\s*=\s*['\"][^'\"]+['\"]"
    "api_key\s*=\s*['\"][^'\"]+['\"]"
    "secret_key\s*=\s*['\"][^'\"]+['\"]"
    "token\s*=\s*['\"][^'\"]+['\"]"
    "mongodb://[^:]+:[^@]+@"
)

FOUND_SECRETS=false
for pattern in "${SECRET_PATTERNS[@]}"; do
    echo -n "  • Checking for $pattern... "
    if grep -r -i -E "$pattern" --include="*.py" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=venv . 2>/dev/null | grep -v -E "example|sample|test|mock" > /dev/null; then
        echo -e "${RED}Found${NC}"
        FOUND_SECRETS=true
        ((TOTAL_ISSUES++))
        ((CRITICAL_ISSUES++))
        echo "- ⚠️  Found exposed secrets matching pattern: $pattern" >> "$REPORT_FILE"
    else
        echo -e "${GREEN}Clean${NC}"
    fi
done

if [ "$FOUND_SECRETS" = false ]; then
    echo "✅ No exposed secrets found" >> "$REPORT_FILE"
fi

# Check environment files
echo -e "\n${CYAN}2. Checking environment files...${NC}"
echo -e "\n### Environment Files" >> "$REPORT_FILE"

if [ -f ".env" ]; then
    echo -e "  ${RED}⚠️  .env file found in root (should not be committed)${NC}"
    echo "- ⚠️  .env file found in root directory" >> "$REPORT_FILE"
    ((TOTAL_ISSUES++))
fi

for env_file in $(find . -name ".env*" -not -name ".env.example" -not -name ".env.sample" -type f); do
    if git ls-files --error-unmatch "$env_file" 2>/dev/null; then
        echo -e "  ${RED}⚠️  $env_file is tracked in git${NC}"
        echo "- ⚠️  $env_file is tracked in git" >> "$REPORT_FILE"
        ((TOTAL_ISSUES++))
        ((CRITICAL_ISSUES++))
    fi
done

# Frontend security audit
echo -e "\n${CYAN}3. Frontend Security Audit${NC}"
echo -e "\n### Frontend Security" >> "$REPORT_FILE"

cd frontend

# NPM audit
echo -e "  ${YELLOW}Running npm audit...${NC}"
NPM_AUDIT=$(npm audit --json 2>/dev/null || echo '{"vulnerabilities":{}}')
VULN_COUNT=$(echo "$NPM_AUDIT" | jq '.metadata.vulnerabilities | to_entries | map(.value) | add' 2>/dev/null || echo 0)

if [ "$VULN_COUNT" -gt 0 ]; then
    echo -e "  ${RED}Found $VULN_COUNT vulnerabilities${NC}"
    echo "- Found $VULN_COUNT npm vulnerabilities" >> "../$REPORT_FILE"
    
    # Parse severity
    CRITICAL=$(echo "$NPM_AUDIT" | jq '.metadata.vulnerabilities.critical' 2>/dev/null || echo 0)
    HIGH=$(echo "$NPM_AUDIT" | jq '.metadata.vulnerabilities.high' 2>/dev/null || echo 0)
    
    echo "  - Critical: $CRITICAL" >> "../$REPORT_FILE"
    echo "  - High: $HIGH" >> "../$REPORT_FILE"
    
    ((TOTAL_ISSUES+=VULN_COUNT))
    ((CRITICAL_ISSUES+=CRITICAL))
    
    if [ "$FIX_MODE" = true ]; then
        echo -e "  ${YELLOW}Attempting to fix...${NC}"
        npm audit fix
    fi
else
    echo -e "  ${GREEN}✓ No vulnerabilities found${NC}"
    echo "✅ No npm vulnerabilities found" >> "../$REPORT_FILE"
fi

# Check for dangerous functions
echo -e "\n  ${YELLOW}Checking for dangerous functions...${NC}"
DANGEROUS_PATTERNS=(
    "dangerouslySetInnerHTML"
    "eval("
    "new Function("
    "innerHTML\s*="
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    COUNT=$(grep -r "$pattern" src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l || echo 0)
    if [ $COUNT -gt 0 ]; then
        echo -e "  ${YELLOW}⚠️  Found $COUNT instances of $pattern${NC}"
        echo "- ⚠️  Found $COUNT instances of $pattern" >> "../$REPORT_FILE"
        ((TOTAL_ISSUES+=COUNT))
    fi
done

cd ..

# Backend security audit
echo -e "\n${CYAN}4. Backend Security Audit${NC}"
echo -e "\n### Backend Security" >> "$REPORT_FILE"

cd backend

# Activate venv if exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Check Python dependencies
if command -v safety >/dev/null 2>&1; then
    echo -e "  ${YELLOW}Running safety check...${NC}"
    SAFETY_OUTPUT=$(safety check --json 2>/dev/null || echo '[]')
    SAFETY_COUNT=$(echo "$SAFETY_OUTPUT" | jq 'length' 2>/dev/null || echo 0)
    
    if [ "$SAFETY_COUNT" -gt 0 ]; then
        echo -e "  ${RED}Found $SAFETY_COUNT vulnerabilities${NC}"
        echo "- Found $SAFETY_COUNT Python vulnerabilities" >> "../$REPORT_FILE"
        ((TOTAL_ISSUES+=SAFETY_COUNT))
    else
        echo -e "  ${GREEN}✓ No vulnerabilities found${NC}"
        echo "✅ No Python vulnerabilities found" >> "../$REPORT_FILE"
    fi
else
    echo -e "  ${YELLOW}Install 'safety' for Python vulnerability scanning${NC}"
    echo "- ⚠️  'safety' not installed - run: pip install safety" >> "../$REPORT_FILE"
fi

# Check for common security issues
echo -e "\n  ${YELLOW}Checking for security issues...${NC}"

# SQL injection vulnerabilities
SQL_INJECT=$(grep -r -E "f['\"].*SELECT|f['\"].*INSERT|f['\"].*UPDATE|f['\"].*DELETE" src/ --include="*.py" 2>/dev/null | wc -l || echo 0)
if [ $SQL_INJECT -gt 0 ]; then
    echo -e "  ${RED}⚠️  Potential SQL injection: $SQL_INJECT instances${NC}"
    echo "- ⚠️  Potential SQL injection vulnerabilities: $SQL_INJECT" >> "../$REPORT_FILE"
    ((TOTAL_ISSUES+=SQL_INJECT))
    ((CRITICAL_ISSUES+=SQL_INJECT))
fi

# Hardcoded passwords
HARDCODED=$(grep -r -E "password\s*=\s*['\"][^'\"]+['\"]" src/ --include="*.py" 2>/dev/null | grep -v -E "getenv|environ|config" | wc -l || echo 0)
if [ $HARDCODED -gt 0 ]; then
    echo -e "  ${RED}⚠️  Hardcoded passwords: $HARDCODED instances${NC}"
    echo "- ⚠️  Hardcoded passwords found: $HARDCODED" >> "../$REPORT_FILE"
    ((TOTAL_ISSUES+=HARDCODED))
    ((CRITICAL_ISSUES+=HARDCODED))
fi

cd ..

# Check Docker security
echo -e "\n${CYAN}5. Docker Security Audit${NC}"
echo -e "\n### Docker Security" >> "$REPORT_FILE"

if [ -f "docker/Dockerfile" ]; then
    echo -e "  ${YELLOW}Analyzing Dockerfile...${NC}"
    
    # Check for running as root
    if ! grep -q "USER" docker/Dockerfile; then
        echo -e "  ${YELLOW}⚠️  Container runs as root${NC}"
        echo "- ⚠️  Docker container runs as root user" >> "$REPORT_FILE"
        ((TOTAL_ISSUES++))
    fi
    
    # Check for latest tags
    if grep -E "FROM.*:latest" docker/Dockerfile > /dev/null; then
        echo -e "  ${YELLOW}⚠️  Using 'latest' tag in Dockerfile${NC}"
        echo "- ⚠️  Using 'latest' tag in Dockerfile (specify version)" >> "$REPORT_FILE"
        ((TOTAL_ISSUES++))
    fi
fi

# Check HTTPS/TLS
echo -e "\n${CYAN}6. HTTPS/TLS Configuration${NC}"
echo -e "\n### HTTPS/TLS Configuration" >> "$REPORT_FILE"

# Check for HTTP URLs in code
HTTP_URLS=$(grep -r "http://" --include="*.py" --include="*.js" --include="*.jsx" --exclude-dir=node_modules --exclude-dir=venv . 2>/dev/null | grep -v -E "localhost|127.0.0.1|example|test" | wc -l || echo 0)
if [ $HTTP_URLS -gt 0 ]; then
    echo -e "  ${YELLOW}⚠️  Found $HTTP_URLS HTTP URLs (should be HTTPS)${NC}"
    echo "- ⚠️  Found $HTTP_URLS HTTP URLs in code" >> "$REPORT_FILE"
    ((TOTAL_ISSUES+=HTTP_URLS))
fi

# Check CORS configuration
echo -e "\n${CYAN}7. CORS Configuration${NC}"
echo -e "\n### CORS Configuration" >> "$REPORT_FILE"

if grep -r "CORS.*\*" backend/src/ --include="*.py" 2>/dev/null > /dev/null; then
    echo -e "  ${RED}⚠️  CORS allows all origins (*)${NC}"
    echo "- ⚠️  CORS configured to allow all origins" >> "$REPORT_FILE"
    ((TOTAL_ISSUES++))
    ((CRITICAL_ISSUES++))
else
    echo -e "  ${GREEN}✓ CORS properly configured${NC}"
    echo "✅ CORS properly configured" >> "$REPORT_FILE"
fi

# Check authentication
echo -e "\n${CYAN}8. Authentication Security${NC}"
echo -e "\n### Authentication Security" >> "$REPORT_FILE"

# Check JWT secret
if grep -r "JWT.*secret.*=.*['\"].*['\"]" backend/src/ --include="*.py" 2>/dev/null | grep -v -E "getenv|environ|config" > /dev/null; then
    echo -e "  ${RED}⚠️  Hardcoded JWT secret${NC}"
    echo "- ⚠️  Hardcoded JWT secret found" >> "$REPORT_FILE"
    ((TOTAL_ISSUES++))
    ((CRITICAL_ISSUES++))
fi

# Check password hashing
if ! grep -r "bcrypt\|argon2\|pbkdf2" backend/ --include="*.py" 2>/dev/null > /dev/null; then
    echo -e "  ${YELLOW}⚠️  No password hashing library found${NC}"
    echo "- ⚠️  No password hashing library detected" >> "$REPORT_FILE"
    ((TOTAL_ISSUES++))
fi

# Generate recommendations
echo -e "\n## Recommendations" >> "$REPORT_FILE"

if [ $CRITICAL_ISSUES -gt 0 ]; then
    cat >> "$REPORT_FILE" << EOF

### Critical Issues (Fix Immediately)
1. Remove all hardcoded secrets and use environment variables
2. Fix SQL injection vulnerabilities by using parameterized queries
3. Update CORS configuration to specific origins
4. Address critical npm/pip vulnerabilities

EOF
fi

cat >> "$REPORT_FILE" << EOF

### Best Practices
1. Enable MFA for all admin accounts
2. Implement rate limiting on all endpoints
3. Use HTTPS everywhere
4. Regular security updates
5. Implement proper logging and monitoring
6. Use principle of least privilege
7. Regular security training for developers

### Security Headers
Add these headers to improve security:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Content-Security-Policy: default-src 'self'

EOF

# Summary
echo -e "\n## Summary Statistics" >> "$REPORT_FILE"
echo "- Total Issues Found: $TOTAL_ISSUES" >> "$REPORT_FILE"
echo "- Critical Issues: $CRITICAL_ISSUES" >> "$REPORT_FILE"
echo "- Date: $(date)" >> "$REPORT_FILE"

# Display summary
echo
echo "═══════════════════════════════════════"
echo -e "${CYAN}Security Audit Summary${NC}"
echo "═══════════════════════════════════════"
echo -e "Total Issues: ${YELLOW}$TOTAL_ISSUES${NC}"
echo -e "Critical Issues: ${RED}$CRITICAL_ISSUES${NC}"
echo
echo -e "Report saved to: ${CYAN}$REPORT_FILE${NC}"

if [ $CRITICAL_ISSUES -gt 0 ]; then
    echo
    echo -e "${RED}⚠️  CRITICAL SECURITY ISSUES FOUND!${NC}"
    echo -e "${YELLOW}Please review the report and fix immediately.${NC}"
    exit 1
elif [ $TOTAL_ISSUES -gt 0 ]; then
    echo
    echo -e "${YELLOW}⚠️  Security issues found. Please review the report.${NC}"
    exit 0
else
    echo
    echo -e "${GREEN}✅ No major security issues found!${NC}"
    exit 0
fi