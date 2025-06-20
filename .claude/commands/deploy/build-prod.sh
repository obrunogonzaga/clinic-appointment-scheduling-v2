#!/bin/bash

# Build application for production
# Usage: ./build-prod.sh [--tag=latest]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
TAG="${1:-latest}"
REGISTRY="${DOCKER_REGISTRY:-}"
PROJECT_NAME="clinic-scheduler"
BUILD_ID=$(date +%Y%m%d-%H%M%S)

echo -e "${GREEN}🏗️  Building for Production${NC}"
echo -e "Build ID: ${CYAN}${BUILD_ID}${NC}"

# Change to project root
cd "$(dirname "$0")/../.."

# Create build directory
BUILD_DIR="builds/${BUILD_ID}"
mkdir -p "$BUILD_DIR"

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Run tests first
echo -e "${YELLOW}Running tests...${NC}"

# Backend tests
if [ -d "backend/venv" ]; then
    cd backend
    source venv/bin/activate
    python -m pytest tests/ --quiet || {
        echo -e "${RED}Backend tests failed!${NC}"
        exit 1
    }
    deactivate
    cd ..
fi

# Frontend tests
cd frontend
npm test -- --watchAll=false || {
    echo -e "${RED}Frontend tests failed!${NC}"
    exit 1
}
cd ..

echo -e "${GREEN}✓ All tests passed${NC}"

# Build Frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd frontend

# Install production dependencies
npm ci --production=false

# Build
npm run build

# Copy build artifacts
cp -r dist "../${BUILD_DIR}/frontend"

# Create optimized nginx config
cat > "../${BUILD_DIR}/nginx.conf" << 'EOF'
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy
    location /api {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

cd ..

# Build Backend
echo -e "${YELLOW}Building backend...${NC}"
cd backend

# Create requirements for production (without dev dependencies)
grep -v -E "pytest|black|flake8|mypy|pre-commit" requirements.txt > requirements.prod.txt

# Copy backend files
cp -r src "../${BUILD_DIR}/backend"
cp requirements.prod.txt "../${BUILD_DIR}/backend/requirements.txt"
cp ../docker/Dockerfile "../${BUILD_DIR}/backend/"

cd ..

# Build Docker images if Docker is available
if command_exists docker; then
    echo -e "${YELLOW}Building Docker images...${NC}"
    
    # Build backend image
    docker build -t ${PROJECT_NAME}-api:${BUILD_ID} -f docker/Dockerfile backend/
    docker tag ${PROJECT_NAME}-api:${BUILD_ID} ${PROJECT_NAME}-api:latest
    
    # Build frontend image
    cat > "${BUILD_DIR}/frontend.dockerfile" << EOF
FROM nginx:alpine
COPY frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EOF
    
    docker build -t ${PROJECT_NAME}-frontend:${BUILD_ID} -f "${BUILD_DIR}/frontend.dockerfile" "${BUILD_DIR}/"
    docker tag ${PROJECT_NAME}-frontend:${BUILD_ID} ${PROJECT_NAME}-frontend:latest
    
    # Tag for registry if configured
    if [ ! -z "$REGISTRY" ]; then
        docker tag ${PROJECT_NAME}-api:latest ${REGISTRY}/${PROJECT_NAME}-api:${TAG}
        docker tag ${PROJECT_NAME}-frontend:latest ${REGISTRY}/${PROJECT_NAME}-frontend:${TAG}
        echo -e "${GREEN}✓ Images tagged for registry: ${REGISTRY}${NC}"
    fi
    
    echo -e "${GREEN}✓ Docker images built${NC}"
fi

# Create deployment package
echo -e "${YELLOW}Creating deployment package...${NC}"

cat > "${BUILD_DIR}/docker-compose.prod.yml" << EOF
version: '3.8'

services:
  frontend:
    image: ${PROJECT_NAME}-frontend:${BUILD_ID}
    restart: always
    ports:
      - "80:80"
    depends_on:
      - api
      
  api:
    image: ${PROJECT_NAME}-api:${BUILD_ID}
    restart: always
    environment:
      - NODE_ENV=production
      - MONGODB_URL=\${MONGODB_URL}
      - JWT_SECRET=\${JWT_SECRET}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
EOF

# Create deployment script
cat > "${BUILD_DIR}/deploy.sh" << 'EOF'
#!/bin/bash
# Deploy script for production

# Load environment variables
source .env.prod

# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Stop old containers
docker-compose -f docker-compose.prod.yml down

# Start new containers
docker-compose -f docker-compose.prod.yml up -d

# Health check
sleep 10
curl -f http://localhost/api/health || exit 1

echo "Deployment successful!"
EOF

chmod +x "${BUILD_DIR}/deploy.sh"

# Create environment template
cat > "${BUILD_DIR}/.env.prod.example" << EOF
# Production Environment Variables
MONGODB_URL=mongodb://user:pass@localhost:27017/clinic_prod
JWT_SECRET=your-super-secret-key
CORS_ORIGINS=["https://clinic.yourdomain.com"]
EOF

# Create deployment archive
cd builds
tar -czf "${BUILD_ID}.tar.gz" "${BUILD_ID}/"
cd ..

# Generate build report
cat > "${BUILD_DIR}/build-report.txt" << EOF
Build Report
============
Build ID: ${BUILD_ID}
Date: $(date)
Git Commit: $(git rev-parse HEAD)
Git Branch: $(git rev-parse --abbrev-ref HEAD)

Artifacts:
- Frontend: ${BUILD_DIR}/frontend/
- Backend: ${BUILD_DIR}/backend/
- Docker Images: ${PROJECT_NAME}-api:${BUILD_ID}, ${PROJECT_NAME}-frontend:${BUILD_ID}
- Deployment Package: builds/${BUILD_ID}.tar.gz

Test Results: PASSED

Deployment Instructions:
1. Copy builds/${BUILD_ID}.tar.gz to production server
2. Extract: tar -xzf ${BUILD_ID}.tar.gz
3. Configure: cp .env.prod.example .env.prod && edit .env.prod
4. Deploy: ./deploy.sh
EOF

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo
echo -e "${CYAN}Build artifacts:${NC}"
echo -e "  • Archive: ${YELLOW}builds/${BUILD_ID}.tar.gz${NC}"
echo -e "  • Docker images: ${YELLOW}${PROJECT_NAME}-api:${BUILD_ID}, ${PROJECT_NAME}-frontend:${BUILD_ID}${NC}"
echo -e "  • Build report: ${YELLOW}${BUILD_DIR}/build-report.txt${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Review build report"
echo -e "2. Push Docker images (if using registry)"
echo -e "3. Deploy to production server"