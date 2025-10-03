"use client";

import {
  getGenreMoviesOptions,
  getMoviesOptions,
} from "@jfontanez/tanstack-query-client";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { unstable_ViewTransition as ViewTransition } from "react";
import { LoopContent } from "@/components/loop-content";

export default function Page() {
  const [query] = useQueryState("q", parseAsString.withDefault(""));
  const [genre] = useQueryState("genre", parseAsString.withDefault(""));

  const showGenresList = !query && !genre;

  return (
    <ViewTransition name="main-content">
      <main>
        <div className="px-8 py-12 space-y-8">
          {showGenresList ? <GenresList /> : <ResultsList />}
        </div>
      </main>
    </ViewTransition>
  );
}

function ResultsList() {
  const [search] = useQueryState("q", parseAsString.withDefault(""));
  const [genre] = useQueryState("genre", parseAsString.withDefault(""));
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(25));
  const [page] = useQueryState("page", parseAsInteger.withDefault(1));

  const { data } = useQuery(
    getMoviesOptions({ queryParams: { search, genre, page, limit } })
  );
  const movies = data?.data ?? [];

  if (movies.length === 0) {
    return <div>No results found</div>;
  }

  return (
    <>
      {movies.map((movie) => (
        <div key={movie.id} className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold">{movie.title}</h2>
        </div>
      ))}
    </>
  );
}

function GenresList() {
  const { data, isSuccess, isLoading } = useQuery(getGenreMoviesOptions({}));

  // value is already cached in @tanstack/react-query so its safe
  // to treat this as a computed value as it returns the same reference
  const genres = data?.data ?? [];

  const [, setGenre] = useQueryState("genre", parseAsString.withDefault(""));

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Browse by Genre</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading && (
          <LoopContent count={4}>
            {(i) => (
              <div
                key={i}
                className="w-full h-32 rounded-lg bg-muted/50 animate-pulse"
              />
            )}
          </LoopContent>
        )}
        {isSuccess &&
          genres.map((genre, index) => (
            <div
              key={genre.id}
              className="opacity-0 translate-y-4 animate-fade-in-up"
              style={{
                animationDelay: `${index * 20}ms`,
                animationFillMode: "forwards",
              }}
            >
              <button
                onClick={() => setGenre(genre.title)}
                className="w-full h-32 rounded-lg bg-muted/50 hover:bg-muted transition-colors flex items-center justify-center text-lg font-medium cursor-pointer"
              >
                {genre.title}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
