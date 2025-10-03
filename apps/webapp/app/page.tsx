"use client";

import { MovieCard } from "@/components/movie/movie-card";
import {
  getGenreMoviesOptions,
  getMoviesOptions,
} from "@jfontanez/tanstack-query-client";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { unstable_ViewTransition as ViewTransition } from "react";

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ViewTransition name="main-content">
        <main>
          <TopMovies />
          <Genres />
          {children}
        </main>
      </ViewTransition>
    </>
  );
}

// ---------------------------------------------------
// These sections are currently only used in the main page
// they have been colocated as one example of organizing component
// content
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
        <GenreSection key={genre.id} genre={genre} />
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

type GenreSectionProps = {
  genre: {
    id: string;
    title: string;
  };
};

function GenreSection({ genre }: GenreSectionProps) {
  const { data } = useQuery(
    getMoviesOptions({ queryParams: { genre: genre.title, limit: 20 } })
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold tracking-tight">{genre.title}</h3>
        <Link
          href={`/search?genre=${genre.title}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          prefetch={false}
        >
          Explore All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="relative">
        <div className="flex gap-4 justify-center overflow-hidden">
          {data?.data.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-[200px]">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
