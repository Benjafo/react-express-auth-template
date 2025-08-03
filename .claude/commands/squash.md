---
allowed-tools: all
description: Squash checkpoint commits into a single task commit
---

# Squash Checkpoint Commits

Squash multiple checkpoint commits into a single task commit with a descriptive message.
Usage: `/squash [commit-message]`
The command will:

1. Check if on a feature branch (not main/master)
2. Count checkpoint commits
3. Extract change descriptions from checkpoint messages
4. Squash commits into single task commit
5. Use provided message or auto-generate from changes

Execute:

```bash
#!/bin/bash
CUSTOM_MESSAGE="$*"

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Check if on protected branch
if [[ "$BRANCH" == "main" || "$BRANCH" == "master" ]]; then
    echo "⚠️  Cannot squash commits on protected branch: $BRANCH"
    exit 1
fi

# Count checkpoint commits
CHECKPOINT_COUNT=$(git log --oneline | grep "checkpoint:" | wc -l)

if [ "$CHECKPOINT_COUNT" -eq 0 ]; then
    echo "ℹ️  No checkpoint commits found to squash"
    exit 0
fi

if [ "$CHECKPOINT_COUNT" -eq 1 ]; then
    echo "ℹ️  Only one checkpoint commit found, no squashing needed"
    exit 0
fi

# Extract changes from checkpoint messages
LAST_CHANGES=$(git log --oneline | grep "checkpoint:" | head -3 | cut -d' ' -f3- | tr '\n' ', ' | sed 's/, $//')

# Use custom message or generate from changes
if [ -n "$CUSTOM_MESSAGE" ]; then
    COMMIT_MESSAGE="task: $CUSTOM_MESSAGE - $(date +'%Y-%m-%d')"
else
    COMMIT_MESSAGE="task: $LAST_CHANGES - $(date +'%Y-%m-%d')"
fi

echo "🔄 Squashing $CHECKPOINT_COUNT checkpoint commits..."
echo "📝 Commit message: $COMMIT_MESSAGE"

# Squash commits
git reset --soft HEAD~$CHECKPOINT_COUNT
git commit -m "$COMMIT_MESSAGE"

echo "✅ Successfully squashed $CHECKPOINT_COUNT commits into single task commit"
echo "🌿 Branch: $BRANCH"
echo "💬 Message: $COMMIT_MESSAGE"
```
