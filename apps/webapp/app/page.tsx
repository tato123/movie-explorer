"use client";

import GenreSection from "@/components/genre-section";
import { MovieCard } from "@/components/movie-card";
import {
  getGenreMoviesOptions,
  getMoviesOptions,
} from "@jfontanez/tanstack-query-client";
import { useQuery } from "@tanstack/react-query";
import { unstable_ViewTransition as ViewTransition } from "react";

export default function Page() {
  return (
    <>
      <ViewTransition name="main-content">
        <main>
          <TopMovies />
          <Genres />
        </main>
      </ViewTransition>
    </>
  );
}

// ---------------------------------------------------
// These sections are currently only used in the main page
// they have been colocated as one example of organizing component
// content. In the @header folder I show another example
// of using a private folder using the nextjs underscore format
// that excludes it from routing
// ---------------------------------------------------

function Genres() {
  const { data } = useQuery(
    getGenreMoviesOptions({ queryParams: { limit: 3 } })
  );

  if (!data) {
    return null;
  }

  return (
    <div className="px-8 py-12 space-y-16">
      {data.data.map((genre: { id: string; title: string }) => (
        <GenreSection key={genre.id} title={genre.title} />
      ))}
    </div>
  );
}

function TopMovies() {
  const { data, isLoading } = useQuery(getMoviesOptions({}));

  return (
    <div className="relative flex flex-col w-full items-center justify-between mb-6">
      <h2 className="text-3xl font-bold mb-8 tracking-tight">
        Your Top 3 picks
      </h2>
      <div className="flex flex-row w-full h-full px-6 gap-3">
        {isLoading && <div>Loading...</div>}
        {data?.data
          .filter((x) => !!x.posterUrl)
          .slice(0, 3)
          .map((movie) => (
            <div key={movie.id} className="flex w-full">
              <MovieCard
                movie={movie}
                variant="outline"
                key={movie.id}
                size="lg"
              />
            </div>
          ))}
      </div>
    </div>
  );
}
