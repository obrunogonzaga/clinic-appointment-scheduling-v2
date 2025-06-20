# API Standards and Conventions

## URL Structure

### Base URL Format
```
https://api.clinic.com/api/v1/{resource}
```

### Resource Naming Conventions
- Use **plural nouns** for resources: `/patients`, `/appointments`, `/schedules`
- Use **kebab-case** for multi-word resources: `/lab-collections`, `/confirmation-attempts`
- Avoid verbs in URLs (use HTTP methods instead)
- Nest resources logically: `/patients/{id}/appointments`

### Examples
```
GET    /api/v1/patients              # List all patients
POST   /api/v1/patients              # Create a new patient
GET    /api/v1/patients/{id}         # Get specific patient
PUT    /api/v1/patients/{id}         # Update entire patient
PATCH  /api/v1/patients/{id}         # Partial update
DELETE /api/v1/patients/{id}         # Delete patient

GET    /api/v1/patients/{id}/appointments  # Patient's appointments
POST   /api/v1/appointments          # Create appointment (patient_id in body)
```

## HTTP Methods

### Method Usage
- **GET**: Retrieve resources (safe, idempotent)
- **POST**: Create new resources
- **PUT**: Full update/replacement
- **PATCH**: Partial update
- **DELETE**: Remove resources

### Status Codes
```python
# Success Codes
200 OK              # Successful GET, PUT, PATCH
201 Created         # Successful POST with resource creation
204 No Content      # Successful DELETE

# Client Error Codes
400 Bad Request     # Invalid request data
401 Unauthorized    # Missing or invalid authentication
403 Forbidden       # Authenticated but not authorized
404 Not Found       # Resource doesn't exist
409 Conflict        # Resource conflict (e.g., duplicate)
422 Unprocessable   # Validation errors

# Server Error Codes
500 Internal Error  # Generic server error
503 Service Unavail # Temporary unavailability
```

## Request Format

### Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {jwt_token}
X-Request-ID: {uuid}  # For request tracking
```

### Request Body Example
```json
{
  "data": {
    "type": "patient",
    "attributes": {
      "firstName": "João",
      "lastName": "Silva",
      "email": "joao.silva@email.com",
      "phone": "+55 11 98765-4321"
    }
  }
}
```

## Response Format

### Success Response Structure
```json
{
  "data": {
    "id": "123",
    "type": "patient",
    "attributes": {
      "firstName": "João",
      "lastName": "Silva",
      "email": "joao.silva@email.com",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    "relationships": {
      "appointments": {
        "links": {
          "related": "/api/v1/patients/123/appointments"
        }
      }
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0"
  }
}
```

### Error Response Structure
```json
{
  "errors": [
    {
      "id": "unique-error-id",
      "status": "422",
      "code": "VALIDATION_ERROR",
      "title": "Validation Failed",
      "detail": "The email field must be a valid email address",
      "source": {
        "pointer": "/data/attributes/email"
      },
      "meta": {
        "field": "email",
        "rule": "email_format"
      }
    }
  ],
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

## Pagination

### Request Parameters
```
GET /api/v1/patients?page[number]=2&page[size]=20
```

### Pagination Response
```json
{
  "data": [...],
  "meta": {
    "pagination": {
      "page": 2,
      "pageSize": 20,
      "pageCount": 10,
      "totalCount": 195
    }
  },
  "links": {
    "first": "/api/v1/patients?page[number]=1&page[size]=20",
    "prev": "/api/v1/patients?page[number]=1&page[size]=20",
    "self": "/api/v1/patients?page[number]=2&page[size]=20",
    "next": "/api/v1/patients?page[number]=3&page[size]=20",
    "last": "/api/v1/patients?page[number]=10&page[size]=20"
  }
}
```

## Filtering and Sorting

### Filter Syntax
```
# Exact match
GET /api/v1/patients?filter[status]=active

# Multiple values (OR)
GET /api/v1/patients?filter[status]=active,pending

# Range filters
GET /api/v1/appointments?filter[date][gte]=2024-01-01&filter[date][lte]=2024-01-31

# Search
GET /api/v1/patients?search=joão silva

# Nested filters
GET /api/v1/patients?filter[address.city]=São Paulo
```

### Sort Syntax
```
# Single field (ascending)
GET /api/v1/patients?sort=lastName

# Single field (descending)
GET /api/v1/patients?sort=-lastName

# Multiple fields
GET /api/v1/patients?sort=lastName,-createdAt
```

## Field Selection

### Sparse Fieldsets
```
# Only return specific fields
GET /api/v1/patients?fields[patient]=firstName,lastName,email

# Include related resources with specific fields
GET /api/v1/patients?include=appointments&fields[appointment]=date,status
```

## Relationships

### Including Related Resources
```
# Include single relationship
GET /api/v1/patients/123?include=appointments

# Include multiple relationships
GET /api/v1/patients/123?include=appointments,collections

# Nested includes
GET /api/v1/patients/123?include=appointments.provider
```

## Versioning

### URL Versioning
- Version in URL path: `/api/v1/`, `/api/v2/`
- Major versions only (v1, v2, not v1.1)
- Deprecation notices in headers:
  ```
  Sunset: Sat, 31 Dec 2024 23:59:59 GMT
  Deprecation: true
  Link: <https://api.clinic.com/api/v2/patients>; rel="successor-version"
  ```

## Rate Limiting

### Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1672531200
```

### Rate Limit Response
```json
{
  "errors": [{
    "status": "429",
    "code": "RATE_LIMIT_EXCEEDED",
    "title": "Too Many Requests",
    "detail": "Rate limit exceeded. Try again in 60 seconds."
  }]
}
```

## Batch Operations

### Batch Create
```json
POST /api/v1/patients/batch
{
  "data": [
    {"type": "patient", "attributes": {...}},
    {"type": "patient", "attributes": {...}}
  ]
}
```

### Batch Update
```json
PATCH /api/v1/patients/batch
{
  "data": [
    {"id": "123", "type": "patient", "attributes": {...}},
    {"id": "124", "type": "patient", "attributes": {...}}
  ]
}
```

## Webhooks

### Webhook Payload
```json
{
  "id": "evt_123",
  "type": "appointment.created",
  "created": "2024-01-15T10:30:00Z",
  "data": {
    "object": {
      "id": "apt_456",
      "type": "appointment",
      "attributes": {...}
    }
  }
}
```

### Webhook Security
- HMAC-SHA256 signature in `X-Webhook-Signature` header
- Timestamp in `X-Webhook-Timestamp` header
- Replay protection with timestamp validation

## API Documentation

### OpenAPI Specification
- Available at `/api/v1/openapi.json`
- Interactive docs at `/api/v1/docs`
- Includes all endpoints, schemas, and examples

### Response Examples
Every endpoint should include:
- Success response example
- Common error responses
- Request body schema
- Query parameter documentation

## Best Practices

### Performance
1. Use pagination for all list endpoints
2. Implement field selection to reduce payload size
3. Add database indexes for common filter fields
4. Use HTTP caching headers where appropriate
5. Implement connection pooling

### Security
1. Always use HTTPS
2. Validate all input data
3. Sanitize data before storage
4. Use parameterized queries
5. Implement rate limiting
6. Log all API access

### Consistency
1. Use consistent naming across all endpoints
2. Follow the same error format everywhere
3. Use UTC timestamps (ISO 8601)
4. Return created resource after POST
5. Be explicit about nullable fields

### Developer Experience
1. Provide helpful error messages
2. Include request ID for debugging
3. Document all status codes used
4. Provide examples for all endpoints
5. Version breaking changes properly