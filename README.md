# Clinic Appointment Scheduling System

A comprehensive web application for managing clinic appointments, patient records, and laboratory collections.

## 🚀 Quick Start

```bash
# Show all available commands
make help

# Start development environment
make dev

# Run tests
make test
```

## 📋 Features

- **Patient Management**: Complete patient registration and profile management
- **Appointment Scheduling**: Calendar-based appointment booking system
- **Laboratory Collections**: Track and manage lab sample collections
- **Dashboard Analytics**: Real-time KPIs and activity monitoring
- **Bulk Operations**: Mass patient data management
- **Communication Hub**: Patient communication and notifications
- **Reporting**: Comprehensive analytics and reports

## 🛠️ Tech Stack

- **Frontend**: React + Vite, TailwindCSS
- **Backend**: Python FastAPI
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose
- **Authentication**: JWT (planned)

## 📁 Project Structure

```
.
├── frontend/          # React + Vite application
├── backend/           # Python FastAPI server
├── docker/            # Docker configuration files
├── docs/              # Project documentation
├── .claude/           # AI assistant configuration and commands
│   └── commands/      # Custom CLI commands
└── Makefile           # Quick command access
```

## 🔧 Development Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- MongoDB (via Docker or local)

### Using Make Commands (Recommended)

```bash
# Install dependencies
make install

# Start all services with Docker
make dev

# Start services locally (without Docker)
make dev-local

# Stop all services
make stop
```

### Manual Setup

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

#### Database
```bash
docker-compose -f docker/docker-compose.yml up -d mongodb
```

## 🧪 Testing

```bash
# Run all tests
make test

# Frontend tests only
make test-frontend

# Backend tests only
make test-backend

# Watch mode
make test-watch
```

## 📦 Build & Deployment

```bash
# Build for production
make build

# Deploy to staging
make deploy-staging

# Deploy to production
make deploy-prod

# Check deployment health
make health-check
```

## 🛡️ Security & Maintenance

```bash
# Run security audit
make security-audit

# Update dependencies
make update-deps

# Clean old logs
make clean-logs
```

## 💻 Code Generation

Generate boilerplate code quickly:

```bash
# Generate API endpoint
make gen-api name=appointment

# Generate React component
make gen-component name=UserProfile

# Generate complete CRUD module
make gen-crud name=patient

# Generate test file
make gen-test file=backend/src/api/endpoints/users.py
```

## 🗄️ Database Management

```bash
# Backup database
make db-backup

# Restore database
make db-restore

# Seed with test data
make db-seed

# Run migrations
make db-migrate
```

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`make test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 Documentation

- [Project Documentation](docs/)
- [API Documentation](backend/docs/)
- [Custom Commands](.claude/commands/README.md)
- [Claude AI Assistant Config](.claude/)

## 🔑 Environment Variables

Create `.env` files in both frontend and backend directories:

### Backend (.env)
```env
MONGODB_URL=mongodb://localhost:27017/clinic
JWT_SECRET=your-secret-key
ENVIRONMENT=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@clinicscheduler.com or open an issue in the GitHub repository.