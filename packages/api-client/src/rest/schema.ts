import { z } from "zod";

// Common Pagination Response Wrapper
const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    totalPages: z.number(),
  });

// Request Schemas

// Pagination Request
export const PAGINATION_REQUEST = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
});

// Genres Movies Request
export const GENRES_MOVIES_REQUEST = z.object({
  queryParams: PAGINATION_REQUEST.optional(),
});

// Movies Request
export const MOVIES_REQUEST = z.object({
  queryParams: z
    .object({
      page: z.number().optional(),
      limit: z.number().optional(),
      search: z.string().optional(),
      genre: z.string().optional(),
    })
    .optional(),
});

// Movie By ID Request
export const MOVIE_BY_ID_REQUEST = z.object({
  params: z.object({
    id: z.union([z.string(), z.number()]),
  }),
});

// Movie Titles Request
export const MOVIE_TITLES_REQUEST = z.object({
  queryParams: PAGINATION_REQUEST.optional(),
});

// Movie Genre Stats Request
export const MOVIE_GENRE_STATS_REQUEST = z.object({
  params: z.object({
    id: z.union([z.string(), z.number()]),
  }),
});

// Response Schemas

// Auth Token Response
export const AUTH_TOKEN_RESPONSE = z.object({
  token: z.string(),
});

// Healthcheck Response
export const HEALTHCHECK_RESPONSE = z.object({
  contentful: z.boolean(),
});

// Movie ID Schema (partial movie with just id)
const MovieIdSchema = z.object({
  id: z.string(),
});

// Genre with Movies Schema
const GenreWithMoviesSchema = z.object({
  id: z.string(),
  title: z.string(),
  movies: z.array(MovieIdSchema),
});

// Genres Movies Response
export const GENRES_MOVIES_RESPONSE = PaginatedResponseSchema(
  GenreWithMoviesSchema
);

// Movie List Item Schema (partial movie info for list view)
const MovieListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  posterUrl: z.string().optional(),
  rating: z.string().optional(),
});

// Movies Response
export const MOVIES_RESPONSE = PaginatedResponseSchema(MovieListItemSchema);

// Genre (without movies array)
const GenreSchema = z.object({
  id: z.string(),
  title: z.string(),
});

// Movie Detail Schema (full movie information)
const MovieDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.string().nullish(),
  directors: z.array(z.string()).nullish(),
  mainActors: z.array(z.string()).nullish(),
  datePublished: z.string().nullish(),
  ratingValue: z.number().nullish(),
  bestRating: z.number().nullish(),
  worstRating: z.number().nullish(),
  genres: z.array(GenreSchema).nullish(),
  posterUrl: z.string().nullish(),
  summary: z.string().nullish(),
  rating: z.string().nullish(),
  writers: z.array(z.string()).nullish(),
});

// Movie By ID Response
export const MOVIE_BY_ID_RESPONSE = MovieDetailSchema;

// Movie Title Schema (id and title only)
const MovieTitleSchema = z.object({
  id: z.string(),
  title: z.string(),
});

// Movie Titles Response
export const MOVIE_TITLES_RESPONSE = PaginatedResponseSchema(MovieTitleSchema);

// Genre Stats Response
export const MOVIE_GENRE_STATS_RESPONSE = z.object({
  id: z.string(),
  title: z.string(),
  totalMovies: z.number(),
});
