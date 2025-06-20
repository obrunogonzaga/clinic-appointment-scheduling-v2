# Development Preferences

## Code Style
- Use TypeScript for React components where beneficial
- Follow Python PEP 8 with Black formatter (line length: 88)
- Use semantic commit messages (feat:, fix:, docs:, etc.)
- Prefer functional components in React with hooks
- Use Tailwind utility classes over custom CSS
- Named exports over default exports for better refactoring
- Destructure props at function declaration
- Use early returns to reduce nesting

## Architecture Patterns
- Clean architecture with clear separation of concerns
- Component-based architecture for React
- RESTful API design following OpenAPI 3.0
- JWT for stateless authentication with refresh tokens
- Repository pattern for data access layer
- Service layer for business logic
- Dependency injection for testability

## State Management
- Use React Context for global state (auth, theme, user preferences)
- Local component state for UI-specific data
- React Query for server state management
- Avoid prop drilling - use composition or context
- Optimistic updates for better UX
- Persist critical state in localStorage/sessionStorage

## Performance Guidelines
- Lazy load routes and heavy components
- Implement virtual scrolling for lists > 100 items
- Use memo/useMemo/useCallback appropriately
- Optimize bundle size with code splitting
- Preload critical resources
- Use WebP images with fallbacks
- Implement progressive image loading
- Cache API responses appropriately

## Accessibility Standards
- WCAG 2.1 AA compliance minimum
- Semantic HTML elements (nav, main, article, etc.)
- ARIA labels where semantic HTML insufficient
- Keyboard navigation support for all interactions
- Focus management for modals and dynamic content
- Color contrast ratio of at least 4.5:1
- Alt text for all informative images
- Skip navigation links

## Testing Strategy
- Unit tests for business logic (utils, services)
- Integration tests for API endpoints
- Component tests with React Testing Library
- E2E tests for critical user flows (Cypress/Playwright)
- Visual regression tests for UI components
- Performance tests for database queries
- Load testing for concurrent users
- Accessibility tests with axe-core

## Error Handling
- Structured error responses from API
- User-friendly error messages in UI
- Proper HTTP status codes
- Error boundaries in React
- Fallback UI for error states
- Retry mechanisms with exponential backoff
- Logging errors to monitoring service
- Show actionable error messages to users

## Security Considerations
- Input validation on all endpoints
- CORS configuration with specific origins
- Rate limiting per user and IP
- Password hashing with bcrypt (min 10 rounds)
- Use of environment variables for sensitive data
- SQL injection prevention with parameterized queries
- XSS prevention with proper escaping
- CSRF tokens for state-changing operations

## Code Organization
- Feature-based folder structure
- Shared components in common folder
- Utility functions in utils folder
- Custom hooks in hooks folder
- Constants in separate files
- Types/interfaces co-located with components
- API calls centralized in services
- Consistent file naming (PascalCase for components)

## Development Workflow
- Feature branches from main
- Pull request reviews required
- Automated CI/CD pipeline
- Pre-commit hooks for linting
- Conventional commits enforced
- Automated testing before merge
- Staging environment for QA
- Feature flags for gradual rollout

## Database Preferences
- Use MongoDB transactions for critical operations
- Implement soft deletes for audit trail
- Add created_at/updated_at to all collections
- Use compound indexes for common queries
- Avoid deeply nested documents (max 3 levels)
- Implement data archival strategy
- Regular backups with point-in-time recovery
- Connection pooling for performance

## API Design Preferences
- Version APIs in URL (/api/v1/)
- Use plural nouns for resources
- Implement pagination by default
- Support field filtering
- Use ISO 8601 for dates
- Return metadata in responses
- Implement request ID tracking
- Support batch operations where logical

## Frontend Preferences
- Mobile-first responsive design
- Progressive enhancement approach
- Skeleton screens over spinners
- Optimistic UI updates
- Form validation on blur
- Debounce search inputs
- Infinite scroll for long lists
- Toast notifications for actions

## Monitoring and Logging
- Structured logging (JSON format)
- Log levels (ERROR, WARN, INFO, DEBUG)
- Request/response logging (sanitized)
- Performance metrics collection
- Error tracking with Sentry or similar
- User analytics (privacy-compliant)
- Uptime monitoring for all services
- Database query performance tracking