"use client";

import { MovieCard } from "@/components/movie/movie-card";
import { getMoviesOptions } from "@jfontanez/tanstack-query-client";
import { useQuery } from "@tanstack/react-query";
import Loading from "./loading";

export default function Page() {
  const { data, isLoading } = useQuery(getMoviesOptions({}));

  return (
    <div className="px-8 py-12">
      <h2 className="text-3xl font-bold mb-8 tracking-tight">
        Your Top 3 picks
      </h2>
      <div className="grid grid-cols-3 gap-6">
        {isLoading && <Loading />}
        {data?.data
          .filter((x) => !!x.posterUrl)
          .slice(0, 3)
          .map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              size="lg"
              variant="outline"
            />
          ))}
      </div>
    </div>
  );
}
