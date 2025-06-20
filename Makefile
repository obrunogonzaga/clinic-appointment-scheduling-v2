# Clinic Appointment Scheduling System - Makefile
# =============================================
# This Makefile provides convenient shortcuts for common development tasks
# Run 'make help' to see all available commands

.PHONY: help
help: ## Show this help message
	@echo "Clinic Appointment Scheduling System - Available Commands"
	@echo "========================================================"
	@echo ""
	@echo "Usage: make [command]"
	@echo ""
	@echo "Development Commands:"
	@echo "  dev                Start all services in development mode"
	@echo "  dev-local          Start services without Docker"
	@echo "  stop               Stop all running services"
	@echo "  reset              Reset entire development environment"
	@echo "  logs               Watch all service logs"
	@echo "  hot-reload         Enable hot-reload monitoring"
	@echo ""
	@echo "Database Commands:"
	@echo "  db-backup          Create database backup"
	@echo "  db-restore         Restore database from backup"
	@echo "  db-seed            Seed database with test data"
	@echo "  db-clean           Clean old database backups"
	@echo "  db-migrate         Run database migrations"
	@echo ""
	@echo "Testing Commands:"
	@echo "  test               Run all tests"
	@echo "  test-frontend      Run frontend tests only"
	@echo "  test-backend       Run backend tests only"
	@echo "  test-watch         Run tests in watch mode"
	@echo ""
	@echo "Build & Deploy Commands:"
	@echo "  build              Build for production"
	@echo "  deploy-staging     Deploy to staging environment"
	@echo "  deploy-prod        Deploy to production"
	@echo "  rollback           Rollback to previous version"
	@echo "  health-check       Check deployment health"
	@echo ""
	@echo "Code Generation:"
	@echo "  gen-api            Generate new API endpoint"
	@echo "  gen-component      Generate React component"
	@echo "  gen-test           Generate test file"
	@echo "  gen-crud           Generate complete CRUD module"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean-logs         Clean old log files"
	@echo "  update-deps        Update all dependencies"
	@echo "  security-audit     Run security audit"
	@echo ""
	@echo "Docker Commands:"
	@echo "  docker-build       Build Docker images"
	@echo "  docker-push        Push images to registry"
	@echo "  docker-clean       Clean unused Docker resources"
	@echo ""

# Default target
.DEFAULT_GOAL := help

# Development Commands
# ====================

.PHONY: dev
dev: ## Start all services in development mode
	@echo "🚀 Starting development environment..."
	@bash .claude/commands/dev/start-all.sh

.PHONY: dev-local
dev-local: ## Start services without Docker
	@echo "🚀 Starting local development environment..."
	@bash .claude/commands/dev/start-all.sh --local

.PHONY: stop
stop: ## Stop all running services
	@echo "🛑 Stopping all services..."
	@bash .claude/commands/dev/stop-all.sh

.PHONY: reset
reset: ## Reset entire development environment
	@echo "🔄 Resetting development environment..."
	@bash .claude/commands/dev/reset-env.sh

.PHONY: logs
logs: ## Watch all service logs
	@echo "📋 Watching service logs..."
	@bash .claude/commands/dev/watch-logs.sh

.PHONY: hot-reload
hot-reload: ## Enable hot-reload monitoring
	@echo "🔥 Starting hot-reload monitor..."
	@bash .claude/commands/dev/hot-reload.sh

# Database Commands
# =================

.PHONY: db-backup
db-backup: ## Create database backup
	@echo "💾 Creating database backup..."
	@bash .claude/commands/db/backup.sh

.PHONY: db-restore
db-restore: ## Restore database from backup
	@echo "📥 Restoring database..."
	@bash .claude/commands/db/restore.sh

.PHONY: db-seed
db-seed: ## Seed database with test data
	@echo "🌱 Seeding database..."
	@cd backend && python ../.claude/commands/db/seed.py

.PHONY: db-clean
db-clean: ## Clean old database backups
	@echo "🧹 Cleaning old backups..."
	@bash .claude/commands/db/clean.sh

.PHONY: db-migrate
db-migrate: ## Run database migrations
	@echo "🔄 Running migrations..."
	@cd backend && python ../.claude/commands/db/migrate.py up

# Testing Commands
# ================

.PHONY: test
test: test-frontend test-backend ## Run all tests

.PHONY: test-frontend
test-frontend: ## Run frontend tests
	@echo "🧪 Running frontend tests..."
	@cd frontend && npm test -- --watchAll=false

.PHONY: test-backend
test-backend: ## Run backend tests
	@echo "🧪 Running backend tests..."
	@cd backend && python -m pytest tests/ -v

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	@echo "👀 Running tests in watch mode..."
	@cd frontend && npm test &
	@cd backend && python -m pytest-watch

# Build & Deploy Commands
# =======================

.PHONY: build
build: ## Build for production
	@echo "🏗️  Building for production..."
	@bash .claude/commands/deploy/build-prod.sh

.PHONY: deploy-staging
deploy-staging: ## Deploy to staging
	@echo "🚀 Deploying to staging..."
	@bash .claude/commands/deploy/deploy-staging.sh

.PHONY: deploy-prod
deploy-prod: ## Deploy to production
	@echo "🚀 Deploying to production..."
	@bash .claude/commands/deploy/deploy-prod.sh

.PHONY: rollback
rollback: ## Rollback to previous version
	@echo "⏮️  Rolling back deployment..."
	@bash .claude/commands/deploy/rollback.sh

.PHONY: health-check
health-check: ## Check deployment health
	@echo "🏥 Checking deployment health..."
	@bash .claude/commands/deploy/health-check.sh

# Code Generation
# ===============

.PHONY: gen-api
gen-api: ## Generate new API endpoint (usage: make gen-api name=resource)
	@if [ -z "$(name)" ]; then \
		echo "❌ Error: Please specify resource name (e.g., make gen-api name=appointment)"; \
		exit 1; \
	fi
	@echo "⚡ Generating API endpoint for $(name)..."
	@cd backend && python ../.claude/commands/generate/api-endpoint.py $(name)

.PHONY: gen-component
gen-component: ## Generate React component (usage: make gen-component name=ComponentName type=functional)
	@if [ -z "$(name)" ]; then \
		echo "❌ Error: Please specify component name (e.g., make gen-component name=UserProfile)"; \
		exit 1; \
	fi
	@echo "⚡ Generating React component $(name)..."
	@bash .claude/commands/generate/react-component.sh $(name) $(type)

.PHONY: gen-test
gen-test: ## Generate test file (usage: make gen-test file=path/to/file.py)
	@if [ -z "$(file)" ]; then \
		echo "❌ Error: Please specify file path (e.g., make gen-test file=backend/src/api/endpoints/users.py)"; \
		exit 1; \
	fi
	@echo "⚡ Generating test for $(file)..."
	@python .claude/commands/generate/test-file.py $(file)

.PHONY: gen-crud
gen-crud: ## Generate complete CRUD module (usage: make gen-crud name=resource)
	@if [ -z "$(name)" ]; then \
		echo "❌ Error: Please specify resource name (e.g., make gen-crud name=patient)"; \
		exit 1; \
	fi
	@echo "⚡ Generating CRUD module for $(name)..."
	@python .claude/commands/generate/crud-module.py $(name)

# Maintenance Commands
# ====================

.PHONY: clean-logs
clean-logs: ## Clean old log files (usage: make clean-logs days=7)
	@echo "🧹 Cleaning old log files..."
	@bash .claude/commands/utils/clean-logs.sh $(or $(days),7)

.PHONY: update-deps
update-deps: ## Update all dependencies
	@echo "📦 Updating dependencies..."
	@bash .claude/commands/utils/update-deps.sh

.PHONY: update-deps-major
update-deps-major: ## Update dependencies including major versions
	@echo "📦 Updating dependencies (including major versions)..."
	@bash .claude/commands/utils/update-deps.sh --major

.PHONY: security-audit
security-audit: ## Run security audit
	@echo "🔒 Running security audit..."
	@bash .claude/commands/utils/security-audit.sh

.PHONY: security-fix
security-fix: ## Run security audit and attempt fixes
	@echo "🔒 Running security audit with fixes..."
	@bash .claude/commands/utils/security-audit.sh --fix

# Docker Commands
# ===============

.PHONY: docker-build
docker-build: ## Build Docker images
	@echo "🐳 Building Docker images..."
	@docker-compose -f docker/docker-compose.yml build

.PHONY: docker-push
docker-push: ## Push Docker images to registry
	@echo "🐳 Pushing Docker images..."
	@docker-compose -f docker/docker-compose.yml push

.PHONY: docker-clean
docker-clean: ## Clean unused Docker resources
	@echo "🧹 Cleaning Docker resources..."
	@docker system prune -af --volumes

# Utility Targets
# ===============

.PHONY: install
install: ## Install all dependencies
	@echo "📦 Installing dependencies..."
	@cd frontend && npm ci
	@cd backend && pip install -r requirements.txt -r requirements-dev.txt

.PHONY: format
format: ## Format code
	@echo "✨ Formatting code..."
	@cd frontend && npm run format
	@cd backend && black . && isort .

.PHONY: lint
lint: ## Run linters
	@echo "🔍 Running linters..."
	@cd frontend && npm run lint
	@cd backend && flake8 . && mypy .

.PHONY: pre-commit
pre-commit: format lint test ## Run pre-commit checks

# Quick Access Aliases
# ====================

.PHONY: up
up: dev ## Alias for 'make dev'

.PHONY: down
down: stop ## Alias for 'make stop'

.PHONY: ps
ps: ## Show running services
	@docker-compose -f docker/docker-compose.yml ps

.PHONY: shell-backend
shell-backend: ## Open backend shell
	@docker exec -it clinic-backend /bin/bash || echo "Backend container not running"

.PHONY: shell-frontend
shell-frontend: ## Open frontend shell
	@docker exec -it clinic-frontend /bin/sh || echo "Frontend container not running"

.PHONY: shell-db
shell-db: ## Open database shell
	@docker exec -it clinic-mongodb mongosh || echo "Database container not running"