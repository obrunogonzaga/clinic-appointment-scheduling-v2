# Lab Scheduler Backend

Backend API for the Laboratory Appointment Scheduling System.

## Overview

This backend service provides the API endpoints and business logic for the laboratory scheduling system, including patient management, appointment scheduling, and route optimization.

## Tech Stack

- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Database**: MongoDB
- **ODM**: Motor (async) / Beanie
- **Authentication**: JWT with python-jose
- **File Processing**: pandas, openpyxl
- **SMS/WhatsApp**: Twilio API (planned)
- **Task Queue**: Celery + Redis (for background jobs)

## Features

- Patient CRUD operations with advanced search
- Schedule management and optimization
- Excel/CSV file processing
- Confirmation tracking
- Analytics and reporting
- Real-time notifications
- SMS/WhatsApp integration

## Project Structure

```
lab-scheduler-backend/
├── docs/
│   └── backend-plan.md
├── src/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── patients.py
│   │   │   ├── schedule.py
│   │   │   └── analytics.py
│   │   └── dependencies.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   ├── models/
│   │   ├── patient.py
│   │   ├── appointment.py
│   │   └── car.py
│   ├── services/
│   │   ├── file_processor.py
│   │   └── optimizer.py
│   ├── db/
│   │   └── mongodb.py
│   └── main.py
├── tests/
├── .env.example
├── .gitignore
├── requirements.txt
├── requirements-dev.txt
└── README.md
```

## Getting Started

### Option 1: Docker Compose (Recommended)

The easiest way to run the entire stack (API + MongoDB + Redis + Mongo Express):

```bash
# Clone and enter the project
cd lab-scheduler-backend

# Copy environment file
cp .env.example .env

# Start all services
docker-compose -f ../docker/docker-compose.yml up -d

# View logs
docker-compose -f ../docker/docker-compose.yml logs -f api

# Stop all services
docker-compose -f ../docker/docker-compose.yml down

# Stop and remove volumes (caution: deletes data)
docker-compose -f ../docker/docker-compose.yml down -v
```

**Services will be available at:**
- **API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **MongoDB**: localhost:27017
- **Mongo Express**: http://localhost:8081 (admin/admin123)
- **Redis**: localhost:6379

### Option 2: Local Development

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables (use local MongoDB)
cp .env.example .env
# Edit .env and uncomment local MongoDB URL

# Start MongoDB locally or use Docker for just MongoDB:
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Run development server
uvicorn src.main:app --reload

# Run tests
pytest
```

## API Endpoints (Planned)

- `GET /api/patients` - List patients with search/filter
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `POST /api/upload` - Process Excel/CSV file
- `GET /api/schedule` - Get schedule
- `POST /api/schedule` - Create appointments
- `PUT /api/schedule/:id` - Update appointment
- `POST /api/confirmations` - Track confirmation attempts
- `GET /api/analytics` - Get analytics data

## Docker Services

The docker-compose stack includes:

### Core Services
- **API**: FastAPI application with automatic reload in development
- **MongoDB**: Database with authentication and sample data
- **Redis**: Caching and session storage (for future features)

### Development Tools
- **Mongo Express**: Web-based MongoDB admin interface
- **Health Checks**: All services include health monitoring
- **Data Persistence**: Named volumes for database persistence

### Docker Commands

```bash
# Build and start in development mode
docker-compose -f ../docker/docker-compose.yml up --build

# Start in background
docker-compose -f ../docker/docker-compose.yml up -d

# View specific service logs
docker-compose -f ../docker/docker-compose.yml logs -f api
docker-compose -f ../docker/docker-compose.yml logs -f mongodb

# Restart a service
docker-compose -f ../docker/docker-compose.yml restart api

# Access database shell
docker-compose -f ../docker/docker-compose.yml exec mongodb mongosh -u admin -p admin123

# Scale API instances (for load testing)
docker-compose -f ../docker/docker-compose.yml up --scale api=3

# View service status
docker-compose -f ../docker/docker-compose.yml ps

# Remove everything including volumes
docker-compose -f ../docker/docker-compose.yml down -v --remove-orphans
```

## Development Status

✅ **Complete FastAPI Backend** - Ready for development and testing

- Full CRUD operations for patients, appointments, and cars
- MongoDB integration with sample data
- Docker containerization with development tools
- API documentation at `/docs`

See [docs/backend-plan.md](docs/backend-plan.md) for detailed implementation plan.

## Related Repositories

- Frontend: [lab-scheduler](../lab-scheduler)