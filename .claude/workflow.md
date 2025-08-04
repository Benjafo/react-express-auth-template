### 1. Start from main/master

`git checkout master && git pull`

### 2. Run Claude Code (it will auto-commit to this branch)

`claude`

### 3. Create feature branch for Claude Code work

`/branch BRANCH_NAME`

### 4. Begin work on feature using Claude Code with the prompt:

Read and STRICTLY FOLLOW the instructions in .claude/CLAUDE.md. Let me know when you have read the document and are ready to begin the CORE WORKFLOW.

### 4. (Optional) periodically squash commits as tasks are completed

`/squash`

### 5. When done, run a code quality check

`/check`

### 6. When the check passes, push the feature branch

`/push`

### 7. Create a pull request through GitHub:

Brief description of what this PR does and why it's needed.

### 8. (Optional) clean up

`/cleanup`
