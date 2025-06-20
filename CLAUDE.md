# Claude AI Assistant Documentation

All AI assistant documentation is organized in the `.claude/` folder.

See [.claude/README.md](.claude/README.md) for the complete documentation structure.

## Quick Links

- [Project Overview](.claude/claude_docs.md) - Main project documentation and current status
- [Business Context](.claude/context.md) - Business requirements and user roles
- [Technical Decisions](.claude/tech_decisions.md) - Architecture decisions and rationale
- [Data Models](.claude/data_models.md) - Database schemas and validation
- [Module Specifications](.claude/modules.md) - Detailed module documentation
- [Development Guidelines](.claude/instructions.md) - Best practices and standards
- [Custom Commands](.claude/commands/) - CLI tools and automation scripts

## Quick Start

```bash
# Show all available commands
make help

# Start development environment
make dev

# Generate a new CRUD module
make gen-crud name=patient
```

## Current Status

- **Overall Progress**: 85% Complete
- **Frontend**: ✅ 100% Complete (all 12 patient components implemented)
- **Backend**: 🚧 In Progress (API implementation needed)
- **Mobile**: ⏳ Pending

For detailed status and next steps, see [claude_docs.md](.claude/claude_docs.md#current-project-status).