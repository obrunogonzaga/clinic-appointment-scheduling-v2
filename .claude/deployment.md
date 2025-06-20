# Deployment Guide

## Overview
This guide covers deployment strategies for the Clinic Appointment Scheduling System, from simple single-server setups to scalable cloud deployments.

## Deployment Options

### 1. Single Server Deployment (Small Clinic)
- **Best for**: < 100 daily appointments
- **Cost**: $20-50/month
- **Complexity**: Low
- **Downtime tolerance**: Some acceptable

### 2. Docker Swarm Deployment (Medium Clinic)
- **Best for**: 100-500 daily appointments
- **Cost**: $100-300/month
- **Complexity**: Medium
- **Downtime tolerance**: Minimal

### 3. Kubernetes Deployment (Large Clinic/Multi-location)
- **Best for**: 500+ daily appointments
- **Cost**: $300+/month
- **Complexity**: High
- **Downtime tolerance**: Zero

## Pre-Deployment Checklist

### Security Review
- [ ] Change all default passwords
- [ ] Generate strong JWT secret
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Disable debug mode
- [ ] Set up backup encryption

### Performance Review
- [ ] Database indexes created
- [ ] Redis caching configured
- [ ] Static assets CDN ready
- [ ] Image optimization enabled
- [ ] Gzip compression enabled
- [ ] Database connection pooling

### Monitoring Setup
- [ ] Error tracking (Sentry)
- [ ] Application monitoring (New Relic/DataDog)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Log aggregation (ELK Stack)
- [ ] Database monitoring
- [ ] Alert notifications configured

## Single Server Deployment

### Server Requirements
- **OS**: Ubuntu 22.04 LTS
- **CPU**: 2 cores minimum
- **RAM**: 4GB minimum
- **Storage**: 50GB SSD
- **Network**: 100Mbps

### Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y \
    docker.io \
    docker-compose \
    nginx \
    certbot \
    python3-certbot-nginx \
    fail2ban \
    ufw

# Add user to docker group
sudo usermod -aG docker $USER

# Enable firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Deploy Application

```bash
# Clone repository
git clone https://github.com/your-org/clinic-appointment-scheduling-v2.git
cd clinic-appointment-scheduling-v2

# Create production environment file
cp backend/.env.example backend/.env.prod
# Edit .env.prod with production values

# Build and start services
docker-compose -f docker/docker-compose.prod.yml up -d
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/clinic-app
server {
    listen 80;
    server_name clinic.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name clinic.yourdomain.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/clinic.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/clinic.yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend
    location / {
        root /var/www/clinic-app/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL Certificate

```bash
# Obtain SSL certificate
sudo certbot --nginx -d clinic.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Docker Production Configuration

### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - clinic_network
    command: mongod --auth

  redis:
    image: redis:7.2-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - clinic_network

  api:
    build:
      context: ./backend
      dockerfile: ../docker/Dockerfile.prod
    restart: always
    environment:
      - NODE_ENV=production
      - MONGODB_URL=mongodb://${MONGO_USER}:${MONGO_PASSWORD}@mongodb:27017/${DB_NAME}?authSource=admin
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
    depends_on:
      - mongodb
      - redis
    networks:
      - clinic_network
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - api
    networks:
      - clinic_network

volumes:
  mongodb_data:
  redis_data:

networks:
  clinic_network:
    driver: bridge
```

### Production Dockerfile
```dockerfile
# docker/Dockerfile.prod
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Run with gunicorn
CMD ["gunicorn", "src.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

## Kubernetes Deployment

### Deployment Manifests

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: clinic-app

---
# k8s/mongodb.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
  namespace: clinic-app
spec:
  serviceName: mongodb
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:7.0
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: username
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: password
        volumeMounts:
        - name: mongodb-data
          mountPath: /data/db
  volumeClaimTemplates:
  - metadata:
      name: mongodb-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi

---
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: clinic-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: your-registry/clinic-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: MONGODB_URL
          valueFrom:
            secretKeyRef:
              name: api-secret
              key: mongodb-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: api-secret
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: clinic-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/clinic-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

### Helm Chart
```yaml
# helm/clinic-app/values.yaml
replicaCount:
  api: 3
  frontend: 2

image:
  api:
    repository: your-registry/clinic-api
    tag: latest
    pullPolicy: IfNotPresent
  frontend:
    repository: your-registry/clinic-frontend
    tag: latest
    pullPolicy: IfNotPresent

service:
  type: LoadBalancer
  port: 80

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: clinic.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
        - path: /api
          pathType: Prefix
  tls:
    - secretName: clinic-tls
      hosts:
        - clinic.yourdomain.com

mongodb:
  enabled: true
  auth:
    enabled: true
    rootPassword: changeme
    database: clinic_db
  persistence:
    enabled: true
    size: 10Gi

redis:
  enabled: true
  auth:
    enabled: true
    password: changeme
```

## CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Run tests
        run: |
          cd backend
          pip install -r requirements-dev.txt
          pytest

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ secrets.REGISTRY_URL }}
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}
      
      - name: Build and push API
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: |
            ${{ secrets.REGISTRY_URL }}/clinic-api:latest
            ${{ secrets.REGISTRY_URL }}/clinic-api:${{ github.sha }}
      
      - name: Build and push Frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: |
            ${{ secrets.REGISTRY_URL }}/clinic-frontend:latest
            ${{ secrets.REGISTRY_URL }}/clinic-frontend:${{ github.sha }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v4
        with:
          manifests: |
            k8s/api-deployment.yaml
            k8s/frontend-deployment.yaml
          images: |
            ${{ secrets.REGISTRY_URL }}/clinic-api:${{ github.sha }}
            ${{ secrets.REGISTRY_URL }}/clinic-frontend:${{ github.sha }}
```

## Database Backup Strategy

### Automated Backups
```bash
#!/bin/bash
# scripts/backup.sh

# Configuration
BACKUP_DIR="/backups/mongodb"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="clinic_db_${DATE}"

# Create backup
mongodump \
  --uri="${MONGODB_URL}" \
  --out="${BACKUP_DIR}/${BACKUP_NAME}" \
  --gzip

# Upload to S3
aws s3 sync "${BACKUP_DIR}/${BACKUP_NAME}" \
  "s3://${S3_BUCKET}/backups/${BACKUP_NAME}" \
  --delete

# Clean old backups
find ${BACKUP_DIR} -type d -mtime +${RETENTION_DAYS} -exec rm -rf {} \;

# Test backup
mongorestore \
  --uri="${MONGODB_TEST_URL}" \
  --drop \
  --gzip \
  "${BACKUP_DIR}/${BACKUP_NAME}"
```

### Backup Cron Job
```cron
# Backup every 6 hours
0 */6 * * * /scripts/backup.sh >> /var/log/backup.log 2>&1

# Weekly full backup
0 2 * * 0 /scripts/full-backup.sh >> /var/log/backup.log 2>&1
```

## Monitoring Setup

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'clinic-api'
    static_configs:
      - targets: ['api:8000']
    metrics_path: '/metrics'

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### Application Metrics
```python
# backend/src/core/metrics.py
from prometheus_client import Counter, Histogram, generate_latest
from fastapi import Response

# Define metrics
request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

# Metrics endpoint
@app.get('/metrics')
async def metrics():
    return Response(
        generate_latest(),
        media_type="text/plain"
    )
```

## Security Hardening

### Environment Variables
```bash
# Production .env
NODE_ENV=production
DEBUG=false
LOG_LEVEL=info

# Use strong passwords
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
REDIS_PASSWORD=$(openssl rand -base64 32)

# Restrict CORS
CORS_ORIGINS=["https://clinic.yourdomain.com"]

# Security headers
SECURE_HEADERS=true
HSTS_SECONDS=31536000
```

### Network Security
```bash
# Firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 10.0.0.0/8 to any port 27017  # MongoDB internal only
sudo ufw allow from 10.0.0.0/8 to any port 6379   # Redis internal only
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 22/tcp   # SSH (restrict to your IP)
```

## Scaling Strategies

### Horizontal Scaling
1. **API Servers**: Add more API instances behind load balancer
2. **MongoDB**: Configure replica set for read scaling
3. **Redis**: Use Redis Cluster for cache distribution
4. **Frontend**: Serve from CDN (CloudFlare, AWS CloudFront)

### Vertical Scaling
1. **Database Server**: Increase CPU/RAM for complex queries
2. **API Servers**: More CPU for compute-intensive operations
3. **Cache Size**: Increase Redis memory for better hit rates

### Performance Optimization
1. **Database Indexes**: Monitor slow queries and add indexes
2. **Query Optimization**: Use aggregation pipeline efficiently
3. **Caching Strategy**: Cache frequently accessed data
4. **CDN Usage**: Serve static assets from edge locations

## Rollback Procedures

### Application Rollback
```bash
# Tag before deployment
git tag -a v1.2.3-pre-deploy -m "Pre-deployment backup"

# Rollback to previous version
kubectl rollout undo deployment/api -n clinic-app
kubectl rollout undo deployment/frontend -n clinic-app

# Or with specific revision
kubectl rollout undo deployment/api --to-revision=2 -n clinic-app
```

### Database Rollback
```bash
# Restore from backup
mongorestore \
  --uri="${MONGODB_URL}" \
  --drop \
  --gzip \
  /backups/mongodb/clinic_db_20240115_120000
```

## Post-Deployment Checklist

- [ ] Verify all services are running
- [ ] Test critical user flows
- [ ] Check monitoring dashboards
- [ ] Verify backup automation
- [ ] Test email/SMS notifications
- [ ] Load test the application
- [ ] Security scan (OWASP ZAP)
- [ ] Update documentation
- [ ] Notify stakeholders

## Maintenance Tasks

### Daily
- Monitor error logs
- Check disk space
- Verify backups completed

### Weekly
- Review performance metrics
- Update dependencies (security patches)
- Test backup restoration

### Monthly
- Full system backup
- Security audit
- Performance review
- Cost optimization review

## Disaster Recovery

### RTO (Recovery Time Objective): 4 hours
### RPO (Recovery Point Objective): 6 hours

### Recovery Steps
1. **Assess Damage**: Identify what failed
2. **Communicate**: Notify stakeholders
3. **Execute Recovery**:
   - Restore from backup
   - Redeploy application
   - Verify data integrity
4. **Test**: Ensure system is functional
5. **Document**: Record incident and response