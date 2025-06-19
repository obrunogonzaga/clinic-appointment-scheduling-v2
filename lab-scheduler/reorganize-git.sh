#!/bin/bash

# This script will help reorganize the git repository to track both lab-scheduler and lab-scheduler-backend

echo "=== Git Repository Reorganization Script ==="
echo "This will move the git repository to the parent directory to track both folders"
echo ""

# Save current branch and uncommitted changes info
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Go to parent directory
cd ..

# Check if there's already a .git folder here
if [ -d ".git" ]; then
    echo "WARNING: A git repository already exists in the parent directory!"
    echo "Please handle this manually."
    exit 1
fi

# Move the .git folder from lab-scheduler to parent
echo "Moving git repository to parent directory..."
mv lab-scheduler/.git .

# Create a proper .gitignore for the root level
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
venv/
__pycache__/
*.pyc
.pytest_cache/

# Build outputs
dist/
build/
*.egg-info/

# Environment files
.env
.env.local
.env.production

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Uploads
uploads/
tmp/

# Lab Scheduler specific
lab-scheduler/dist/
lab-scheduler/node_modules/

# Lab Scheduler Backend specific
lab-scheduler-backend/venv/
lab-scheduler-backend/__pycache__/
lab-scheduler-backend/.pytest_cache/
lab-scheduler-backend/uploads/
EOF

# Stage all files from both directories
echo "Staging files from both directories..."
git add .

# Show status
echo ""
echo "=== Git Status ==="
git status

echo ""
echo "=== Next Steps ==="
echo "1. Review the git status above"
echo "2. Commit these changes: git commit -m 'refactor: reorganize repository to track both frontend and backend'"
echo "3. Push to remote: git push -u origin $CURRENT_BRANCH"
echo ""
echo "Your repository now tracks both lab-scheduler/ and lab-scheduler-backend/ folders!"