# Claude Code Instructions

## When creating new features:
1. Always start with the backend API endpoint
2. Add proper error handling and validation
3. Create corresponding frontend components
4. Update documentation

## Code organization:
- Keep components small and focused
- Use custom hooks for shared logic
- Implement proper prop types/interfaces
- Follow the established folder structure

## Database operations:
- Use transactions for multi-step operations
- Implement proper indexing
- Add data validation at the model level
- Use connection pooling

## API Development:
- Use Pydantic for request/response validation
- Implement pagination for all list endpoints (default: 20 items)
- Add OpenAPI documentation strings to all endpoints
- Use dependency injection for database sessions
- Follow RESTful conventions strictly
- Return 201 with created resource for POST requests
- Use proper HTTP status codes (see api_standards.md)
- Implement request ID tracking for debugging

## Frontend Development:
- Implement loading states for all async operations
- Add error boundaries for component error handling
- Use React Query or SWR for data fetching and caching
- Implement optimistic updates where appropriate
- Show user-friendly error messages (not technical details)
- Add skeleton loaders instead of spinners for better UX
- Implement proper form validation with real-time feedback
- Use debouncing for search inputs (300ms)

## Testing Requirements:
- Minimum 80% code coverage for new code
- Test edge cases and error scenarios
- Mock external dependencies (APIs, databases)
- Use fixtures for test data consistency
- Write integration tests for critical paths
- Test loading states and error states in frontend
- Validate API responses match OpenAPI schema
- Performance tests for endpoints with large datasets

## Security Best Practices:
- Never log sensitive data (passwords, tokens, CPF)
- Sanitize all user inputs before database operations
- Use parameterized queries exclusively
- Implement rate limiting on all endpoints
- Validate file uploads (type, size, content)
- Use HTTPS everywhere, no HTTP fallback
- Implement CSRF protection for state-changing operations
- Regular security dependency updates

## Performance Optimization:
- Use database indexes for all foreign keys and filter fields
- Implement Redis caching for frequently accessed data
- Lazy load frontend routes and components
- Optimize images (WebP format, responsive sizes)
- Bundle splitting by route in frontend
- Use MongoDB aggregation pipeline for complex queries
- Implement database connection pooling
- Add performance monitoring (response times, slow queries)

## Error Handling:
- Create custom exception classes for different error types
- Log errors with context (user ID, request ID, timestamp)
- Never expose internal error details to users
- Implement retry logic for transient failures
- Add circuit breakers for external service calls
- Create error tracking dashboard
- Define error recovery strategies

## Deployment considerations:
- Environment-specific configurations
- Docker containerization for all services
- Health check endpoints
- Logging and monitoring setup
- CI/CD pipeline for automated deployments
- Zero-downtime deployment strategy
- Database migration scripts
- Rollback procedures documented

## Code reviews:
- Focus on readability and maintainability
- Encourage code reviews from team members
- Be open to feedback and suggestions
- Check for security vulnerabilities
- Verify error handling is comprehensive
- Ensure tests are meaningful, not just coverage

## Version control:
- Use Git for version control
- Follow a branching strategy (e.g., GitFlow)
- Regularly merge feature branches into main
- Feature naming conventions: e.g., feature/short-description
- Write meaningful commit messages (see Conventional Commits)
- Squash commits before merging to main
- Tag releases with semantic versioning

## Documentation:
- Keep API endpoints and data models up-to-date
- Write clear and concise comments in code
- Use Markdown for documentation
- Document all environment variables
- Add JSDoc comments for complex functions
- Keep README files current
- Document deployment procedures
- Maintain architecture decision records (ADRs)

## Implementation Phases

### Phase 1: Initial Setup (1 day)
1. Create React project with Vite
2. Install dependencies
3. Configure Tailwind CSS
4. Basic folder structure
5. Configure routing

### Phase 2: Base Layout (1 day)
1. Implement navigable Sidebar
2. Create Header with notifications
3. Responsive layout system
4. Page navigation

### Phase 3: Dashboard (1 day)
1. KPI components
2. Quick actions
3. Activity timeline
4. Car status
5. Integration with mocked data

### Phase 4: Upload and Processing (2 days)
1. Drag & drop upload component
2. Excel/CSV file reading
3. Spreadsheet data parser
4. Information extraction (CPF, phone, etc)
5. Driver grouping
6. Validations and error handling

### Phase 5: Calendar Visualization (2 days)
1. Calendar grid
2. Event positioning
3. Implement drag & drop
4. Details modal
5. Edit actions

### Phase 6: Refinements (1 day)
1. Toast notifications
2. Loading states
3. Animations
4. Mobile responsiveness
5. Manual testing

### Phase 7: Backend Implementation
1. FastAPI project setup
2. MongoDB integration
3. API endpoints implementation
4. File processing migration to backend
5. Authentication system
6. Frontend-backend integration

## Data Processing Guidelines

### Input Spreadsheet (DasaExp)
- **Car Identification**: Extract number from "Nome da Sala" field
- **CPF**: Clean and format from "Documento(s) Paciente" field
- **Phone**: Extract first valid mobile number
- **Address**: Capitalize and format correctly
- **Times**: Convert to Date objects for calculations

### Drag & Drop Implementation
1. Validate time conflicts when moving
2. Update state immediately
3. Visual feedback during drag
4. Allow undo actions

### Performance Considerations
1. Virtualize large lists
2. Lazy loading of modules
3. Memoization of heavy components
4. Debounce on searches

## UI Language
All UI text and content should be in Portuguese (pt-BR) as per business requirements.