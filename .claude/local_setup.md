# Local Development Setup Guide

## Prerequisites

### Required Software
- **Node.js**: Version 16.x or higher
- **Python**: Version 3.8 or higher
- **Docker Desktop**: Latest version
- **Git**: Version 2.x or higher

### Recommended Tools
- **VS Code**: With Python and ESLint extensions
- **MongoDB Compass**: For database inspection
- **Postman/Insomnia**: For API testing
- **Chrome/Firefox**: With React Developer Tools

## Initial Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/clinic-appointment-scheduling-v2.git
cd clinic-appointment-scheduling-v2
```

### 2. Environment Configuration

#### Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your settings:
```env
# Database
MONGODB_URL=mongodb://admin:admin123@localhost:27017/lab_scheduler?authSource=admin
DATABASE_NAME=lab_scheduler

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# Security
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]

# File Upload
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
ALLOWED_EXTENSIONS=["csv", "xlsx", "xls"]

# Email (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# SMS/WhatsApp (optional for development)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Redis (for caching)
REDIS_URL=redis://localhost:6379/0

# Logging
LOG_LEVEL=DEBUG
LOG_FILE=logs/app.log
```

#### Frontend Environment
```bash
cd ../frontend
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Clinic Scheduler
VITE_APP_VERSION=1.0.0
VITE_ENABLE_MOCK=false
```

## Backend Setup

### Option 1: Using Docker (Recommended)

#### Start All Services
```bash
# From project root
docker-compose -f docker/docker-compose.yml up -d

# Check service status
docker-compose -f docker/docker-compose.yml ps

# View logs
docker-compose -f docker/docker-compose.yml logs -f
```

Services will be available at:
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- MongoDB: localhost:27017
- Redis: localhost:6379
- Mongo Express: http://localhost:8081 (admin/admin123)

### Option 2: Manual Setup

#### 1. Install MongoDB
```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows - Download installer from MongoDB website
```

#### 2. Install Redis (Optional)
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows - Use WSL or Docker
```

#### 3. Python Virtual Environment
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # For development tools
```

#### 4. Initialize Database
```bash
# Run MongoDB initialization script
mongosh < scripts/mongo-init.js

# Or with Docker MongoDB
docker exec -i lab_scheduler_mongodb mongosh < backend/scripts/mongo-init.js
```

#### 5. Start Backend Server
```bash
# Development mode with auto-reload
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Or use the make command if available
make run-backend
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev

# Server will start at http://localhost:5173
```

### 3. Build for Production (Optional)
```bash
npm run build
npm run preview  # Preview production build
```

## Database Seeding

### Seed Sample Data
```bash
cd backend

# Run seeding script
python scripts/seed_data.py

# Or with Docker
docker exec -it lab_scheduler_api python scripts/seed_data.py
```

### Sample Users Created
```
Admin User:
- Email: admin@clinic.com
- Password: admin123

Operator User:
- Email: operator@clinic.com
- Password: operator123

Driver User:
- Email: driver@clinic.com
- Password: driver123
```

## Development Workflow

### 1. Code Quality Tools

#### Backend (Python)
```bash
# Format code with Black
black src/ tests/

# Lint with flake8
flake8 src/ tests/

# Type checking with mypy
mypy src/

# Run all checks
make lint  # If Makefile available
```

#### Frontend (JavaScript/React)
```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Type checking (if using TypeScript)
npm run type-check
```

### 2. Running Tests

#### Backend Tests
```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_patients.py

# Run tests in watch mode
pytest-watch
```

#### Frontend Tests
```bash
cd frontend

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

### 3. Git Workflow

#### Feature Development
```bash
# Create feature branch
git checkout -b feature/patient-search

# Make changes and commit
git add .
git commit -m "feat: add advanced patient search"

# Push to remote
git push -u origin feature/patient-search
```

#### Pre-commit Hooks
```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

## IDE Configuration

### VS Code Settings

#### `.vscode/settings.json`
```json
{
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "python.linting.mypyEnabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  },
  "[javascript]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "dbaeumer.vscode-eslint"
  }
}
```

#### Recommended Extensions
- Python
- Pylance
- Black Formatter
- ESLint
- Prettier
- Thunder Client (API testing)
- Docker
- GitLens

### PyCharm Configuration
1. Set Python interpreter to virtual environment
2. Enable Black formatter
3. Configure pytest as test runner
4. Set up Docker integration

## Debugging

### Backend Debugging

#### VS Code Launch Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "src.main:app",
        "--reload",
        "--port", "8000"
      ],
      "jinja": true,
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

#### PyCharm Configuration
1. Create new Run Configuration
2. Select "Python"
3. Script path: `uvicorn`
4. Parameters: `src.main:app --reload`

### Frontend Debugging

#### Chrome DevTools
1. Start dev server: `npm run dev`
2. Open Chrome DevTools (F12)
3. Use Sources tab for breakpoints
4. React Developer Tools for component inspection

#### VS Code Debugging
```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Launch Chrome",
  "url": "http://localhost:5173",
  "webRoot": "${workspaceFolder}/frontend/src"
}
```

## Common Commands Reference

### Docker Commands
```bash
# Start services
docker-compose -f docker/docker-compose.yml up -d

# Stop services
docker-compose -f docker/docker-compose.yml down

# View logs
docker-compose -f docker/docker-compose.yml logs -f [service_name]

# Execute commands in container
docker exec -it lab_scheduler_api bash

# Clean up everything
docker-compose -f docker/docker-compose.yml down -v
```

### Database Commands
```bash
# Access MongoDB shell
mongosh mongodb://admin:admin123@localhost:27017/lab_scheduler?authSource=admin

# Backup database
mongodump --uri="mongodb://admin:admin123@localhost:27017/lab_scheduler?authSource=admin"

# Restore database
mongorestore --uri="mongodb://admin:admin123@localhost:27017/lab_scheduler?authSource=admin" dump/
```

### Development Shortcuts
```bash
# Backend
cd backend && source venv/bin/activate && uvicorn src.main:app --reload

# Frontend
cd frontend && npm run dev

# Run both (with concurrently)
npm run dev:all  # If configured in package.json
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### MongoDB Connection Issues
1. Check if MongoDB is running
2. Verify connection string in .env
3. Check firewall settings
4. Try connecting with Compass

### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Python Dependencies Issues
```bash
# Recreate virtual environment
deactivate
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Next Steps

1. **Explore API Documentation**: http://localhost:8000/docs
2. **Review Code Structure**: Check architecture in `/docs`
3. **Run Sample Requests**: Use Postman collection in `/docs/postman`
4. **Customize Configuration**: Modify settings for your needs
5. **Join Development**: Check CONTRIBUTING.md for guidelines