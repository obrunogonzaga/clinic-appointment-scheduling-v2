# Backend Implementation Plan

This document outlines steps to migrate the scheduling system from the current front-end mock implementation to a real back-end service.

## Key Features from Patients Module

Based on lines 6-16 of `PATIENTS_MODULE.md` the Patients module requires:

- **Master Patient Registry**
- **Advanced Search Engine**
- **Smart Filtering System**
- **Quick Statistics Dashboard**
- **Complete Patient Profiles** and related features

These features imply a full database with sophisticated query and analytics capabilities.

## Why MongoDB for This Project

MongoDB is ideal for this laboratory scheduling system because:

1. **Document Structure**: Patient records naturally fit MongoDB's document model with nested data (contacts, history, preferences)
2. **Flexible Schema**: Easy to add new fields as requirements evolve without migrations
3. **Geospatial Queries**: Built-in support for location-based queries for route optimization
4. **Aggregation Pipeline**: Powerful analytics capabilities for patient statistics and reports
5. **Performance**: Fast queries on large datasets with proper indexing
6. **Scalability**: Horizontal scaling for growing patient databases

## Next Steps from `project-status.md`

The **Next Steps** section identifies the following priorities:

1. Patient database implementation
2. Schedule integration
3. Production deployment

## Proposed Backend Roadmap

1. **Stack and Database** ✅
   - **Language**: Python 3.11+
   - **Framework**: FastAPI (modern, fast, with automatic API documentation)
   - **Database**: MongoDB (document-oriented, perfect for nested patient data)
   - **ODM**: Beanie/Motor for async MongoDB operations

2. **Design Data Models**
   - Base the schema on the detailed patient record in `PATIENTS_MODULE.md`. Include personal information, contact details, health plan data, confirmation history, analytics fields and tags.
   - Create Pydantic/Beanie models for:
     * Patient (with embedded documents for contacts, history, preferences)
     * Appointment (with references to patients and cars)
     * Car/Driver (with schedule and capacity info)
     * Confirmation (tracking attempts and results)

3. **Implement API Endpoints**
   - `/patients` &mdash; CRUD operations plus advanced search/filter support
   - `/appointments` or `/schedule` &mdash; manage schedule entries
   - `/upload` &mdash; receive spreadsheet files and process them (migrating the logic from `fileProcessor.js`)
   - `/drivers` or `/cars` &mdash; manage driver/car assignments
   - Authentication endpoints as needed

4. **Move File Processing to the Server**
   - Port the existing JavaScript spreadsheet parsing logic to Python using pandas and openpyxl
   - Create async background tasks with Celery for large file processing
   - Store processed files in MongoDB GridFS for audit trail

5. **Support Operational Features**
   - Add endpoints for confirmation tracking, SMS/WhatsApp communication and analytics as described in the Patients module specification.

6. **Integrate With React Front-End**
   - Replace mock data with API calls using `fetch` or `axios`
   - Maintain the current component structure while sourcing data from the new endpoints
   - Add CORS configuration in FastAPI for development
   - Implement proper error handling and loading states

7. **Deployment and Testing**
   - Create automated tests for API endpoints.
   - Plan for staging and production deployment once key integrations are complete.

This plan provides a path to evolve the existing prototype into a full system with a real database and server-side features.

## MongoDB Collections Design

### patients
```json
{
  "_id": ObjectId,
  "personal_info": {
    "name": string,
    "cpf": string,
    "birth_date": date,
    "gender": string
  },
  "contacts": [{
    "type": string,
    "value": string,
    "primary": boolean
  }],
  "address": {
    "street": string,
    "neighborhood": string,
    "city": string,
    "coordinates": [longitude, latitude]
  },
  "health_plan": {...},
  "tags": [string],
  "created_at": date,
  "updated_at": date
}
```

### appointments
```json
{
  "_id": ObjectId,
  "patient_id": ObjectId,
  "car_id": ObjectId,
  "scheduled_date": date,
  "time_slot": string,
  "duration": number,
  "status": string,
  "exams": [string],
  "confirmation": {
    "status": string,
    "attempts": [{...}]
  }
}
```

### cars
```json
{
  "_id": ObjectId,
  "name": string,
  "driver": {
    "name": string,
    "phone": string
  },
  "capacity": number,
  "active": boolean,
  "zones": [string]
}
```
