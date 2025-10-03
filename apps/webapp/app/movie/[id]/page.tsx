"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMovieByIdOptions } from "@jfontanez/tanstack-query-client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { use, useEffect, useMemo, useState } from "react";
import NotFound from "./not-found";
import GenreSection from "@/components/genre-section";
import { formatDuration } from "date-fns";
import { parse, toSeconds } from "iso8601-duration";
import { Film } from "lucide-react";

export default function Movie({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    data: movie,
    isLoading,
    isError,
  } = useQuery(getMovieByIdOptions({ params: { id } }));
  const [imageError, setImageError] = useState(false);

  // This is an  ISO 8601 duration returned by the api (PT1H30M)
  // this conversion makes it a little easier to read
  const humanReadableDuration = useMemo(() => {
    const defaultValue = movie?.duration ?? "";
    try {
      if (!movie?.duration) {
        return defaultValue;
      }
      const duration = parse(movie.duration);
      const totalSeconds = toSeconds(duration);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      return formatDuration(
        { hours, minutes },
        { format: ["hours", "minutes"], zero: false }
      );
    } catch {
      return defaultValue;
    }
  }, [movie?.duration]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return <MovieSkeleton />;
  }

  if (isError) {
    return <NotFound />;
  }

  if (!movie) {
    return <NotFound />;
  }

  return (
    <div className="p-8">
      <div className="flex gap-8 bg-muted/50 p-8 rounded-lg">
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl font-bold">{movie.title}</h2>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {movie.ratingValue !== undefined && (
              <span className="text-green-500 font-semibold">
                Rating {movie.ratingValue} <br />
              </span>
            )}
            {movie.datePublished && (
              <span>{movie.datePublished.split("-")[0]}</span>
            )}
            {humanReadableDuration && <span>{humanReadableDuration}</span>}
            <Badge variant="outline">HD</Badge>
          </div>

          <p className="text-base leading-relaxed">{movie.summary}</p>

          <div className="space-y-3 text-sm">
            {movie.mainActors && movie.mainActors.length > 0 && (
              <div>
                <span className="text-muted-foreground">Cast: </span>
                <span>{movie.mainActors.join(", ")}</span>
              </div>
            )}
            {movie.genres && movie.genres.length > 0 && (
              <div>
                <span className="text-muted-foreground">Genres: </span>
                <span>
                  {movie.genres
                    .map((g: { title: string }) => g.title)
                    .join(", ")}
                </span>
              </div>
            )}
            {movie.directors && movie.directors.length > 0 && (
              <div>
                <span className="text-muted-foreground">Director: </span>
                <span>{movie.directors.join(", ")}</span>
              </div>
            )}
            {movie.writers && movie.writers.length > 0 && (
              <div>
                <span className="text-muted-foreground">Writers: </span>
                <span>{movie.writers.join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        <div className="w-96 flex-shrink-0">
          <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-muted">
            {movie.posterUrl && !imageError ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="384px"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <Film className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </div>
      {movie.genres && movie.genres.length > 0 && (
        <div>
          <h1 className="text-3xl font-bold my-6">Similar movies</h1>
          {movie.genres.map((genre) => (
            <GenreSection key={genre.id} title={genre.title} />
          ))}
        </div>
      )}
    </div>
  );
}

function MovieSkeleton() {
  return (
    <div className="p-8">
      <div className="flex gap-8">
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
        <div className="w-96 flex-shrink-0">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
