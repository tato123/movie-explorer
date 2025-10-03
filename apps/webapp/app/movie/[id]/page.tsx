"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMovieByIdOptions } from "@jfontanez/tanstack-query-client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { use } from "react";
import NotFound from "./not-found";
import GenreSection from "@/components/genre-section";

export default function Movie({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: movie, isLoading } = useQuery(
    getMovieByIdOptions({ params: { id } })
  );

  if (isLoading) {
    return <MovieSkeleton />;
  }

  if (!movie) {
    return <NotFound />;
  }

  return (
    <div className="p-8">
      <div className="flex gap-8 bg-muted/50 p-8 rounded-lg">
        {/* Movie details - Left side */}
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl font-bold">{movie.title}</h2>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="text-green-500 font-semibold">
              {Math.round(movie.ratingValue * 10)}% Match
            </span>
            <span>{movie.datePublished?.split("-")[0]}</span>
            <span>{movie.duration}</span>
            <Badge variant="outline">HD</Badge>
          </div>

          <p className="text-base leading-relaxed">{movie.summary}</p>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Cast: </span>
              <span>{movie.mainActors.join(", ")}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Genres: </span>
              <span>
                {movie.genres.map((g: { title: string }) => g.title).join(", ")}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Director: </span>
              <span>{movie.directors.join(", ")}</span>
            </div>
            {movie.writers && (
              <div>
                <span className="text-muted-foreground">Writers: </span>
                <span>{movie.writers.join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Poster image - Right side */}
        <div className="w-96 flex-shrink-0">
          {movie.posterUrl && (
            <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden">
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="384px"
              />
            </div>
          )}
        </div>
      </div>
      <div>
        <h1 className="text-3xl font-bold my-6">Similar movies</h1>
        {movie.genres.map((genre) => (
          <GenreSection key={genre.id} title={genre.title} />
        ))}
      </div>
    </div>
  );
}

function MovieSkeleton() {
  return (
    <div className="p-8">
      <div className="flex gap-8">
        {/* Details skeleton - Left side */}
        <div className="flex-1 space-y-6">
          <Skeleton className="h-12 w-3/4" />

          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-12" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>

        {/* Poster skeleton - Right side */}
        <div className="w-96 flex-shrink-0">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
