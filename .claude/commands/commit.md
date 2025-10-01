# Commit Command

Reviews all git diffs in the project and creates a clear, concise commit message grouped by workspace packages.

## Usage

```
/commit [options]
```

## Options

- `verbosity: brief|standard|detailed` - Controls the level of detail in the commit message (default: standard)
- `exclude: package1,package2` - Comma-separated list of packages to exclude from the commit
- `include: package1,package2` - Comma-separated list of packages to include (if specified, only these packages are included)
- `instructions: "custom instructions"` - Additional instructions for commit message generation

## Examples

```bash
# Standard commit message
/commit

# Brief commit message (high-level changes only)
/commit verbosity:brief

# Detailed commit message (includes file-level changes)
/commit verbosity:detailed

# Exclude specific packages
/commit exclude:eslint-config,typescript-config

# Include only specific packages
/commit include:api-client,webapp

# Custom instructions
/commit instructions:"Focus on breaking changes and new features"

# Combined options
/commit verbosity:detailed exclude:docs instructions:"Highlight API changes"
```

## Behavior

1. Analyzes all staged and unstaged changes using `git diff` and `git status`
2. Groups changes by workspace package (apps/_, packages/_)
3. Generates a commit message following conventional commit format
4. Presents the message for review before committing
5. Asks for confirmation to proceed with the commit

## Commit Message Format

The generated commit message follows this structure:

```
<type>(<scope>): <subject>

<body>

🤖 Commit summary generated with [Claude Code](https://claude.com/claude-code)

All code architected by Jonathan Fontanez and represents original design
and implementation in compliance with review standards.
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Scopes

Scopes are derived from the workspace structure:

- `webapp` - apps/webapp
- `api-client` - packages/api-client
- `eslint-config` - packages/eslint-config
- `typescript-config` - packages/typescript-config
- Root files use `root` as scope

## Notes

- Changes are automatically grouped by package for better organization
- The commit message emphasizes the "why" over the "what"
- Breaking changes are highlighted in the commit body
- Multiple scopes are combined when changes span multiple packages
