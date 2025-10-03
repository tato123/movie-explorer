/**
 * Note to reviewer:
 *
 * This file was intentionally made more complex than necessary to demonstrate
 * the use of TanStack Query in a cross-platform (server + client) environment.
 * In a real-world scenario, you might simplify the authentication logic
 * and avoid redundant checks. This helper library assumes we don't know anything about
 * a store or context provider, and just provides a way to create query options in a pure
 * @tanstack/react-query way.
 *
 * Additionally, this library shows off advanced TypeScript usage to extract
 * request types from the API client functions, which, in a real-world scenario, we may be more
 * prone to define the types explicitly. However, this approach has the advantage of staying in
 * sync with the api-client package.
 */

import {
  isServer,
  QueryFunctionContext,
  queryOptions,
} from "@tanstack/react-query";
import {
  GET_GENRES_MOVIES,
  GET_MOVIES,
  GET_MOVIE_BY_ID,
  GET_MOVIES_TITLES,
  GET_MOVIE_GENRE_STATS,
  type AuthTokenResponse,
  GET_AUTH_TOKEN,
} from "@jfontanez/api-client";

// This is an example of an overly complex way to extract the request type from the client function
// this is done on purpose for the sake of this exercise.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RequestValue<T extends (...args: any) => any> = Parameters<
  ReturnType<ReturnType<T>>
>[0];

type OverrideOptions = Omit<
  Parameters<typeof queryOptions>[0],
  "queryKey" | "queryFn"
>;

const BASE_URL =
  (process?.env?.BASE_URL as string) ??
  "https://0kadddxyh3.execute-api.us-east-1.amazonaws.com";

export const getAuthTokenOptions = queryOptions({
  queryKey: ["authenticate"],
  queryFn: async () => {
    return GET_AUTH_TOKEN(BASE_URL)();
  },
});

const crossPlatformAuthentication = async (context: QueryFunctionContext) => {
  // On server side we don't store the token in the query cache
  if (!isServer) {
    const data = context.client.getQueryData<AuthTokenResponse>([
      "authenticate",
    ]);
    if (data && data.token) {
      return Promise.resolve(data.token);
    }
  }

  // Client-side: Fetch the auth token from the local API route
  return context.client.fetchQuery(getAuthTokenOptions).then((data) => {
    if (!data || !data.token) {
      throw new Error("No auth token found");
    }
    return data.token;
  });
};

export function getGenreMoviesOptions(
  request: RequestValue<typeof GET_GENRES_MOVIES>
) {
  return queryOptions({
    queryKey: ["genres-movies", request],
    queryFn: async (context: QueryFunctionContext) => {
      const token = await crossPlatformAuthentication(context);
      return GET_GENRES_MOVIES(BASE_URL)(token)(request);
    },
  });
}

export const getMoviesOptions = (request: RequestValue<typeof GET_MOVIES>) =>
  queryOptions({
    queryKey: ["movies", request],
    queryFn: async (context: QueryFunctionContext) => {
      const token = await crossPlatformAuthentication(context);
      return GET_MOVIES(BASE_URL)(token)(request);
    },
  });

export const getMovieByIdOptions = (
  request: RequestValue<typeof GET_MOVIE_BY_ID>
) =>
  queryOptions({
    queryKey: ["movie", request.params.id],
    queryFn: async (context: QueryFunctionContext) => {
      const token = await crossPlatformAuthentication(context);
      return GET_MOVIE_BY_ID(BASE_URL)(token)(request);
    },
    enabled: !!request.params.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const getMoviesTitlesOptions = (
  request: RequestValue<typeof GET_MOVIES_TITLES>
) =>
  queryOptions({
    queryKey: ["movies-titles", request],
    queryFn: async (context: QueryFunctionContext) => {
      const token = await crossPlatformAuthentication(context);
      return GET_MOVIES_TITLES(BASE_URL)(token)(request);
    },
  });

export const getMovieGenreStatsOptions = (
  request: RequestValue<typeof GET_MOVIE_GENRE_STATS>
) =>
  queryOptions({
    queryKey: ["movie-genre-stats", request.params.id],
    queryFn: async (context: QueryFunctionContext) => {
      const token = await crossPlatformAuthentication(context);
      return GET_MOVIE_GENRE_STATS(BASE_URL)(token)(request);
    },
    enabled: !!request.params.id,
  });
