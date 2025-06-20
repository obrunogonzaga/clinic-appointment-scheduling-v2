# Clinic Appointment Scheduling System

## Project Overview
A comprehensive clinic appointment scheduling system designed for healthcare providers to manage patient appointments, laboratory collections, and administrative tasks efficiently.

**⚠️ IMPORTANT**: There is a complete React mockup file (`lab-scheduler-mockup.tsx`) that should be used as visual and functional reference for all development. The mockup contains the complete interface with all components, styles, and interactions.

## Tech Stack
- **Frontend**: React + Vite, TailwindCSS, JavaScript
- **Backend**: Python FastAPI, MongoDB
- **Database**: MongoDB (Docker container)
- **Authentication**: JWT (planned)
- **Containerization**: Docker & Docker Compose

## Project Structure
- `/frontend` - React application with Vite
  - `/src/components` - Reusable UI components
  - `/src/pages` - Main application pages
  - `/src/services` - API and utility services
- `/backend` - Python FastAPI server
  - `/src/api` - API endpoints and routes
  - `/src/models` - Data models and schemas
  - `/src/core` - Core configuration and utilities
  - `/src/db` - Database connection and operations
- `/docker` - Docker configuration files
  - `docker-compose.yml` - Multi-container setup
  - `Dockerfile` - Backend container configuration
  - `.dockerignore` - Docker ignore patterns
- `/docs` - Project documentation and planning

## Key Features
- **Patient Management**: Complete patient registration, profile management, and search functionality
- **Appointment Scheduling**: Calendar-based appointment booking and management
- **Laboratory Collections**: Track and manage lab sample collections
- **Dashboard Analytics**: KPIs, recent activity, and system overview
- **Bulk Operations**: Mass patient operations and data management
- **Communication Hub**: Patient communication and notification system
- **Confirmation Tracking**: Appointment confirmation and reminder system
- **Reporting**: Analytics and reporting for administrators

## Database Schema

### Patient Model
- Personal information (name, contact, demographics)
- Medical history and notes
- Appointment history
- Collection records

### Appointment Model
- Appointment details (date, time, type)
- Patient association
- Status tracking
- Provider information

### Car Model (Collection Vehicle)
- Vehicle information for mobile collections
- Scheduling and routing
- Status and availability

## API Endpoints

### Patient Management
- `GET /api/patients` - List all patients with filtering
- `POST /api/patients` - Create new patient
- `GET /api/patients/{id}` - Get patient details
- `PUT /api/patients/{id}` - Update patient information
- `DELETE /api/patients/{id}` - Delete patient

### Appointment Scheduling
- `GET /api/schedule` - Get appointment schedule
- `POST /api/schedule` - Create new appointment
- `PUT /api/schedule/{id}` - Update appointment
- `DELETE /api/schedule/{id}` - Cancel appointment

### Analytics & Reporting
- `GET /api/analytics` - Get dashboard analytics
- `GET /api/analytics/reports` - Generate reports

## Development Setup

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

### Backend (Python FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

### Database (MongoDB)
```bash
docker-compose -f docker/docker-compose.yml up -d
```

## Environment Variables
- `MONGODB_URL` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `API_BASE_URL` - Backend API base URL

## Testing
- Frontend: Component and integration tests
- Backend: Unit tests with pytest
- API: Endpoint testing with FastAPI TestClient

## Deployment
- Frontend: Static build deployment
- Backend: Containerized Python application
- Database: MongoDB Atlas or self-hosted Docker container

## Custom Commands
The project includes a comprehensive set of custom commands located in `.claude/commands/`:
- **Development**: Start/stop services, watch logs, hot-reload
- **Database**: Backup/restore, migrations, seeding
- **Deployment**: Build, deploy to staging/production, rollback
- **Code Generation**: Create API endpoints, React components, tests, CRUD modules
- **Utilities**: Clean logs, update dependencies, security audits

Use `make help` to see all available commands or run scripts directly from `.claude/commands/`

## Current Project Status

### Overall Progress: 85% Complete
- **Frontend Development**: 100% Complete
  - ✅ React + Vite setup with TailwindCSS
  - ✅ Complete UI layout matching mockup
  - ✅ Dashboard with KPIs, activity timeline, car status
  - ✅ 3-step upload and processing flow with calendar view
  - ✅ Google Calendar-style drag & drop scheduling
  - ✅ Comprehensive Patients Module (12 components)
  - ✅ Professional animations and notifications
- **Backend Development**: In Progress
  - ✅ FastAPI project structure
  - ✅ MongoDB integration setup
  - ⏳ API endpoints implementation
  - ⏳ Authentication system
- **Mobile Responsiveness**: Pending
- **Production Deployment**: Pending

### Recent Accomplishments
- **Phase 7 Complete**: All 12 patient management components implemented
- **Interactive Features**: Full drag & drop, real-time editing, toast notifications
- **Advanced Patient System**: Search, filters, analytics, bulk operations, communication hub
- **Professional UI**: Consistent styling, animations, loading states throughout

### Next Steps
1. Complete backend API implementation
2. Integrate frontend with backend services
3. Implement authentication and authorization
4. Mobile responsiveness testing and fixes
5. Deploy to production environment
