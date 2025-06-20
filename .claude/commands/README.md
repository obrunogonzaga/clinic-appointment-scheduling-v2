# Custom Commands

This folder contains custom commands and scripts to streamline development, testing, deployment, and maintenance of the Clinic Appointment Scheduling System.

## Quick Start

All commands can be accessed through the main Makefile in the project root:

```bash
# Show all available commands
make help

# Start development environment
make dev

# Run tests
make test

# Deploy to production
make deploy-prod
```

## Command Categories

### 🚀 Development Commands (`/dev`)

Commands for local development workflow:

- **start-all.sh** - Start all services (Docker or local)
  ```bash
  make dev          # With Docker
  make dev-local    # Without Docker
  ```

- **stop-all.sh** - Stop all running services
  ```bash
  make stop
  ```

- **reset-env.sh** - Reset development environment
  ```bash
  make reset
  ```

- **watch-logs.sh** - Monitor service logs
  ```bash
  make logs
  ```

- **hot-reload.sh** - Enable hot-reload monitoring
  ```bash
  make hot-reload
  ```

### 💾 Database Commands (`/db`)

Database management and maintenance:

- **backup.sh** - Create database backup
  ```bash
  make db-backup
  ```

- **restore.sh** - Restore from backup
  ```bash
  make db-restore                    # Interactive selection
  bash .claude/commands/db/restore.sh latest # Restore latest
  ```

- **seed.py** - Populate with test data
  ```bash
  make db-seed
  ```

- **migrate.py** - Run migrations
  ```bash
  make db-migrate                         # Apply migrations
  python .claude/commands/db/migrate.py down 1    # Rollback 1 migration
  ```

- **clean.sh** - Clean old backups
  ```bash
  make db-clean
  ```

### 🏗️ Build & Deploy Commands (`/deploy`)

Production deployment and management:

- **build-prod.sh** - Build for production
  ```bash
  make build
  ```

- **deploy-staging.sh** - Deploy to staging
  ```bash
  make deploy-staging
  ```

- **deploy-prod.sh** - Deploy to production
  ```bash
  make deploy-prod
  ```

- **rollback.sh** - Rollback deployment
  ```bash
  make rollback
  ```

- **health-check.sh** - Check deployment health
  ```bash
  make health-check
  ```

### ⚡ Code Generation (`/generate`)

Scaffold new code quickly:

- **api-endpoint.py** - Generate API endpoint
  ```bash
  make gen-api name=appointment
  ```

- **react-component.sh** - Generate React component
  ```bash
  make gen-component name=UserProfile type=functional
  ```

- **test-file.py** - Generate test file
  ```bash
  make gen-test file=backend/src/api/endpoints/users.py
  ```

- **crud-module.py** - Generate complete CRUD module
  ```bash
  make gen-crud name=patient
  ```

### 🛠️ Utility Commands (`/utils`)

Maintenance and utility scripts:

- **clean-logs.sh** - Clean old log files
  ```bash
  make clean-logs         # Default: 7 days
  make clean-logs days=30 # Custom retention
  ```

- **update-deps.sh** - Update dependencies
  ```bash
  make update-deps        # Minor/patch updates
  make update-deps-major  # Include major versions
  ```

- **security-audit.sh** - Security audit
  ```bash
  make security-audit     # Report only
  make security-fix       # Attempt fixes
  ```

## Direct Script Usage

While the Makefile provides convenient shortcuts, you can also run scripts directly:

```bash
# Run script directly
bash .claude/commands/dev/start-all.sh --docker

# Python scripts
python .claude/commands/generate/api-endpoint.py user --auth

# With custom options
bash .claude/commands/db/backup.sh --compress --name "pre-release"
```

## Adding New Commands

1. Create script in appropriate category folder
2. Make it executable: `chmod +x .claude/commands/category/script.sh`
3. Add entry to main Makefile
4. Update this README

### Script Template

```bash
#!/bin/bash

# Description of what this script does
# Usage: ./script-name.sh [options]

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Parse arguments
for arg in "$@"; do
    case $arg in
        --option)
            OPTION=true
            ;;
    esac
done

# Main logic
echo -e "${GREEN}✓ Task completed${NC}"
```

## Environment Variables

Some commands use environment variables:

```bash
# Deployment
export DEPLOY_ENV=staging
export DEPLOY_KEY=~/.ssh/deploy_key

# Database
export BACKUP_S3_BUCKET=clinic-backups
export DB_CONNECTION_STRING=mongodb://...

# Docker
export DOCKER_REGISTRY=registry.example.com
```

## Troubleshooting

### Permission Denied
```bash
chmod +x .claude/commands/**/*.sh
chmod +x .claude/commands/**/*.py
```

### Command Not Found
```bash
# Add to PATH
export PATH=$PATH:$(pwd)/.claude/commands/dev
```

### Docker Issues
```bash
# Reset Docker environment
make docker-clean
make reset
```

## Best Practices

1. **Always use make targets** when available
2. **Check logs** with `make logs` when debugging
3. **Run tests** before deploying: `make test`
4. **Backup database** before major changes: `make db-backup`
5. **Use dry-run** options when available

## Contributing

When adding new commands:

1. Follow existing naming conventions
2. Include help text and usage examples
3. Add proper error handling
4. Update Makefile and documentation
5. Test on both macOS and Linux