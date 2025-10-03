"use client";

import { MovieCard } from "@/components/movie-card";
import { getMoviesOptions } from "@jfontanez/tanstack-query-client";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function GenreSection({ title }: { title: string }) {
  const { data } = useQuery(
    getMoviesOptions({ queryParams: { genre: title, limit: 20 } })
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
        <a
          href={`/search?genre=${title}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Explore All
          <ChevronRight className="h-4 w-4" />
        </a>
      </div>
      <div className="relative">
        <div className="flex gap-4 justify-center overflow-hidden">
          {data?.data.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-[200px]">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
