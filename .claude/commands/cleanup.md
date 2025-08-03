---
allowed-tools: all
description: Clean up merged feature branch locally and remotely
---

# Cleanup Merged Branch

Clean up a feature branch that has been merged by switching to master, updating it, and deleting the branch both locally and remotely.
Usage: `/cleanup [branch-name]`
The command will:

1. Switch to master/main branch
2. Pull latest changes
3. Delete local feature branch
4. Delete remote feature branch
5. Show cleanup summary

Execute:

```bash
#!/bin/bash
BRANCH_NAME="$1"

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Determine main branch (master or main)
if git show-ref --verify --quiet refs/heads/main; then
    MAIN_BRANCH="main"
elif git show-ref --verify --quiet refs/heads/master; then
    MAIN_BRANCH="master"
else
    echo "❌ Cannot find main or master branch"
    exit 1
fi

# If no branch specified, use current branch
if [ -z "$BRANCH_NAME" ]; then
    if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
        echo "❌ Cannot cleanup main/master branch"
        echo "💡 Specify a feature branch: /cleanup feature-name"
        exit 1
    fi
    BRANCH_NAME="$CURRENT_BRANCH"
fi

# Check if branch exists locally
if ! git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
    echo "❌ Branch '$BRANCH_NAME' does not exist locally"
    exit 1
fi

# Prevent cleanup of protected branches
if [[ "$BRANCH_NAME" == "main" || "$BRANCH_NAME" == "master" ]]; then
    echo "❌ Cannot cleanup protected branch: $BRANCH_NAME"
    exit 1
fi

# Check if branch has been merged
if ! git merge-base --is-ancestor $BRANCH_NAME $MAIN_BRANCH 2>/dev/null; then
    echo "⚠️  Branch '$BRANCH_NAME' may not be fully merged into $MAIN_BRANCH"
    echo "🔍 Recent commits on $BRANCH_NAME:"
    git log --oneline $MAIN_BRANCH..$BRANCH_NAME | head -3
    echo ""
    read -p "Are you sure you want to delete this branch? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "🚫 Cleanup cancelled"
        exit 1
    fi
fi

echo "🧹 Cleaning up branch: $BRANCH_NAME"
echo "📍 Main branch: $MAIN_BRANCH"

# Step 1: Switch to main branch
echo "🔄 Switching to $MAIN_BRANCH..."
git checkout $MAIN_BRANCH

if [ $? -ne 0 ]; then
    echo "❌ Failed to switch to $MAIN_BRANCH"
    exit 1
fi

# Step 2: Pull latest changes
echo "📥 Pulling latest changes from origin/$MAIN_BRANCH..."
git pull origin $MAIN_BRANCH

if [ $? -ne 0 ]; then
    echo "⚠️  Failed to pull latest changes, but continuing with cleanup..."
fi

# Step 3: Delete local branch
echo "🗑️  Deleting local branch: $BRANCH_NAME"
git branch -d $BRANCH_NAME

if [ $? -ne 0 ]; then
    echo "⚠️  Failed to delete local branch (may have unmerged commits)"
    read -p "Force delete local branch? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -D $BRANCH_NAME
    else
        echo "🚫 Local branch cleanup cancelled"
        exit 1
    fi
fi

# Step 4: Delete remote branch
echo "🌐 Deleting remote branch: origin/$BRANCH_NAME"
git push origin --delete $BRANCH_NAME

if [ $? -ne 0 ]; then
    echo "⚠️  Failed to delete remote branch (may not exist or no permissions)"
else
    echo "✅ Remote branch deleted successfully"
fi

echo ""
echo "🎉 Cleanup completed!"
echo "✅ Switched to: $MAIN_BRANCH"
echo "✅ Local branch deleted: $BRANCH_NAME"
echo "✅ Remote branch deleted: origin/$BRANCH_NAME"
echo "💡 You're now on the updated $MAIN_BRANCH branch"
```
