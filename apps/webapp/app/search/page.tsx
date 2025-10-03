"use client";

import {
  getGenreMoviesOptions,
  getMoviesOptions,
} from "@jfontanez/tanstack-query-client";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { unstable_ViewTransition as ViewTransition } from "react";
import { LoopContent } from "@/components/loop-content";
import { Pagination } from "@/components/pagination";
import { MovieSearchResult } from "@/app/search/_components/movie-search-result";
import { useEffect, Suspense } from "react";

export default function Page() {
  return (
    <ViewTransition name="main-content">
      <main>
        <div className="px-8 py-12 space-y-8">
          <Suspense fallback={<div>Loading...</div>}>
            <PageContent />
          </Suspense>
        </div>
      </main>
    </ViewTransition>
  );
}

function PageContent() {
  const [query] = useQueryState("q", parseAsString.withDefault(""));
  const [genre] = useQueryState("genre", parseAsString.withDefault(""));

  const showGenresList = !query && !genre;

  return showGenresList ? <GenresList /> : <ResultsList />;
}

function ResultsList() {
  const [search] = useQueryState("q", parseAsString.withDefault(""));
  const [genre] = useQueryState("genre", parseAsString.withDefault(""));
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(25));
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, genre]);

  const { data, isLoading } = useQuery(
    getMoviesOptions({ queryParams: { search, genre, page, limit } })
  );

  const movies = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Fetch the last page to get accurate total count
  const { data: lastPageData } = useQuery(
    getMoviesOptions({
      queryParams: { search, genre, page: totalPages, limit },
    })
  );

  // Ensure that we have an accurate count and aren't just guessing
  // Note: normally pagination apis provide a totalCount to avoid needing this
  // since it creates an extra network hop 🤷‍♂️
  const totalCount = lastPageData
    ? (totalPages - 1) * limit + lastPageData.data.length
    : totalPages * limit;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Loading results...</div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No results found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Titles Found - {totalCount}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {totalPages} {totalPages === 1 ? "page" : "pages"}
          </p>
        </div>
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {movies.map((movie) => (
          <MovieSearchResult key={movie.id} id={movie.id} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center pt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

function GenresList() {
  const { data, isSuccess, isLoading } = useQuery(getGenreMoviesOptions({}));

  // value is already cached in @tanstack/react-query so its safe
  // to treat this as a computed value as it returns the same reference
  const genres = data?.data ?? [];

  const [_genre, setGenre] = useQueryState(
    "genre",
    parseAsString.withDefault("")
  );

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
