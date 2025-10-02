# Movies Explorer - Architecture Documentation

## Overview

A Next.js 15 movie exploration application with server-side rendering for initial load, client-side interactivity, and smooth view transitions between pages.

## Design Principles

- **Server-first rendering**: Initial page load uses React Server Components for optimal performance
- **Progressive enhancement**: Transition to client-side rendering for interactivity after hydration
- **Smooth transitions**: View Transitions API for seamless page navigation
- **Responsive design**: Mobile-first approach optimized for phones, tablets, and desktops
- **Theme support**: Light and dark mode with system preference detection
- **Accessibility**: WCAG 2.1 AA compliant

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: nuqs (URL-based state for search/filters)
- **Data Fetching**: TanStack Query (React Query) v5 with mock data
- **Data Models**: Based on `@jfontanez/api-client` schemas/types
- **Images**: Picsum Photos placeholders (https://picsum.photos/{width}/{height})
- **Icons**: Lucide React
- **Theme**: next-themes for light/dark mode

### Required Dependencies

```bash
# Install TanStack Query
pnpm add @tanstack/react-query@latest

# Install nuqs for URL state management
pnpm add nuqs

# Install next-themes for theme support
pnpm add next-themes

# Add dependency on api-client package (already in workspace)
# Package reference: @jfontanez/api-client
```

### Package.json Updates

The `apps/webapp/package.json` should include:

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-query-devtools": "^5.0.0",
    "nuqs": "^2.0.0",
    "next-themes": "^0.4.0",
    "lucide-react": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "@jfontanez/api-client": "workspace:*"
  }
}
```

## Page Architecture

### 1. Default Page (`/`)

**Route Structure** (using Parallel Routes + Intercepting Routes):
```
app/
├── layout.tsx
├── page.tsx
├── @topMovies/
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
├── @genres/
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
├── @modal/                          # Parallel route for intercepted modals
│   ├── default.tsx                  # Return null when no modal
│   └── (..)movie/
│       └── [id]/
│           └── page.tsx             # Netflix-style modal
└── not-found.tsx
```

**Parallel Routes Architecture**:
The homepage uses parallel routes to independently load and stream different sections, enabling:
- Independent loading states per section
- Isolated error boundaries
- Streaming SSR with React Suspense
- Non-blocking UI updates

**Layout Structure**:
```
┌─────────────────────────────────────────┐
│ Header (Search Bar + Filter Button)    │
├─────────────────────────────────────────┤
│ @topMovies Slot                         │
│ ┌───────┐ ┌───────┐ ┌───────┐         │
│ │ Movie │ │ Movie │ │ Movie │         │
│ └───────┘ └───────┘ └───────┘         │
├─────────────────────────────────────────┤
│ @genres Slot                            │
│ Genre 1                                 │
│ ┌───────┐ ┌───────┐ ┌───────┐ ...    │
│ │ Movie │ │ Movie │ │ Movie │         │
│ └───────┘ └───────┘ └───────┘         │
│ Genre 2                                 │
│ (Horizontal scrollable movie list)      │
│ Genre 3                                 │
│ (Horizontal scrollable movie list)      │
└─────────────────────────────────────────┘
```

**Root Layout** (`app/layout.tsx`):
```typescript
import { ViewTransitions } from 'next/view-transitions';
import { ThemeProvider } from 'next-themes';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Movies Explorer',
    template: '%s | Movies Explorer',
  },
  description: 'Discover and explore your favorite movies',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://movies-explorer.vercel.app',
    siteName: 'Movies Explorer',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Movies Explorer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Movies Explorer',
    description: 'Discover and explore your favorite movies',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
  topMovies,
  genres,
  modal,
}: {
  children: React.ReactNode;
  topMovies: React.ReactNode;
  genres: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Header />
            <main className="container mx-auto">
              {children}
              <Suspense fallback={<TopMoviesSkeleton />}>
                {topMovies}
              </Suspense>
              <Suspense fallback={<GenresSkeleton />}>
                {genres}
              </Suspense>
            </main>
            {modal}
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
```

**Modal Slot Default** (`app/@modal/default.tsx`):
```typescript
// Return null when no modal should be shown
export default function Default() {
  return null;
}
```

**Intercepted Movie Modal** (`app/@modal/(..)movie/[id]/page.tsx`):
```typescript
'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { MovieModalContent } from '@/components/movie/movie-modal-content';
import { getMovieById } from '@/lib/mock-data';
import { useEffect, useState } from 'react';

export default function MovieModal({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    setMovie(getMovieById(params.id));
  }, [params.id]);

  if (!movie) {
    return null;
  }

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <MovieModalContent movie={movie} />
      </DialogContent>
    </Dialog>
  );
}
```

**Top Movies Slot** (`app/@topMovies/page.tsx`):
```typescript
import { getTopMovies } from '@/lib/mock-data';
import { MovieCard } from '@/components/movie/movie-card';

export default async function TopMoviesSlot() {
  const topMovies = getTopMovies();

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">Top Movies</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {topMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
```

**Top Movies Loading State** (`app/@topMovies/loading.tsx`):
```typescript
export default function TopMoviesLoading() {
  return (
    <section className="py-8">
      <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
```

**Top Movies Error State** (`app/@topMovies/error.tsx`):
```typescript
'use client';

export default function TopMoviesError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="py-8">
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Failed to load top movies
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={reset} variant="outline">
          Try Again
        </Button>
      </div>
    </section>
  );
}
```

**Genres Slot** (`app/@genres/page.tsx`):
```typescript
import { getGenresWithMovies } from '@/lib/mock-data';
import { GenreSection } from '@/components/genre/genre-section';

export default async function GenresSlot() {
  const genreMovies = getGenresWithMovies();

  return (
    <section className="py-8 space-y-12">
      {genreMovies.map(({ genre, movies }) => (
        <GenreSection key={genre.id} genre={genre} movies={movies} />
      ))}
    </section>
  );
}
```

**Genres Loading State** (`app/@genres/loading.tsx`):
```typescript
export default function GenresLoading() {
  return (
    <section className="py-8 space-y-12">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <div className="h-8 w-64 bg-muted animate-pulse rounded mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, j) => (
              <MovieCardSkeleton key={j} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
```

**Genres Error State** (`app/@genres/error.tsx`):
```typescript
'use client';

export default function GenresError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="py-8">
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Failed to load genres
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={reset} variant="outline">
          Try Again
        </Button>
      </div>
    </section>
  );
}
```

**Components**:
- `SearchBar` - Client component with debounced input
- `FilterButton` - Opens genre filter modal/sheet
- `MovieCard` - Reusable card component with poster, title, rating
- `MovieCardSkeleton` - Loading skeleton with shimmer effect
- `GenreSection` - Horizontal scrollable movie carousel per genre
- `TopMoviesSkeleton` / `GenresSkeleton` - Section-level skeletons

### 2. Search Page (`/search`)

**Route Structure**:
```
app/
└── search/
    ├── page.tsx
    ├── loading.tsx
    └── error.tsx
```

**Rendering Strategy**:
- Client Component (requires interactivity)
- URL state management via nuqs for search query and filters
- Debounced search input (300ms)
- Dedicated loading and error states

**Layout Structure**:
```
┌─────────────────────────────────────────┐
│ Search Input + Filter Button            │
├─────────────────────────────────────────┤
│ "6 Matching movies found"               │
├─────────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐         │
│ │ Movie │ │ Movie │ │ Movie │         │
│ │ Title │ │ Title │ │ Title │         │
│ │ Rating│ │ Rating│ │ Rating│         │
│ └───────┘ └───────┘ └───────┘         │
│ ┌───────┐ ┌───────┐ ┌───────┐         │
│ │ Movie │ │ Movie │ │ Movie │         │
│ └───────┘ └───────┘ └───────┘         │
├─────────────────────────────────────────┤
│ Pagination Controls                     │
└─────────────────────────────────────────┘
```

**URL State Schema**:
```typescript
// Managed by nuqs
{
  q: string;      // search query
  genre: string;  // genre filter (comma-separated IDs)
  page: number;   // current page (default: 1)
}
```

**Components**:
- `SearchInput` - Controlled input with debounce
- `GenreFilter` - Sheet/Modal with searchable genre list
- `SearchResults` - Grid of movie cards with loading states
- `Pagination` - Page navigation controls
- `EmptyState` - "No results found" message

**Search Page** (`app/search/page.tsx`):
```typescript
'use client';

import { useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { searchMovies } from '@/lib/mock-data';
import { SearchInput } from '@/components/search/search-input';
import { GenreFilter } from '@/components/search/genre-filter';
import { SearchResults } from '@/components/search/search-results';
import { Pagination } from '@/components/shared/pagination';

export default function SearchPage() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [genreId, setGenreId] = useQueryState('genre');
  const [page, setPage] = useQueryState('page', {
    defaultValue: 1,
    parse: Number,
  });

  // Memoize search results based on query params
  const results = useMemo(() => {
    return searchMovies(query, genreId);
  }, [query, genreId]);

  // Calculate pagination
  const RESULTS_PER_PAGE = 12;
  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);
  const paginatedResults = results.slice(
    (page - 1) * RESULTS_PER_PAGE,
    page * RESULTS_PER_PAGE
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex gap-4 mb-8">
        <SearchInput value={query} onChange={setQuery} />
        <GenreFilter value={genreId} onChange={setGenreId} />
      </div>

      {query || genreId ? (
        <>
          <p className="text-muted-foreground mb-6">
            {results.length} matching movie{results.length !== 1 ? 's' : ''} found
          </p>
          {paginatedResults.length > 0 ? (
            <>
              <SearchResults movies={paginatedResults} />
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No movies found matching your search.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Start typing to search for movies...
          </p>
        </div>
      )}
    </div>
  );
}
```

**Search Loading State** (`app/search/loading.tsx`):
```typescript
export default function SearchLoading() {
  return (
    <div className="container mx-auto py-8">
      <div className="h-12 w-full bg-muted animate-pulse rounded-lg mb-6" />
      <div className="h-6 w-48 bg-muted animate-pulse rounded mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
```

**Search Error State** (`app/search/error.tsx`):
```typescript
'use client';

export default function SearchError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Search Failed</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {error.message || "We couldn't complete your search. Please try again."}
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
```

### 3. Detail Page (`/movie/[id]`)

**Route Structure**:
```
app/
└── movie/
    └── [id]/
        ├── page.tsx
        ├── loading.tsx
        ├── error.tsx
        └── not-found.tsx
```

**Rendering Strategy**:
- Server Component for initial render
- Client component for "More movies like this" interactions
- Dedicated loading, error, and not-found states
- Static generation for popular movies

**Layout Structure**:
```
┌─────────────────────────────────────────┐
│ Header (Search Bar + Filter Button)    │
├─────────────────────────────────────────┤
│ ┌─────────────┐ Movie Title            │
│ │             │ Summary text...         │
│ │   Poster    │ Date published: ...     │
│ │             │ Duration: 120 min       │
│ │   Image     │                         │
│ │             │ Writers: A, B, C        │
│ └─────────────┘ Directors: X, Y         │
│                 Rating: ⭐ 8.5          │
├─────────────────────────────────────────┤
│ More movies like this                   │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐│
│ │ Movie │ │ Movie │ │ Movie │ │ Movie ││
│ └───────┘ └───────┘ └───────┘ └───────┘│
└─────────────────────────────────────────┘
```

**Components**:
- `MovieHero` - Large poster + metadata section
- `MovieMetadata` - Title, summary, date, duration, credits, rating
- `RecommendedMovies` - Horizontal scrollable carousel

**Movie Detail Page** (`app/movie/[id]/page.tsx`):
```typescript
import { notFound } from 'next/navigation';
import { getMovieById, getRecommendedMovies } from '@/lib/mock-data';
import { MovieHero } from '@/components/movie/movie-hero';
import { MovieMetadata } from '@/components/movie/movie-metadata';
import { RecommendedMovies } from '@/components/movie/recommended-movies';
import type { Metadata } from 'next';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const movie = getMovieById(params.id);

  if (!movie) {
    return {
      title: 'Movie Not Found',
    };
  }

  return {
    title: movie.title,
    description: movie.summary,
    openGraph: {
      title: movie.title,
      description: movie.summary,
      type: 'video.movie',
      images: [
        {
          url: movie.posterUrl,
          width: 1200,
          height: 630,
          alt: movie.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: movie.title,
      description: movie.summary,
      images: [movie.posterUrl],
    },
  };
}

export default async function MovieDetailPage({ params }: Props) {
  const movie = getMovieById(params.id);

  if (!movie) {
    notFound();
  }

  const recommendations = getRecommendedMovies(movie.id);

  return (
    <div className="container mx-auto py-8">
      <MovieHero movie={movie} />
      <MovieMetadata movie={movie} />
      <RecommendedMovies movies={recommendations} />
    </div>
  );
}

// Generate static params for popular movies
export async function generateStaticParams() {
  const { getTopMovies } = await import('@/lib/mock-data');
  const movies = getTopMovies();
  return movies.map((movie) => ({ id: movie.id }));
}
```

**Movie Detail Loading State** (`app/movie/[id]/loading.tsx`):
```typescript
export default function MovieDetailLoading() {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Poster skeleton */}
        <div className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
        {/* Metadata skeleton */}
        <div className="space-y-4">
          <div className="h-12 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
          </div>
        </div>
      </div>
      {/* Recommendations skeleton */}
      <div className="h-8 w-64 bg-muted animate-pulse rounded mb-4" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <MovieCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
```

**Movie Detail Error State** (`app/movie/[id]/error.tsx`):
```typescript
'use client';

export default function MovieDetailError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center">
        <div className="text-6xl mb-4">🎬</div>
        <h2 className="text-2xl font-bold mb-2">Failed to Load Movie</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {error.message || "Something went wrong loading this movie."}
        </p>
        <div className="flex gap-4">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

**Movie Detail Not Found** (`app/movie/[id]/not-found.tsx`):
```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MovieNotFound() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center min-h-[600px] text-center">
        <div className="text-9xl mb-4">🎭</div>
        <h1 className="text-4xl font-bold mb-2">Movie Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md text-lg">
          This movie seems to have left the theater. It might not exist or has been removed.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/">Browse Movies</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/search">Search Movies</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Intercepting Routes & Modal Pattern

### How It Works

**Navigation from Homepage → Movie Card Click**:
1. User clicks movie card on homepage (`/`)
2. Next.js intercepts the route and renders `@modal/(..)movie/[id]/page.tsx`
3. Modal displays over the homepage (Netflix-style)
4. URL updates to `/movie/123` without full page navigation
5. User can close modal with ESC or clicking outside → returns to `/`

**Direct Navigation → Full Page**:
1. User visits `/movie/123` directly (URL bar, bookmark, refresh)
2. Next.js skips the intercepting route (not navigating from `/`)
3. Renders full page from `app/movie/[id]/page.tsx`
4. User sees complete detail view

**Modal Component** (`app/@modal/(..)movie/[id]/page.tsx`):
```typescript
'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { MovieModalContent } from '@/components/movie/movie-modal-content';
import { getMovieById } from '@/lib/mock-data';
import { X } from 'lucide-react';

export default function MovieModal({ params }: { params: { id: string } }) {
  const router = useRouter();
  const movie = getMovieById(params.id);

  if (!movie) {
    router.back();
    return null;
  }

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 hover:bg-black/70 transition-colors">
          <X className="h-5 w-5 text-white" />
        </DialogClose>
        <MovieModalContent movie={movie} />
      </DialogContent>
    </Dialog>
  );
}
```

**Modal Content Component** (`components/movie/movie-modal-content.tsx`):
```typescript
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Play, Plus, ThumbsUp } from 'lucide-react';
import type { Movie } from '@/lib/mock-data';

export function MovieModalContent({ movie }: { movie: Movie }) {
  return (
    <div className="relative">
      {/* Hero section with poster */}
      <div className="relative aspect-video w-full">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 80vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Action buttons */}
        <div className="absolute bottom-8 left-8 flex gap-3">
          <Button size="lg" className="gap-2">
            <Play className="h-5 w-5" />
            Play
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Plus className="h-5 w-5" />
            My List
          </Button>
          <Button size="lg" variant="outline">
            <ThumbsUp className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Movie details */}
      <div className="p-8 space-y-4">
        <h2 className="text-3xl font-bold">{movie.title}</h2>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="text-green-500 font-semibold">
            {Math.round(movie.rating * 10)}% Match
          </span>
          <span>{movie.year}</span>
          <span>{movie.duration} min</span>
          <span className="border border-muted px-1">HD</span>
        </div>

        <p className="text-base leading-relaxed">{movie.summary}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Cast: </span>
            <span>{movie.cast.join(', ')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Genres: </span>
            <span>{movie.genres.join(', ')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Director: </span>
            <span>{movie.director}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Writers: </span>
            <span>{movie.writers.join(', ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Metadata & OG Images

### Dynamic Metadata Generation

Each movie detail page generates dynamic metadata and OpenGraph images using Next.js metadata API.

**Movie Page Metadata** (`app/movie/[id]/page.tsx`):
```typescript
import type { Metadata } from 'next';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const movie = getMovieById(params.id);

  if (!movie) {
    return { title: 'Movie Not Found' };
  }

  return {
    title: movie.title,
    description: movie.summary,
    openGraph: {
      title: movie.title,
      description: movie.summary,
      type: 'video.movie',
      releaseDate: movie.releaseDate,
      images: [
        {
          url: movie.posterUrl,
          width: 1200,
          height: 630,
          alt: movie.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: movie.title,
      description: movie.summary,
      images: [movie.posterUrl],
    },
  };
}
```

**Search Page Metadata** (`app/search/page.tsx`):
```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Movies',
  description: 'Search for your favorite movies',
  openGraph: {
    title: 'Search Movies | Movies Explorer',
    description: 'Search for your favorite movies',
  },
};
```

### Static OG Image

**Root OG Image** (`app/opengraph-image.tsx`):
```typescript
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Movies Explorer';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span>🎬</span>
          <span>Movies Explorer</span>
        </div>
        <p style={{ fontSize: 32, marginTop: 24, opacity: 0.8 }}>
          Discover Your Next Favorite Movie
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

## Mock Data Architecture

### Data Models (Based on API Client Schema)

All data models follow the schemas defined in `@jfontanez/api-client`:

**Mock Data File** (`lib/mock-data.ts`):
```typescript
import type {
  MoviesResponse,
  MovieDetail,
  GenresMoviesResponse,
  QueryParams,
} from '@jfontanez/api-client/rest/types';

// Helper to generate Picsum URLs
function getPosterUrl(id: number, width = 300, height = 450): string {
  return `https://picsum.photos/seed/${id}/${width}/${height}`;
}

// Mock Genres Data (matches GenresMoviesResponse schema)
const MOCK_GENRES_DATA: GenresMoviesResponse = {
  data: [
    {
      id: '1',
      title: 'Action',
      movies: [
        { id: '1' },
        { id: '2' },
        { id: '5' },
        { id: '8' },
        { id: '12' },
      ],
    },
    {
      id: '2',
      title: 'Comedy',
      movies: [
        { id: '3' },
        { id: '7' },
        { id: '11' },
        { id: '15' },
      ],
    },
    {
      id: '3',
      title: 'Drama',
      movies: [
        { id: '4' },
        { id: '6' },
        { id: '9' },
        { id: '13' },
      ],
    },
    {
      id: '4',
      title: 'Sci-Fi',
      movies: [
        { id: '1' },
        { id: '10' },
        { id: '14' },
      ],
    },
    {
      id: '5',
      title: 'Horror',
      movies: [
        { id: '16' },
        { id: '17' },
      ],
    },
    {
      id: '6',
      title: 'Romance',
      movies: [
        { id: '18' },
        { id: '19' },
      ],
    },
    {
      id: '7',
      title: 'Thriller',
      movies: [
        { id: '20' },
        { id: '21' },
      ],
    },
  ],
  totalPages: 1,
};

// Mock Movie Details (matches MovieDetail schema)
const MOCK_MOVIE_DETAILS: Record<string, MovieDetail> = {
  '1': {
    id: '1',
    title: 'The Stellar Voyage',
    duration: '142 min',
    directors: ['Christopher Nolan'],
    mainActors: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    datePublished: '2024-03-15',
    ratingValue: 8.5,
    bestRating: 10,
    worstRating: 1,
    genres: [
      { id: '1', title: 'Action' },
      { id: '4', title: 'Sci-Fi' },
    ],
    posterUrl: getPosterUrl(1, 300, 450),
    summary:
      'A group of astronauts embark on a dangerous mission to save humanity from an impending cosmic disaster. Through the vast emptiness of space, they must confront their own fears and the unknown.',
    rating: '8.5/10',
    writers: ['Jonathan Nolan', 'Lisa Joy'],
  },
  '2': {
    id: '2',
    title: 'Urban Justice',
    duration: '118 min',
    directors: ['Denis Villeneuve'],
    mainActors: ['Jake Gyllenhaal', 'Emily Blunt', 'Benicio Del Toro'],
    datePublished: '2023-11-20',
    ratingValue: 7.8,
    bestRating: 10,
    worstRating: 1,
    genres: [
      { id: '1', title: 'Action' },
      { id: '7', title: 'Thriller' },
    ],
    posterUrl: getPosterUrl(2, 300, 450),
    summary:
      'A detective races against time to solve a series of mysterious crimes that threaten to tear the city apart.',
    rating: '7.8/10',
    writers: ['Taylor Sheridan'],
  },
  // Add more movie details for IDs 3-21...
};

// Mock Movies List (matches MoviesResponse schema)
const MOCK_MOVIES_LIST: MoviesResponse['data'] = Object.values(
  MOCK_MOVIE_DETAILS
).map((movie) => ({
  id: movie.id,
  title: movie.title,
  posterUrl: movie.posterUrl,
  rating: movie.rating,
}));

// Query Functions (async to simulate API calls)

export async function getMovies(
  params?: QueryParams
): Promise<MoviesResponse> {
  let filteredMovies = [...MOCK_MOVIES_LIST];

  // Filter by search query
  if (params?.search) {
    const query = params.search.toLowerCase();
    filteredMovies = filteredMovies.filter((movie) =>
      movie.title.toLowerCase().includes(query)
    );
  }

  // Filter by genre
  if (params?.genre) {
    const genreMovies = MOCK_GENRES_DATA.data.find(
      (g) => g.id === params.genre
    );
    if (genreMovies) {
      const movieIds = genreMovies.movies.map((m) => m.id);
      filteredMovies = filteredMovies.filter((m) => movieIds.includes(m.id));
    }
  }

  // Pagination
  const page = params?.page || 1;
  const limit = params?.limit || 25;
  const startIndex = (page - 1) * limit;
  const paginatedMovies = filteredMovies.slice(startIndex, startIndex + limit);

  return {
    data: paginatedMovies,
    totalPages: Math.ceil(filteredMovies.length / limit),
  };
}

export async function getMovieById(id: string): Promise<MovieDetail | null> {
  return MOCK_MOVIE_DETAILS[id] || null;
}

export async function getGenresWithMovies(): Promise<GenresMoviesResponse> {
  return MOCK_GENRES_DATA;
}

export async function getGenreById(id: string) {
  return MOCK_GENRES_DATA.data.find((g) => g.id === id) || null;
}

// Helper to get all genres (for filters)
export function getAllGenres() {
  return MOCK_GENRES_DATA.data.map((g) => ({ id: g.id, title: g.title }));
}
```

## TanStack Query Integration

### Query Provider Setup

**Root Layout with Query Provider** (`app/layout.tsx`):
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Lexend } from 'next/font/google';
import { useState } from 'react';

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
});

export default function RootLayout({ children, modal, topMovies, genres }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
          },
        },
      })
  );

  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning className={lexend.variable}>
        <body className="font-sans antialiased">
          <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <Header />
              <main className="container mx-auto">
                {children}
                <Suspense fallback={<TopMoviesSkeleton />}>
                  {topMovies}
                </Suspense>
                <Suspense fallback={<GenresSkeleton />}>
                  {genres}
                </Suspense>
              </main>
              {modal}
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
```

### Query Hooks

**Movies Query Hooks** (`hooks/use-movies.ts`):
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { getMovies, getMovieById, getGenresWithMovies } from '@/lib/mock-data';
import type { QueryParams } from '@jfontanez/api-client/rest/types';

export function useMovies(params?: QueryParams) {
  return useQuery({
    queryKey: ['movies', params],
    queryFn: () => getMovies(params),
  });
}

export function useMovieById(id: string) {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => getMovieById(id),
    enabled: !!id,
  });
}

export function useGenresWithMovies() {
  return useQuery({
    queryKey: ['genres-with-movies'],
    queryFn: () => getGenresWithMovies(),
  });
}
```

### Prefetching in Server Components with HydrationBoundary

Server components prefetch data and pass it to client components via `HydrationBoundary`:

**Prefetch Pattern** (`app/@topMovies/page.tsx`):
```typescript
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getMovies } from '@/lib/mock-data';
import { TopMoviesClient } from '@/components/movie/top-movies-client';

export default async function TopMoviesSlot() {
  const queryClient = new QueryClient();

  // Prefetch data on server
  await queryClient.prefetchQuery({
    queryKey: ['movies', { page: 1, limit: 9 }],
    queryFn: () => getMovies({ page: 1, limit: 9 }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TopMoviesClient />
    </HydrationBoundary>
  );
}
```

**Client Component** (`components/movie/top-movies-client.tsx`):
```typescript
'use client';

import { useMovies } from '@/hooks/use-movies';
import { MovieCard } from '@/components/movie/movie-card';

export function TopMoviesClient() {
  // Data is already prefetched, so this will use cache
  const { data } = useMovies({ page: 1, limit: 9 });

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">Top Movies</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}
```

**Movie Detail Page with Prefetching** (`app/movie/[id]/page.tsx`):
```typescript
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { getMovieById } from '@/lib/mock-data';
import { MovieDetailClient } from '@/components/movie/movie-detail-client';
import type { Metadata } from 'next';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const movie = await getMovieById(params.id);

  if (!movie) {
    return { title: 'Movie Not Found' };
  }

  return {
    title: movie.title,
    description: movie.summary,
    openGraph: {
      title: movie.title,
      description: movie.summary,
      type: 'video.movie',
      releaseDate: movie.datePublished,
      images: [
        {
          url: movie.posterUrl || '',
          width: 1200,
          height: 630,
          alt: movie.title,
        },
      ],
    },
  };
}

export default async function MovieDetailPage({ params }: Props) {
  const queryClient = new QueryClient();

  // Prefetch movie details
  await queryClient.prefetchQuery({
    queryKey: ['movie', params.id],
    queryFn: () => getMovieById(params.id),
  });

  const movie = await getMovieById(params.id);

  if (!movie) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MovieDetailClient movieId={params.id} />
    </HydrationBoundary>
  );
}
```

### Usage in Client Components

Client components use TanStack Query hooks:

```typescript
// app/search/page.tsx
'use client';

import { useQueryState } from 'nuqs';
import { useMovies } from '@/hooks/use-movies';

export default function SearchPage() {
  const [query] = useQueryState('q', { defaultValue: '' });
  const [genreId] = useQueryState('genre');
  const [page] = useQueryState('page', { defaultValue: 1, parse: Number });

  const { data, isLoading, error } = useMovies({
    search: query,
    genre: genreId,
    page,
    limit: 12,
  });

  if (isLoading) {
    return <SearchResultsSkeleton />;
  }

  if (error) {
    throw error;
  }

  return (
    <div className="container mx-auto py-8">
      <SearchInput />
      <GenreFilter />
      <p className="text-muted-foreground mb-6">
        {data.data.length} movies found
      </p>
      <SearchResults movies={data.data} />
      <Pagination currentPage={page} totalPages={data.totalPages} />
    </div>
  );
}
```

### Picsum Image URLs

All movie posters use Picsum Photos with deterministic seeds:
- **Poster**: `https://picsum.photos/seed/{movieId}/300/450` (2:3 aspect ratio)
- **Thumbnail**: `https://picsum.photos/seed/{movieId}/200/300` (smaller variant)

Different widths/heights can be used for responsive images:
```typescript
// Example: responsive poster sizes
<Image
  src={`https://picsum.photos/seed/${movie.id}/600/900`}
  alt={movie.title}
  sizes="(max-width: 768px) 300px, 600px"
/>
```

## Component Architecture

### shadcn/ui Foundation

**All custom components are built on top of shadcn/ui primitives.** Install required components first:

```bash
# Required shadcn components to install
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add sheet
npx shadcn@latest add badge
npx shadcn@latest add skeleton
npx shadcn@latest add select
npx shadcn@latest add separator
npx shadcn@latest add scroll-area
```

### Component Composition Pattern

Every custom component should be composed from shadcn/ui primitives:

**Example - Movie Card** (built from `Card`):
```typescript
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link href={`/movie/${movie.id}`}>
      <Card className="overflow-hidden hover:scale-105 transition-transform">
        <div className="aspect-[2/3] relative">
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold truncate">{movie.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{movie.rating.toFixed(1)}</Badge>
            <span className="text-sm text-muted-foreground">{movie.year}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

**Example - Search Input** (built from `Input`):
```typescript
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useState, useEffect } from 'react';

export function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search movies..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
```

**Example - Genre Filter** (built from `Sheet` on mobile, `Select` on desktop):
```typescript
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { getAllGenres } from '@/lib/mock-data';

export function GenreFilter({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const genres = getAllGenres();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:w-auto md:px-4">
          <Filter className="h-4 w-4" />
          <span className="ml-2 hidden md:inline">Filter</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter by Genre</SheetTitle>
        </SheetHeader>
        <div className="grid gap-2 py-4">
          <Button
            variant={value === null ? 'default' : 'ghost'}
            className="justify-start"
            onClick={() => onChange(null)}
          >
            All Genres
          </Button>
          {genres.map((genre) => (
            <Button
              key={genre.id}
              variant={value === genre.id ? 'default' : 'ghost'}
              className="justify-start"
              onClick={() => onChange(genre.id)}
            >
              {genre.name}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

**Example - Movie Card Skeleton** (built from `Skeleton`):
```typescript
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function MovieCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[2/3]" />
      <CardContent className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}
```

**Example - Pagination** (built from `Button`):
```typescript
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

### Shared Components

```
components/
├── ui/                              # shadcn/ui primitives (installed via CLI)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── sheet.tsx
│   ├── badge.tsx
│   ├── skeleton.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── scroll-area.tsx
│   └── ...
│
├── layout/
│   ├── header.tsx                   # Built from shadcn Button, Input
│   ├── theme-toggle.tsx             # Built from shadcn Button
│   └── main-layout.tsx              # Wrapper component
│
├── movie/
│   ├── movie-card.tsx               # Built from shadcn Card, Badge
│   ├── movie-card-skeleton.tsx      # Built from shadcn Card, Skeleton
│   ├── movie-grid.tsx               # Grid container
│   ├── movie-carousel.tsx           # Built from shadcn ScrollArea
│   ├── movie-hero.tsx               # Built from shadcn Card, Badge
│   ├── movie-metadata.tsx           # Built from shadcn Separator, Badge
│   ├── movie-modal-content.tsx      # Built from shadcn Button, Badge
│   └── recommended-movies.tsx       # Composition of MovieCard
│
├── search/
│   ├── search-bar.tsx               # Built from shadcn Input
│   ├── search-input.tsx             # Built from shadcn Input
│   ├── genre-filter.tsx             # Built from shadcn Sheet, Button
│   ├── search-results.tsx           # Grid of MovieCard components
│   └── search-results-skeleton.tsx  # Grid of MovieCardSkeleton
│
├── genre/
│   ├── genre-section.tsx            # Built from shadcn ScrollArea, Badge
│   └── genre-section-skeleton.tsx   # Built from shadcn Skeleton
│
└── shared/
    ├── pagination.tsx               # Built from shadcn Button
    ├── loading-spinner.tsx          # Custom spinner or shadcn Skeleton
    └── empty-state.tsx              # Typography component
```

### Component Patterns

**Server/Client Boundary**:
```typescript
// Server Component (default)
async function MovieGrid() {
  const movies = await getMovies();
  return (
    <div className="grid grid-cols-3 gap-4">
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}

// Client Component (interactive)
'use client';

function MovieCard({ movie }: { movie: Movie }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={`/movie/${movie.id}`}
      onMouseEnter={() => setIsHovered(true)}
      className="transition-transform hover:scale-105"
    >
      {/* Card content */}
    </Link>
  );
}
```

## View Transitions

Enable smooth page transitions using Next.js 15's built-in View Transitions API support.

**Next.js Configuration** (`next.config.ts`):
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
```

**Root Layout** (`app/layout.tsx`):
```typescript
import { ViewTransitions } from 'next/view-transitions';
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
```

**Custom Transition Animations** (`app/globals.css`):
```css
/* Root page transition */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
  animation-timing-function: ease-in-out;
}

/* Smooth fade for page transitions */
::view-transition-old(root) {
  animation-name: fade-out;
}

::view-transition-new(root) {
  animation-name: fade-in;
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Movie card shared element transitions */
.movie-card {
  view-transition-name: var(--vt-name);
}

/* Poster image morphing between list and detail view */
.movie-poster {
  view-transition-name: var(--vt-poster);
}

/* Title transition */
.movie-title {
  view-transition-name: var(--vt-title);
}
```

**Usage in Components**:
```typescript
// components/movie/movie-card.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';

export function MovieCard({ movie }) {
  return (
    <Link
      href={`/movie/${movie.id}`}
      className="movie-card"
      style={{
        '--vt-name': `movie-${movie.id}`,
        '--vt-poster': `poster-${movie.id}`,
        '--vt-title': `title-${movie.id}`,
      } as React.CSSProperties}
    >
      <Image
        src={movie.posterUrl}
        alt={movie.title}
        className="movie-poster"
        width={300}
        height={450}
      />
      <h3 className="movie-title">{movie.title}</h3>
    </Link>
  );
}
```

**Transition Behavior**:
- Cross-fade between route changes (300ms)
- Shared element transitions for movie cards → detail page
- Poster image morphs from grid position to detail hero
- Title animates to detail page position
- Smooth opacity transitions for non-shared elements

**Browser Support**:
- Chrome/Edge 111+
- Safari 18+
- Firefox: Behind flag (fallback to instant navigation)
- Progressive enhancement: Works without JS

## State Management

### URL State (nuqs)

All search/filter state lives in URL for:
- Shareable links
- Browser back/forward navigation
- Server-side rendering compatibility

```typescript
// app/search/page.tsx
'use client';

import { useQueryState } from 'nuqs';

export default function SearchPage() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [genre, setGenre] = useQueryState('genre');
  const [page, setPage] = useQueryState('page', {
    defaultValue: 1,
    parse: Number,
  });

  // State automatically syncs with URL
}
```

### Client State

- **Theme**: next-themes provider (persisted to localStorage)
- **UI State**: Local component state (modals, hover effects)
- **Cache**: React Server Components cache (automatic)

## Data Fetching Strategy

### Server Components (RSC)

```typescript
// app/page.tsx
import { createClient } from '@jfontanez/api-client/rest';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default async function HomePage() {
  const client = await createClient(API_URL);

  // Parallel data fetching
  const [topMovies, genres] = await Promise.all([
    client.GET_MOVIES({ page: 1, limit: 9 }),
    client.GET_GENRES(),
  ]);

  return <HomeContent topMovies={topMovies} genres={genres} />;
}
```

### Client Components

```typescript
// hooks/use-movies.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@jfontanez/api-client/rest';

export function useMovies(params: MoviesRequest) {
  return useQuery({
    queryKey: ['movies', params],
    queryFn: async () => {
      const client = await createClient(API_URL);
      return client.GET_MOVIES(params);
    },
  });
}
```

## Pagination Strategy

### Server-Side Pagination (Default Page)

- Initial load: 9 top movies + 3 genre sections (5 movies each)
- Genre carousels: Horizontal scroll (no pagination)
- Top movies: Static (no "load more" on homepage)

### Client-Side Pagination (Search Page)

- Results per page: 12 movies
- Pagination UI: Previous/Next + page numbers
- State managed via URL (`?page=2`)
- Smooth scroll to top on page change

```typescript
// components/search/pagination.tsx
'use client';

function Pagination({ totalPages, currentPage }) {
  const [, setPage] = useQueryState('page');

  return (
    <div className="flex gap-2">
      <Button
        onClick={() => {
          setPage(currentPage - 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      {/* Page numbers */}
      <Button
        onClick={() => {
          setPage(currentPage + 1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
}
```

## Styling Architecture

### Typography

**Font**: Lexend from Google Fonts, optimized with Next.js font loading.

Lexend is a variable font designed for readability, making it perfect for a content-heavy application like a movie explorer.

**Setup** (`app/layout.tsx`):
```typescript
import { Lexend } from 'next/font/google';

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={lexend.variable}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

**Tailwind Integration** (`tailwind.config.ts`):
```typescript
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-lexend)', 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config;
```

**Benefits**:
- Automatic font optimization and subsetting by Next.js
- Self-hosted fonts (no external requests to Google Fonts)
- Font display swap prevents FOUT (Flash of Unstyled Text)
- CSS variable approach allows easy theme customization

### Responsive Design Strategy

**Breakpoints** (Tailwind defaults):
- `sm`: 640px (phones in landscape, small tablets)
- `md`: 768px (tablets)
- `lg`: 1024px (small desktops, large tablets)
- `xl`: 1280px (desktops)
- `2xl`: 1536px (large desktops)

**Grid Layouts**:
```typescript
// Mobile-first responsive grid
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
  {/* Movie cards */}
</div>

// Top movies section (default page)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Featured movies */}
</div>

// Search results
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* Search results */}
</div>

// Detail page layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Poster + Metadata */}
</div>
```

**Responsive Typography**:
```css
/* globals.css */
.movie-title {
  @apply text-sm sm:text-base md:text-lg font-semibold;
}

.hero-title {
  @apply text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold;
}

.body-text {
  @apply text-sm sm:text-base leading-relaxed;
}
```

**Mobile Considerations**:
- Touch-friendly targets (min 44x44px)
- Swipeable carousels for genre sections
- Responsive search bar (full-width on mobile)
- Bottom sheet for filters on mobile vs. modal on desktop
- Hamburger menu for navigation on mobile (if needed)

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        // ... shadcn color system
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
    },
  },
} satisfies Config;
```

### Dark Mode

Tailwind CSS has built-in dark mode support using the `class` strategy. Combined with `next-themes`, this provides seamless theme switching.

**Tailwind Configuration** (`tailwind.config.ts`):
```typescript
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class', // Tailwind's class-based dark mode
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: 'hsl(var(--primary))',
        // ... shadcn color system uses CSS variables
      },
      fontFamily: {
        sans: ['var(--font-lexend)', 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config;
```

**CSS Variables** (`app/globals.css`):
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    /* ... other light mode variables */
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    /* ... other dark mode variables */
  }
}
```

**Theme Toggle Component** (`components/layout/theme-toggle.tsx`):
```typescript
'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

**How It Works**:
1. `next-themes` adds/removes `class="dark"` on the `<html>` element
2. Tailwind's `dark:` variant applies styles when `.dark` class is present
3. CSS variables update automatically based on the theme
4. All shadcn components inherit the theme via CSS variables

**Usage in Components**:
```typescript
// Tailwind dark mode variants
<div className="bg-background text-foreground">
  <h1 className="text-primary dark:text-primary">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

## Performance Optimizations

1. **Image Optimization**: Next.js `<Image>` component with blur placeholders
2. **Code Splitting**: Automatic route-based splitting
3. **Static Generation**: Pre-render popular movie pages at build time
4. **Streaming**: React Suspense for progressive loading
5. **Caching**:
   - RSC cache for server components
   - TanStack Query cache for client fetches (1 min stale time, 5 min gc time)
   - Static assets cached by Next.js

## Error Handling

### Global Error Page (`app/error.tsx`)

```typescript
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="text-8xl mb-6">⚠️</div>
      <h1 className="text-3xl font-bold mb-2">Oops! Something Went Wrong</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        We encountered an unexpected error. Don't worry, our team has been notified.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset} size="lg">
          Try Again
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href="/">Go Home</Link>
        </Button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8 text-left max-w-2xl">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Error Details (dev only)
          </summary>
          <pre className="mt-4 p-4 bg-muted rounded text-xs overflow-auto">
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
```

### Global 404 Page (`app/not-found.tsx`)

A fun, whimsical 404 page that fits the movie theme:

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Film, Search, Home, Popcorn } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-gradient-to-b from-background to-muted/20">
      {/* Animated popcorn icon */}
      <div className="relative mb-8">
        <Popcorn className="w-32 h-32 text-primary animate-bounce" />
        <div className="absolute -top-4 -right-4 text-6xl animate-pulse">🎬</div>
      </div>

      <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
        404
      </h1>

      <h2 className="text-3xl font-bold mb-4">
        This Page Is Not In Our Database
      </h2>

      <p className="text-muted-foreground mb-2 max-w-md text-lg">
        Looks like this page took an unscheduled intermission!
      </p>

      <p className="text-muted-foreground mb-8 max-w-md italic">
        "I've got a feeling we're not in Kansas anymore..." - Dorothy
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Button asChild size="lg" className="gap-2">
          <Link href="/">
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </Button>
        <Button variant="outline" asChild size="lg" className="gap-2">
          <Link href="/search">
            <Search className="w-5 h-5" />
            Search Movies
          </Link>
        </Button>
      </div>

      {/* Decorative film strip */}
      <div className="flex gap-2 opacity-50">
        <Film className="w-6 h-6" />
        <Film className="w-6 h-6" />
        <Film className="w-6 h-6" />
      </div>
    </div>
  );
}
```

### Error Handling Strategy

1. **Route-Level Errors**: Each route has its own `error.tsx` for scoped error handling
2. **Global Errors**: `app/error.tsx` catches unhandled errors across the app
3. **Not Found**: Route-specific `not-found.tsx` for 404s (e.g., movie not found)
4. **Global 404**: `app/not-found.tsx` for unknown routes with whimsical design
5. **API Errors**: Handled by error boundaries, with retry functionality
6. **Loading States**: Skeleton screens prevent error-like blank states

## Accessibility

- Semantic HTML (`<main>`, `<nav>`, `<article>`)
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus management for modals/sheets
- Skip-to-content link
- Color contrast ratios (WCAG AA)
- Screen reader announcements for dynamic content

## File Structure

```
apps/webapp/
├── app/
│   ├── layout.tsx                    # Root layout with ViewTransitions + ThemeProvider + Metadata
│   ├── page.tsx                      # Default page root
│   ├── not-found.tsx                 # Global 404 (whimsical movie theme)
│   ├── error.tsx                     # Global error boundary
│   ├── globals.css                   # Global styles + view transitions CSS
│   ├── opengraph-image.tsx           # Static OG image generator
│   │
│   ├── @topMovies/                   # Parallel route - Top movies section
│   │   ├── page.tsx                  # Top movies data fetching (mock)
│   │   ├── loading.tsx               # Top movies skeleton
│   │   └── error.tsx                 # Top movies error state
│   │
│   ├── @genres/                      # Parallel route - Genre sections
│   │   ├── page.tsx                  # Genres data fetching (mock)
│   │   ├── loading.tsx               # Genres skeleton
│   │   └── error.tsx                 # Genres error state
│   │
│   ├── @modal/                       # Parallel route - Intercepted modals
│   │   ├── default.tsx               # Return null when no modal
│   │   └── (..)movie/                # Intercept movie routes
│   │       └── [id]/
│   │           └── page.tsx          # Netflix-style modal (client component)
│   │
│   ├── search/                       # Search page
│   │   ├── page.tsx                  # Search with nuqs (client component)
│   │   ├── loading.tsx               # Search loading state
│   │   └── error.tsx                 # Search error state
│   │
│   └── movie/
│       └── [id]/                     # Movie detail page
│           ├── page.tsx              # Movie detail (RSC) + generateMetadata
│           ├── loading.tsx           # Movie detail skeleton
│           ├── error.tsx             # Movie detail error
│           └── not-found.tsx         # Movie-specific 404
│
├── components/
│   ├── ui/                           # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx                # Dialog for modal
│   │   ├── sheet.tsx
│   │   └── ...
│   │
│   ├── layout/
│   │   ├── header.tsx                # Persistent header with search
│   │   ├── theme-toggle.tsx          # Light/dark mode toggle
│   │   └── main-layout.tsx           # Root layout wrapper
│   │
│   ├── movie/
│   │   ├── movie-card.tsx            # Reusable movie card (with view transitions)
│   │   ├── movie-card-skeleton.tsx   # Loading skeleton
│   │   ├── movie-grid.tsx            # Responsive grid layout
│   │   ├── movie-carousel.tsx        # Horizontal scroll container
│   │   ├── movie-hero.tsx            # Detail page hero section
│   │   ├── movie-metadata.tsx        # Detail page metadata
│   │   ├── movie-modal-content.tsx   # Netflix-style modal content
│   │   └── recommended-movies.tsx    # Recommendations section
│   │
│   ├── search/
│   │   ├── search-bar.tsx            # Debounced search input
│   │   ├── search-input.tsx          # Search input component (nuqs)
│   │   ├── genre-filter.tsx          # Genre filter sheet/modal (nuqs)
│   │   ├── search-results.tsx        # Results grid
│   │   └── search-results-skeleton.tsx
│   │
│   ├── genre/
│   │   ├── genre-section.tsx         # Genre carousel section
│   │   └── genre-section-skeleton.tsx
│   │
│   └── shared/
│       ├── pagination.tsx            # Page navigation (nuqs)
│       ├── loading-spinner.tsx
│       ├── empty-state.tsx
│       └── skeleton-components.tsx   # Reusable skeletons
│
├── lib/
│   ├── mock-data.ts                  # Mock movies, genres, and helper functions
│   └── utils.ts                      # cn() and helper functions
│
├── public/
│   └── (generated og-image.png)      # Generated by opengraph-image.tsx
│
├── next.config.ts                    # Next.js config with viewTransition
├── tailwind.config.ts                # Tailwind config
└── tsconfig.json
```

