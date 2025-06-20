# Claude Assistant Configuration

This folder contains configuration and documentation specifically for AI-assisted development with Claude.

## Structure

```
.claude/
├── README.md              # This file
├── claude_docs.md         # Main project documentation and current status
├── context.md             # Business requirements and user roles
├── tech_decisions.md      # Technical architecture decisions
├── api_standards.md       # API design standards
├── data_models.md         # Database schemas and validation
├── modules.md             # Detailed module specifications
├── instructions.md        # Development guidelines and best practices
├── preferences.md         # Code style preferences
├── troubleshooting.md     # Common issues and solutions
├── local_setup.md         # Development environment setup
├── deployment.md          # Production deployment guide
├── changelog.md           # Project change history
└── commands/              # Custom CLI commands and scripts
```

## Key Documents

### claude_docs.md
The main project overview including:
- Current project status (85% complete)
- Technology stack details
- API endpoint specifications
- Recent accomplishments
- Next steps for development

### context.md
Business context including:
- Problem statement and objectives
- User roles and permissions
- Business constraints
- Success metrics

### tech_decisions.md
Architectural decisions with rationale:
- Why MongoDB for the database
- Why FastAPI for the backend
- Why React + Vite for frontend
- Migration strategies

### modules.md
Detailed specifications for each system module:
- Comprehensive Patients Module (12 components)
- Schedule Module (upload → process → visualize)
- Dashboard Module
- Future modules planning

### data_models.md
Complete database schemas:
- Patient model with validation rules
- Appointment model
- Car/Route models
- MongoDB indexes and relationships

## Commands

The `commands/` folder contains custom scripts for:
- **Development**: `make dev` to start all services
- **Database**: `make db-backup`, `make db-seed`
- **Deployment**: `make deploy-prod`
- **Code Generation**: `make gen-crud name=patient`
- **Maintenance**: `make security-audit`

Run `make help` to see all available commands.

## Usage

When working with Claude or other AI assistants:

1. Start by reading `claude_docs.md` for project overview
2. Check `context.md` for business requirements
3. Follow guidelines in `instructions.md`
4. Use commands from `commands/` folder
5. Refer to `data_models.md` for database work
6. Check `troubleshooting.md` if you encounter issues

## Maintenance

Keep documentation up to date:
- Update `claude_docs.md` with project progress
- Add new technical decisions to `tech_decisions.md`
- Document new modules in `modules.md`
- Update `changelog.md` with significant changes
- Add new commands to `commands/` with documentation