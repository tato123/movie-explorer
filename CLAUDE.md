# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turborepo monorepo for a movie search application built as a take-home exercise. The app allows users to search for movies, filter by genre, paginate results, and view detailed movie information using the Movies API (https://github.com/thisdot/movies-api).

**Base API URL**: `https://0kadddxyh3.execute-api.us-east-1.amazonaws.com`

## Repository Structure

```
movies-explorer/
├── apps/
│   └── webapp/          # Next.js 15 application (main frontend)
└── packages/
    ├── api-client/      # Movies API client library (REST & GraphQL)
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

The API client is organized into separate REST and GraphQL implementations with the following key patterns:

### File Structure
```
api-client/src/
├── rest/
│   ├── client.ts    # Curried API methods and createClient factory
│   ├── schema.ts    # Zod schemas for validation
│   ├── types.ts     # TypeScript types (z.infer from schemas)
│   ├── errors.ts    # Custom error classes
│   └── index.ts     # Public exports
└── graphql/
    └── index.ts
```

### REST Client Design Patterns

**Currying Pattern**: All API methods follow a functional programming curry pattern:
```typescript
(BASE_URL: string) => (token: string) => (params) => Promise<ResponseType>
```

**Factory Pattern**: The `createClient` function automatically fetches an auth token and returns pre-configured methods:
```typescript
const client = await createClient(BASE_URL);
// All methods now have BASE_URL and token pre-applied
await client.GET_MOVIES({ page: 1, limit: 25 });
```

### Schema & Type System

- **Schemas**: All request/response schemas defined in `schema.ts` using Zod v4+
- **Naming Convention**:
  - Requests: `*_REQUEST` (e.g., `MOVIES_REQUEST`)
  - Responses: `*_RESPONSE` (e.g., `MOVIES_RESPONSE`)
- **Types**: Exported from `types.ts` using `z.infer<typeof Schema>`
- **Validation**: Automatic validation via `parseResponse` helper throws `MOVIE_API_INVALID_SCHEMA` on failure

### Error Handling

Custom error classes with consistent structure (statusCode, statusText, optional customMessage):
- `MOVIE_API_UNAUTHORIZED` - 401 errors
- `MOVIE_API_NOT_FOUND` - 404 errors
- `MOVIE_API_SERVICE_UNAVAILABLE` - 500+ errors
- `MOVIE_API_UNEXPECTED_ERROR` - Other non-ok responses
- `MOVIE_API_INVALID_SCHEMA` - Schema validation failures

The `handleResponse` helper automatically checks status codes and throws appropriate errors.

### Package Exports

The package uses granular exports for tree-shaking:
```typescript
import { createClient, GET_MOVIES } from '@jfontanez/api-client/rest';
import { MoviesResponse } from '@jfontanez/api-client/rest/types';
import { MOVIES_RESPONSE } from '@jfontanez/api-client/rest/schema';
```

## Code Style Conventions

### Conditional Statements
All if statements must use braces on separate lines:
```typescript
// Correct
if (condition) {
  logic
}

// Incorrect
if (condition) logic
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

## Important Notes

- **Node Version**: Requires Node.js >=18
- **No File Creation**: Prefer editing existing files over creating new ones unless absolutely necessary
- **No Documentation Files**: Never proactively create .md files or READMEs unless explicitly requested
- **Authentication**: All API endpoints (except `/auth/token`) require Bearer token authentication
- **Pagination**: API uses `page` (starting at 1) and `limit` query parameters for pagination
