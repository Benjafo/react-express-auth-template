---
allowed-tools: all
description: Create a new feature branch and switch to it
---

# Create Feature Branch

Create a new feature branch from the current branch (usually main/master).

Usage: `/branch feature-name`

The command will:

1. Ensure working directory is clean
2. Pull latest changes from origin
3. Create and checkout new branch
4. Push branch to origin with tracking

Execute:

```bash
#!/bin/bash
BRANCH_NAME="${1:-feature-$(date +%Y%m%d-%H%M%S)}"

# Check for clean working directory
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Working directory has uncommitted changes. Please commit or stash first."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Pull latest changes
echo "📥 Pulling latest changes from $CURRENT_BRANCH..."
git pull origin $CURRENT_BRANCH

# Create and checkout new branch
echo "🌿 Creating new branch: $BRANCH_NAME"
git checkout -b $BRANCH_NAME

echo "✅ Successfully created and switched to branch: $BRANCH_NAME"
echo "💡 You can now work on this feature branch. Changes will be auto-committed."
```
