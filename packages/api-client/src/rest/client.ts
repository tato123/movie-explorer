import { z } from "zod";
import {
  MOVIE_API_INVALID_SCHEMA,
  MOVIE_API_NOT_FOUND,
  MOVIE_API_SERVICE_UNAVAILABLE,
  MOVIE_API_UNAUTHORIZED,
  MOVIE_API_UNEXPECTED_ERROR,
} from "./errors";
import {
  AUTH_TOKEN_RESPONSE,
  GENRES_MOVIES_RESPONSE,
  HEALTHCHECK_RESPONSE,
  MOVIES_RESPONSE,
  MOVIE_BY_ID_RESPONSE,
  MOVIE_GENRE_STATS_RESPONSE,
  MOVIE_TITLES_RESPONSE,
} from "./schema";
import {
  AuthTokenResponse,
  GenreStats,
  GenresMoviesRequest,
  GenresMoviesResponse,
  HealthcheckResponse,
  MovieByIdRequest,
  MovieDetail,
  MovieGenreStatsRequest,
  MovieTitlesRequest,
  MovieTitlesResponse,
  MoviesRequest,
  MoviesResponse,
} from "./types";

// -----------------------------------
// Note to reviewers:
// The following utility functions are based off rememda and performs a more comprehensive nullish check.
// We include it here to avoid adding rememda as a dependency for just one function.
// The goal is to keep this library small and not include unnecessary dependencies.
// We use this to keep the code dry while retaining typescript type narrowing.
// -----------------------------------
const isNullish = <T>(
  argument: T | undefined | null
): argument is undefined | null => argument === null || argument === undefined;

const nonNullish = <T>(
  argument: T | undefined | null
): argument is NonNullable<T> => !isNullish(argument);

/**
 * Handles API response status codes and parses JSON response body.
 *
 * @throws {MOVIE_API_UNAUTHORIZED} When response status is 401 (invalid/expired token)
 * @throws {MOVIE_API_NOT_FOUND} When response status is 404 (resource not found)
 * @throws {MOVIE_API_SERVICE_UNAVAILABLE} When response status is 500+ (server error)
 * @throws {MOVIE_API_UNEXPECTED_ERROR} When response is not ok but doesn't match specific cases
 *
 * @internal
 * @private
 */
const handleResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 401) {
    throw new MOVIE_API_UNAUTHORIZED(response.status, response.statusText);
  }

  if (response.status === 404) {
    throw new MOVIE_API_NOT_FOUND(response.status, response.statusText);
  }

  if (response.status >= 500) {
    throw new MOVIE_API_SERVICE_UNAVAILABLE(
      response.status,
      response.statusText
    );
  }

  if (!response.ok) {
    throw new MOVIE_API_UNEXPECTED_ERROR(response.status, response.statusText);
  }

  return response.json();
};

/**
 * Validates and parses response data using a Zod schema.
 *
 * @throws {MOVIE_API_INVALID_SCHEMA} When validation fails, includes original ZodError details
 *
 * @internal
 * @private
 */
const parseResponse = <T>(schema: z.ZodType<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new MOVIE_API_INVALID_SCHEMA(error);
    }
    throw error;
  }
};

/**
 * Fetches an authentication token from the Movies API.
 *
 * This is the only endpoint that does not require authentication. The returned token
 * should be used as a Bearer token in the Authorization header for all other API requests.
 *
 * @public
 */
export const GET_AUTH_TOKEN =
  (BASE_URL: string) => async (): Promise<AuthTokenResponse> => {
    const response = await fetch(`${BASE_URL}/auth/token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await handleResponse(response);
    return parseResponse(AUTH_TOKEN_RESPONSE, data);
  };

/**
 * Checks the health status of the Movies API.
 *
 * Use this endpoint to verify API availability and authentication token validity.
 *
 * @public
 */
export const GET_HEALTHCHECK =
  (BASE_URL: string) =>
  (token: string) =>
  async (): Promise<HealthcheckResponse> => {
    const response = await fetch(`${BASE_URL}/healthcheck`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await handleResponse(response);
    return parseResponse(HEALTHCHECK_RESPONSE, data);
  };

/**
 * Fetches all movie IDs grouped by genre with pagination support.
 *
 * Returns a paginated list of genres, where each genre contains an array of movie IDs
 * belonging to that genre. Useful for building genre-based navigation or filtering.
 *
 * @throws {MOVIE_API_UNAUTHORIZED} If token is invalid or expired
 * @throws {MOVIE_API_SERVICE_UNAVAILABLE} If server error occurs
 * @throws {MOVIE_API_INVALID_SCHEMA} If response doesn't match expected schema
 *
 * @public
 */
export const GET_GENRES_MOVIES =
  (BASE_URL: string) =>
  (token: string) =>
  async (request: GenresMoviesRequest): Promise<GenresMoviesResponse> => {
    const params = new URLSearchParams();

    if (nonNullish(request?.queryParams?.page)) {
      params.append("page", request.queryParams.page.toString());
    }
    if (nonNullish(request?.queryParams?.limit)) {
      params.append("limit", request.queryParams.limit.toString());
    }

    const url = `${BASE_URL}/genres/movies${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    return parseResponse(GENRES_MOVIES_RESPONSE, data);
  };

/**
 * Fetches a paginated list of movies with optional search and filtering.
 *
 * This is the primary endpoint for retrieving movies with support for text search,
 * genre filtering, and pagination. Returns movie metadata including title, poster,
 * and rating information.
 *
 * @throws {MOVIE_API_UNAUTHORIZED} If token is invalid or expired
 * @throws {MOVIE_API_SERVICE_UNAVAILABLE} If server error occurs
 * @throws {MOVIE_API_INVALID_SCHEMA} If response doesn't match expected schema
 *
 * @public
 */
export const GET_MOVIES =
  (BASE_URL: string) =>
  (token: string) =>
  async (request: MoviesRequest): Promise<MoviesResponse> => {
    const params = new URLSearchParams();

    if (nonNullish(request?.queryParams?.page)) {
      params.append("page", request.queryParams.page.toString());
    }
    if (nonNullish(request?.queryParams?.limit)) {
      params.append("limit", request.queryParams.limit.toString());
    }
    if (nonNullish(request?.queryParams?.search)) {
      params.append("search", request.queryParams.search);
    }
    if (nonNullish(request?.queryParams?.genre)) {
      params.append("genre", request.queryParams.genre);
    }

    const url = `${BASE_URL}/movies${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    return parseResponse(MOVIES_RESPONSE, data);
  };

/**
 * Fetches complete details for a specific movie by its ID.
 *
 * Returns comprehensive movie information including metadata, cast, crew, ratings,
 * and associated genres. Use this for movie detail pages or when you need the full
 * movie object.
 *
 * @throws {MOVIE_API_UNAUTHORIZED} If token is invalid or expired
 * @throws {MOVIE_API_NOT_FOUND} If movie with given ID doesn't exist
 * @throws {MOVIE_API_SERVICE_UNAVAILABLE} If server error occurs
 * @throws {MOVIE_API_INVALID_SCHEMA} If response doesn't match expected schema
 *
 * @public
 */
export const GET_MOVIE_BY_ID =
  (BASE_URL: string) =>
  (token: string) =>
  async (request: MovieByIdRequest): Promise<MovieDetail> => {
    const response = await fetch(`${BASE_URL}/movies/${request.params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    return parseResponse(MOVIE_BY_ID_RESPONSE, data);
  };

/**
 * Fetches a paginated list of all movie IDs and titles.
 *
 * Returns a lightweight list containing only movie IDs and titles, useful for building
 * autocomplete, search suggestions, or navigation menus without fetching full movie details.
 *
 * @throws {MOVIE_API_UNAUTHORIZED} If token is invalid or expired
 * @throws {MOVIE_API_SERVICE_UNAVAILABLE} If server error occurs
 * @throws {MOVIE_API_INVALID_SCHEMA} If response doesn't match expected schema
 *
 * @public
 */
export const GET_MOVIES_TITLES =
  (BASE_URL: string) =>
  (token: string) =>
  async (request: MovieTitlesRequest): Promise<MovieTitlesResponse> => {
    const params = new URLSearchParams();

    if (nonNullish(request?.queryParams?.page)) {
      params.append("page", request.queryParams.page.toString());
    }
    if (nonNullish(request?.queryParams?.limit)) {
      params.append("limit", request.queryParams.limit.toString());
    }

    const url = `${BASE_URL}/movies/titles${params.toString() ? `?${params.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await handleResponse(response);
    return parseResponse(MOVIE_TITLES_RESPONSE, data);
  };

/**
 * Fetches statistics for a specific movie genre.
 *
 * Returns genre details including total movie count for the specified genre.
 *
 * @throws {MOVIE_API_UNAUTHORIZED} If token is invalid or expired
 * @throws {MOVIE_API_NOT_FOUND} If genre with given ID doesn't exist
 * @throws {MOVIE_API_SERVICE_UNAVAILABLE} If server error occurs
 * @throws {MOVIE_API_INVALID_SCHEMA} If response doesn't match expected schema
 *
 * @public
 */
export const GET_MOVIE_GENRE_STATS =
  (BASE_URL: string) =>
  (token: string) =>
  async (request: MovieGenreStatsRequest): Promise<GenreStats> => {
    const response = await fetch(
      `${BASE_URL}/movies/genres/${request.params.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await handleResponse(response);
    return parseResponse(MOVIE_GENRE_STATS_RESPONSE, data);
  };

/**
 * Creates an authenticated API client with all methods pre-configured.
 *
 * Automatically fetches an authentication token and returns a client object
 * with all API methods pre-bound to the base URL and token.
 *
 * @public
 */
export const createClient = async (BASE_URL: string) => {
  const { token } = await GET_AUTH_TOKEN(BASE_URL)();

  return {
    GET_HEALTHCHECK: GET_HEALTHCHECK(BASE_URL)(token),
    GET_GENRES_MOVIES: GET_GENRES_MOVIES(BASE_URL)(token),
    GET_MOVIES: GET_MOVIES(BASE_URL)(token),
    GET_MOVIE_BY_ID: GET_MOVIE_BY_ID(BASE_URL)(token),
    GET_MOVIES_TITLES: GET_MOVIES_TITLES(BASE_URL)(token),
    GET_MOVIE_GENRE_STATS: GET_MOVIE_GENRE_STATS(BASE_URL)(token),
  };
};
