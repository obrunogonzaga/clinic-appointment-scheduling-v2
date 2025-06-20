# Data Models Documentation

## Overview
This document defines the complete data schemas for the Clinic Appointment Scheduling System, including validation rules, relationships, and indexing strategies.

## Patient Model

### Schema Definition
```python
class Patient:
    # Identification
    id: str                    # MongoDB ObjectId, auto-generated
    patient_code: str          # Unique, format: "PAT-YYYY-XXXXX"
    
    # Personal Information
    first_name: str            # Required, 2-50 chars
    last_name: str             # Required, 2-50 chars
    date_of_birth: date        # Required, must be past date
    gender: str                # Required, enum: ["M", "F", "O"]
    cpf: str                   # Required, validated Brazilian CPF
    rg: str                    # Optional, Brazilian RG
    
    # Contact Information
    email: str                 # Optional, valid email format
    phone: str                 # Required, Brazilian format
    whatsapp: str              # Optional, Brazilian format
    preferred_contact: str     # Enum: ["phone", "whatsapp", "email", "sms"]
    
    # Address
    address: {
        street: str            # Required, 5-100 chars
        number: str            # Required, 1-10 chars
        complement: str        # Optional, max 50 chars
        neighborhood: str      # Required, 3-50 chars
        city: str              # Required, 3-50 chars
        state: str             # Required, 2 chars (BR state code)
        zip_code: str          # Required, format: "XXXXX-XXX"
        coordinates: {         # Auto-calculated
            lat: float
            lng: float
        }
    }
    
    # Medical Information
    blood_type: str            # Optional, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
    allergies: [str]           # Array of allergies
    medications: [str]         # Current medications
    medical_conditions: [str]  # Chronic conditions
    medical_notes: str         # Optional, max 1000 chars
    
    # Insurance Information
    insurance: {
        provider: str          # Required if has insurance
        plan: str              # Required if has insurance
        number: str            # Required if has insurance
        valid_until: date      # Required if has insurance
    }
    
    # Emergency Contact
    emergency_contact: {
        name: str              # Required
        relationship: str      # Required
        phone: str             # Required
    }
    
    # System Fields
    status: str                # Enum: ["active", "inactive", "blocked"]
    tags: [str]                # Custom tags for filtering
    created_at: datetime       # Auto-generated
    updated_at: datetime       # Auto-updated
    created_by: str            # User ID who created
    updated_by: str            # User ID who last updated
    
    # Relationships
    appointments: [Appointment] # Virtual, not stored
    collections: [Collection]   # Virtual, not stored
```

### Validation Rules
```python
# CPF Validation
def validate_cpf(cpf: str) -> bool:
    # Remove non-digits
    # Check length (11 digits)
    # Validate check digits
    
# Phone Validation
def validate_phone(phone: str) -> bool:
    # Accept formats: +55 11 98765-4321, (11) 98765-4321, 11987654321
    # Must be Brazilian number
    
# Email Validation
def validate_email(email: str) -> bool:
    # RFC 5322 compliant
    # Check MX records in production
```

### Indexes
```javascript
// MongoDB Indexes
{
  "patient_code": 1,      // Unique index
  "cpf": 1,               // Unique index
  "email": 1,             // Sparse index (nullable)
  "phone": 1,             // Index for search
  "last_name": 1,         // Index for sorting
  "created_at": -1,       // Index for recent patients
  "status": 1,            // Index for filtering
  "address.zip_code": 1,  // Index for geographic grouping
  "tags": 1               // Multi-key index
}

// Compound Indexes
{
  "status": 1,
  "last_name": 1
}

// Text Search Index
{
  "first_name": "text",
  "last_name": "text",
  "email": "text"
}
```

## Appointment Model

### Schema Definition
```python
class Appointment:
    # Identification
    id: str                    # MongoDB ObjectId
    appointment_code: str      # Format: "APT-YYYY-MM-XXXXXX"
    
    # Core Information
    patient_id: str            # Required, references Patient
    provider_id: str           # Required, references Provider
    service_type: str          # Enum: ["consultation", "exam", "collection", "procedure"]
    
    # Scheduling
    date: date                 # Required, future date
    time_slot: str             # Required, format: "HH:MM"
    duration_minutes: int      # Default: 30
    
    # Location
    location_type: str         # Enum: ["clinic", "home", "mobile"]
    location: {
        name: str              # Clinic name or "Patient Home"
        address: Address       # Full address (same as Patient.address)
        room: str              # Optional, for clinic appointments
    }
    
    # Status Management
    status: str                # Enum: ["scheduled", "confirmed", "arrived", "in_progress", "completed", "cancelled", "no_show"]
    confirmation_status: str   # Enum: ["pending", "confirmed", "failed"]
    confirmation_attempts: [{
        attempted_at: datetime
        method: str            # Enum: ["sms", "whatsapp", "phone", "email"]
        status: str            # Enum: ["sent", "delivered", "failed"]
        response: str          # Optional response
    }]
    
    # Collection Specific (if service_type == "collection")
    collection_data: {
        tests_requested: [str]  # List of test codes
        fasting_required: bool
        special_instructions: str
        collected_by: str       # User ID
        collected_at: datetime
        samples: [{
            type: str           # Enum: ["blood", "urine", "stool", "other"]
            tubes: int          # Number of tubes/containers
            barcode: str        # Sample tracking code
        }]
    }
    
    # Notes and Instructions
    preparation_instructions: str  # Pre-appointment instructions
    provider_notes: str           # Private provider notes
    patient_notes: str            # Patient-provided notes
    
    # Billing
    billing: {
        total_amount: float
        insurance_covered: float
        patient_amount: float
        status: str             # Enum: ["pending", "billed", "paid", "cancelled"]
    }
    
    # System Fields
    created_at: datetime
    updated_at: datetime
    created_by: str
    cancelled_at: datetime      # If cancelled
    cancelled_by: str           # If cancelled
    cancellation_reason: str    # If cancelled
    
    # Reminders
    reminders_sent: [{
        sent_at: datetime
        method: str
        status: str
    }]
```

### Business Rules
```python
# Appointment Scheduling Rules
- Cannot double-book a provider
- Cannot schedule in the past
- Minimum 24-hour advance booking (except urgent)
- Maximum 90 days advance booking
- Collection appointments before 10 AM for fasting

# Cancellation Rules
- Free cancellation up to 24 hours before
- Late cancellation fee may apply
- No-show affects patient status

# Confirmation Rules
- First attempt within 1 hour of booking
- Maximum 3 confirmation attempts
- 48-hour confirmation window
```

### Indexes
```javascript
{
  "appointment_code": 1,          // Unique
  "patient_id": 1,                // Foreign key
  "provider_id": 1,               // Foreign key
  "date": 1,                      // For date queries
  "status": 1,                    // For filtering
  "service_type": 1,              // For filtering
  "confirmation_status": 1         // For pending confirmations
}

// Compound Indexes
{
  "date": 1,
  "provider_id": 1,
  "status": 1
}

{
  "patient_id": 1,
  "date": -1
}
```

## Car Model (Collection Vehicle)

### Schema Definition
```python
class Car:
    # Identification
    id: str                     # MongoDB ObjectId
    vehicle_code: str           # Format: "VEH-XXX"
    license_plate: str          # Required, unique
    
    # Vehicle Information
    make: str                   # e.g., "Volkswagen"
    model: str                  # e.g., "Saveiro"
    year: int                   # Manufacturing year
    color: str                  # Vehicle color
    
    # Capacity
    capacity: {
        max_stops: int          # Maximum collection points
        storage_boxes: int      # Number of sample boxes
        refrigerated: bool      # Has refrigeration
    }
    
    # Assignment
    driver: {
        id: str                 # User ID
        name: str               # Driver name
        phone: str              # Driver phone
        license_number: str     # Driver's license
    }
    
    # Status
    status: str                 # Enum: ["active", "maintenance", "inactive"]
    current_location: {         # Real-time tracking
        lat: float
        lng: float
        updated_at: datetime
    }
    
    # Maintenance
    maintenance: {
        last_service: date
        next_service: date
        odometer: int           # Current km
        issues: [str]           # Reported issues
    }
    
    # Schedule
    schedule: {
        monday: bool
        tuesday: bool
        wednesday: bool
        thursday: bool
        friday: bool
        saturday: bool
        sunday: bool
        shift_start: str        # Format: "HH:MM"
        shift_end: str          # Format: "HH:MM"
    }
    
    # System Fields
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    routes: [Route]             # Virtual, current routes
```

### Indexes
```javascript
{
  "vehicle_code": 1,      // Unique
  "license_plate": 1,     // Unique
  "status": 1,            // For filtering
  "driver.id": 1          // For driver assignments
}
```

## Route Model

### Schema Definition
```python
class Route:
    # Identification
    id: str                     # MongoDB ObjectId
    route_code: str             # Format: "RT-YYYY-MM-DD-XXX"
    
    # Assignment
    car_id: str                 # References Car
    driver_id: str              # References User
    date: date                  # Route date
    
    # Stops
    stops: [{
        sequence: int           # Order in route
        appointment_id: str     # References Appointment
        patient_id: str         # References Patient
        address: Address        # Denormalized for efficiency
        
        # Time Windows
        estimated_arrival: datetime
        time_window: {
            start: str          # Format: "HH:MM"
            end: str            # Format: "HH:MM"
        }
        
        # Execution
        status: str             # Enum: ["pending", "en_route", "arrived", "completed", "failed"]
        arrival_time: datetime  # Actual arrival
        departure_time: datetime # Actual departure
        
        # Collection Data
        samples_collected: int
        notes: str
        issues: [str]           # Any problems
    }]
    
    # Route Optimization
    optimization: {
        total_distance_km: float
        estimated_duration_min: int
        algorithm_used: str     # e.g., "nearest_neighbor", "genetic"
        optimized_at: datetime
    }
    
    # Status
    status: str                 # Enum: ["planned", "in_progress", "completed", "cancelled"]
    started_at: datetime
    completed_at: datetime
    
    # Metrics
    metrics: {
        total_stops: int
        completed_stops: int
        failed_stops: int
        actual_duration_min: int
        actual_distance_km: float
    }
    
    # System Fields
    created_at: datetime
    updated_at: datetime
    created_by: str
```

### Indexes
```javascript
{
  "route_code": 1,              // Unique
  "car_id": 1,                  // Foreign key
  "driver_id": 1,               // Foreign key
  "date": 1,                    // For date queries
  "status": 1                   // For filtering
}

// Compound Index
{
  "date": 1,
  "car_id": 1
}
```

## User Model

### Schema Definition
```python
class User:
    # Identification
    id: str                     # MongoDB ObjectId
    username: str               # Unique, lowercase
    email: str                  # Unique, validated
    
    # Personal Information
    first_name: str
    last_name: str
    phone: str
    
    # Authentication
    password_hash: str          # Bcrypt hash
    mfa_enabled: bool           # Two-factor auth
    mfa_secret: str             # If MFA enabled
    
    # Roles and Permissions
    role: str                   # Enum: ["admin", "manager", "operator", "driver", "provider"]
    permissions: [str]          # Granular permissions
    departments: [str]          # Assigned departments
    
    # Status
    status: str                 # Enum: ["active", "inactive", "suspended"]
    last_login: datetime
    login_attempts: int         # Reset on successful login
    locked_until: datetime      # If too many failed attempts
    
    # Preferences
    preferences: {
        language: str           # Default: "pt-BR"
        timezone: str           # Default: "America/Sao_Paulo"
        notifications: {
            email: bool
            sms: bool
            push: bool
        }
    }
    
    # System Fields
    created_at: datetime
    updated_at: datetime
    password_changed_at: datetime
    
    # Session Management
    active_sessions: [{
        token_id: str
        device: str
        ip_address: str
        created_at: datetime
        expires_at: datetime
    }]
```

### Indexes
```javascript
{
  "username": 1,          // Unique
  "email": 1,             // Unique
  "role": 1,              // For filtering
  "status": 1             // For filtering
}
```

## Data Relationships

### Entity Relationship Diagram
```
Patient (1) ----< (N) Appointment
Patient (1) ----< (N) Collection
Provider (1) ----< (N) Appointment
Car (1) ----< (N) Route
Route (1) ----< (N) RouteStop
RouteStop (N) >---- (1) Appointment
User (1) ----< (N) [Created Records]
```

### Referential Integrity
- Soft deletes for Patients (status = "inactive")
- Cascade updates for denormalized data
- Foreign key validation at application level
- Orphan record cleanup job

## Migration Strategies

### Schema Evolution
1. **Backward Compatible Changes**: Add new optional fields
2. **Breaking Changes**: Version the API, migrate in phases
3. **Data Migration**: Use MongoDB's flexible schema during transition
4. **Rollback Plan**: Keep backup of original schema

### Performance Optimization
1. **Denormalization**: Store frequently accessed data together
2. **Aggregation Pipeline**: Pre-calculate complex queries
3. **Caching Strategy**: Cache patient and appointment data
4. **Archival**: Move old appointments to archive collection

## Data Validation Examples

### Python Implementation
```python
from pydantic import BaseModel, validator, Field
from typing import Optional, List
from datetime import date, datetime

class PatientModel(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    cpf: str = Field(..., regex=r'^\d{11}$')
    email: Optional[EmailStr]
    phone: str = Field(..., regex=r'^(\+55)?\s*(\d{2})\s*(\d{4,5})-?(\d{4})$')
    
    @validator('cpf')
    def validate_cpf(cls, v):
        # Implement CPF validation logic
        return v
    
    @validator('date_of_birth')
    def validate_birth_date(cls, v):
        if v >= date.today():
            raise ValueError('Birth date must be in the past')
        return v
```

### MongoDB Schema Validation
```javascript
db.createCollection("patients", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["first_name", "last_name", "cpf", "phone"],
      properties: {
        first_name: {
          bsonType: "string",
          minLength: 2,
          maxLength: 50
        },
        cpf: {
          bsonType: "string",
          pattern: "^[0-9]{11}$"
        },
        status: {
          enum: ["active", "inactive", "blocked"]
        }
      }
    }
  }
})
```