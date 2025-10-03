# Commit Command

Review git changes and create a commit message following the format below.

## Instructions

When the user runs `/commit`:

1. Run these commands in parallel:
   - `git status --porcelain`
   - `git diff --cached`
   - `git diff`

2. Analyze the changes and generate a conventional commit message with this format:

```
<type>(<scope>): <subject>

<body>

🤖 Commit summary generated with [Claude Code](https://claude.com/claude-code)

All code architected by Jonathan Fontanez and represents original design
and implementation in compliance with review standards.
```

3. Show the commit message to the user

4. Run: `git add -A && git commit -m "$(cat <<'EOF'`
   `<commit message here>`
   `EOF`
   `)")`

## Commit Message Guidelines

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Scopes (based on monorepo structure)
- `webapp` - apps/webapp
- `api-client` - packages/api-client
- `eslint-config` - packages/eslint-config
- `typescript-config` - packages/typescript-config
- `root` - Root-level changes
- Use comma-separated scopes for multi-package changes (e.g., `webapp,api-client`)

### Subject
- Max 50 characters
- Imperative mood (e.g., "add" not "added")
- No period at the end

### Body
- Group changes by package
- Explain "why" not "what"
- Highlight breaking changes
- Keep it concise (3-5 lines for standard changes)
