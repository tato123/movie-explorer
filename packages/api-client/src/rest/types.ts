import { z } from "zod";
import {
  PAGINATION_REQUEST,
  GENRES_MOVIES_REQUEST,
  MOVIES_REQUEST,
  MOVIE_BY_ID_REQUEST,
  MOVIE_TITLES_REQUEST,
  MOVIE_GENRE_STATS_REQUEST,
  AUTH_TOKEN_RESPONSE,
  HEALTHCHECK_RESPONSE,
  GENRES_MOVIES_RESPONSE,
  MOVIES_RESPONSE,
  MOVIE_BY_ID_RESPONSE,
  MOVIE_TITLES_RESPONSE,
  MOVIE_GENRE_STATS_RESPONSE,
} from "./schema";

// Request Types
export type PaginationOptions = z.infer<typeof PAGINATION_REQUEST>;
export type GenresMoviesRequest = z.infer<typeof GENRES_MOVIES_REQUEST>;
export type MoviesRequest = z.infer<typeof MOVIES_REQUEST>;
export type MovieByIdRequest = z.infer<typeof MOVIE_BY_ID_REQUEST>;
export type MovieTitlesRequest = z.infer<typeof MOVIE_TITLES_REQUEST>;
export type MovieGenreStatsRequest = z.infer<typeof MOVIE_GENRE_STATS_REQUEST>;

// Query Params (for client usage)
export type QueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  [key: string]: string | number | undefined;
};

// Response Types
export type AuthTokenResponse = z.infer<typeof AUTH_TOKEN_RESPONSE>;
export type HealthcheckResponse = z.infer<typeof HEALTHCHECK_RESPONSE>;
export type GenresMoviesResponse = z.infer<typeof GENRES_MOVIES_RESPONSE>;
export type MoviesResponse = z.infer<typeof MOVIES_RESPONSE>;
export type MovieDetail = z.infer<typeof MOVIE_BY_ID_RESPONSE>;
export type MovieTitlesResponse = z.infer<typeof MOVIE_TITLES_RESPONSE>;
export type GenreStats = z.infer<typeof MOVIE_GENRE_STATS_RESPONSE>;
