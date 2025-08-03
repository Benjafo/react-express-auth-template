---
allowed-tools: all
description: Push local changes to remote feature branch
---

# Push to Remote

Push local commits on current feature branch to remote origin with upstream tracking.
Usage: `/push [branch-name]`
The command will:

1. Check if on a feature branch (not main/master)
2. Verify there are local commits to push
3. Push branch to origin with upstream tracking
4. Show push summary

Execute:

```bash
#!/bin/bash
BRANCH_NAME="$1"

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Get current branch if no branch specified
if [ -z "$BRANCH_NAME" ]; then
    BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
fi

# Check if on protected branch
if [[ "$BRANCH_NAME" == "main" || "$BRANCH_NAME" == "master" ]]; then
    echo "⚠️  Cannot push to protected branch: $BRANCH_NAME"
    echo "💡 Switch to a feature branch first: git checkout -b feature-name"
    exit 1
fi

# Check if branch exists locally
if ! git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
    echo "❌ Branch '$BRANCH_NAME' does not exist locally"
    exit 1
fi

# Switch to branch if not already on it
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
    echo "🔄 Switching to branch: $BRANCH_NAME"
    git checkout $BRANCH_NAME
fi

# Check if there are commits to push
if git diff --quiet origin/$BRANCH_NAME..$BRANCH_NAME 2>/dev/null; then
    echo "ℹ️  No new commits to push on branch: $BRANCH_NAME"
    exit 0
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Consider committing first:"
    git status --short
    exit 1
fi

# Show what will be pushed
echo "📤 Pushing branch '$BRANCH_NAME' to origin..."
COMMIT_COUNT=$(git rev-list --count origin/$BRANCH_NAME..$BRANCH_NAME 2>/dev/null || git rev-list --count $BRANCH_NAME)
echo "📊 Commits to push: $COMMIT_COUNT"

# Push with upstream tracking
git push -u origin $BRANCH_NAME

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed branch: $BRANCH_NAME"
    echo "🔗 Branch is now tracked: origin/$BRANCH_NAME"
    echo "💡 You can now create a pull request on GitHub/GitLab"
else
    echo "❌ Failed to push branch: $BRANCH_NAME"
    exit 1
fi
```
