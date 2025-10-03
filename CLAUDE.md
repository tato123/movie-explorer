# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turborepo monorepo for a movie search application built as a take-home exercise. The app allows users to search for movies, filter by genre, paginate results, and view detailed movie information using an external Movies API

**Base API URL**: `https://0kadddxyh3.execute-api.us-east-1.amazonaws.com`

## Repository Structure

```
movies-explorer/
├── apps/
│   └── webapp/          # Next.js 15 application (main frontend)
└── packages/
    ├── api-client/      # Movies API client library (REST & GraphQL)
    ├── tanstack-query-client/ # TanStack Query hooks and options
    ├── eslint-config/   # Shared ESLint configurations
    └── typescript-config/ # Shared TypeScript configurations
```

## Essential Commands

### Development

```bash
# Install dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Run specific app
turbo dev --filter=webapp
turbo dev --filter=@jfontanez/webapp

# Type checking
pnpm check-types
turbo check-types --filter=api-client
```

### Build & Lint

```bash
# Build all packages
pnpm build

# Build specific package
turbo build --filter=api-client

# Lint all packages
pnpm lint

# Lint specific package
turbo lint --filter=webapp

# Format code
pnpm format
```

## API Client Architecture (`packages/api-client`)

The API client is organized into separate REST and GraphQL implementations.

## Code Style Conventions

### Conditional Statements

All if statements must use braces on separate lines:

```typescript
// Correct
if (condition) {
  logic;
}

// Incorrect
if (condition) logic;
```

### Git Commit Messages

When creating git commits, append:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Technology Stack

- **Framework**: Next.js 15 with Turbopack
- **Language**: TypeScript 5.9.2
- **Package Manager**: pnpm 9.0.0
- **Monorepo**: Turborepo
- **Styling**: Tailwind CSS v4
- **Validation**: Zod v4
- **State Management**: nuqs (URL-based state)
- **UI Components**: Lucide icons, class-variance-authority
- **View Transitions**: React's `unstable_ViewTransition` API (wraps native browser View Transitions API)

## View Transitions

This app uses Next.js 15's experimental view transitions support via React's `unstable_ViewTransition` API:

```typescript
import { unstable_ViewTransition as ViewTransition } from "react";

export default function Page() {
  return (
    <ViewTransition name="main-content">
      <main>
        {/* content */}
      </main>
    </ViewTransition>
  );
}
```

**Configuration**: Enabled in `next.config.js` with `experimental: { viewTransition: true }`

**How it works**:

1. Wrap page content with `<ViewTransition name="identifier">`
2. Use matching names across pages to animate transitions
3. CSS controls animation behavior via `::view-transition-old()` and `::view-transition-new()` pseudo-elements
4. Browser automatically animates between pages when navigating

## Testing Strategy

This project uses **AI-driven testing** with custom subagents instead of traditional unit tests:

### Available Test Agents

#### E2E Tester (`@e2e-tester`)

Comprehensive end-to-end testing through realistic user scenarios:

- Automatically manages dev/production server startup
- Tests all user workflows with permutations (search, filter, pagination, navigation)
- Validates across multiple viewports (desktop, tablet, mobile)
- Monitors console errors and performance
- Creates varied navigation patterns to catch integration issues

**When to use**: After implementing features, fixing bugs, or before submitting changes

#### Code Analyzer (`@code-analyzer`)

Deep code analysis focused on logic errors and business rules:

- Identifies potential runtime errors (null checks, async issues, race conditions)
- Validates business logic implementation
- Checks error handling coverage
- Reviews state management for infinite loops or stale data
- Analyzes API integration patterns

**When to use**: After refactoring, implementing complex logic, or when unsure about edge cases

### Testing Philosophy

These agents provide better coverage than traditional unit tests by:

- Testing actual user workflows end-to-end, not isolated functions
- Catching integration issues between components and API
- Adapting to UI changes without brittle selectors or mocks
- Validating business rules in real scenarios

**When writing code**: Focus on functionality and clean architecture. Let the AI agents handle comprehensive testing validation.

## Important Notes

- **Node Version**: Requires Node.js >=18
- **No File Creation**: Prefer editing existing files over creating new ones unless absolutely necessary
- **No Documentation Files**: Never proactively create .md files or READMEs unless explicitly requested
- **Authentication**: All API endpoints (except `/auth/token`) require Bearer token authentication
- **Pagination**: API uses `page` (starting at 1) and `limit` query parameters for pagination
- **Testing**: Use `@e2e-tester` for workflow validation and `@code-analyzer` for logic review instead of writing traditional unit tests
