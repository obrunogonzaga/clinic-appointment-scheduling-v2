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

## Deployment considerations:
- Environment-specific configurations
- Docker containerization for all services
- Health check endpoints
- Logging and monitoring setup
- CI/CD pipeline for automated deployments

## Code reviews:
- Focus on readability and maintainability
- Be open to feedback and suggestions

## Version control:
- Use Git for version control
- Follow a branching strategy (e.g., GitFlow)
- Regularly merge feature branches into main
- Use descriptive commit messages
- Name branches according to the changes they implement (e.g., feature/add-login, bugfix/fix-auth)

## Documentation:
- Keep API endpoints and data models up-to-date
- Write clear and concise comments in code
- Use Markdown for documentation