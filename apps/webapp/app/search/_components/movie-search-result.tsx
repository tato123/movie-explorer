"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatIso8601Duration } from "@/lib/utils";
import { getMovieByIdOptions } from "@jfontanez/tanstack-query-client";
import { useQuery } from "@tanstack/react-query";
import { Film } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

export function MovieSearchResult({ id }: { id: string }) {
  const {
    data: movie,
    isLoading,
    isError,
  } = useQuery({
    ...getMovieByIdOptions({ params: { id } }),
    retry: 2,
    retryDelay: 1000,
  });
  const [imageError, setImageError] = useState(false);

  const humanReadableDuration = useMemo(
    () => formatIso8601Duration(movie?.duration),
    [movie?.duration]
  );

  if (isLoading) {
    return <MovieSearchResultSkeleton />;
  }

  if (isError) {
    return <MovieLoadError id={id} />;
  }

  if (!movie) {
    return <MovieSearchResultSkeleton />;
  }

  const showPlaceholder =
    !movie.posterUrl || movie.posterUrl.trim() === "" || imageError;

  return (
    <a
      href={`/movie/${movie.id}`}
      className="group block space-y-1 cursor-pointer"
    >
      <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-muted">
        {!showPlaceholder && movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="20vw"
            onError={(e) => {
              e.preventDefault();
              setImageError(true);
            }}
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Film className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        <h3 className="font-medium text-md line-clamp-2 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        {humanReadableDuration && (
          <div className="text-sm text-muted-foreground">
            {humanReadableDuration}
          </div>
        )}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {movie.ratingValue !== undefined && movie.ratingValue != null && (
            <span className="text-green-500 font-semibold">
              {movie.ratingValue}
            </span>
          )}
          {movie.datePublished && (
            <span>{movie.datePublished.split("-")[0]}</span>
          )}
        </div>
      </div>
    </a>
  );
}

function MovieLoadError({ id }: { id: string }) {
  return (
    <div className="block space-y-1 opacity-50">
      <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-muted">
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
          <Film className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>
      <div className="space-y-0.5">
        <h3 className="font-medium text-xs line-clamp-2 text-muted-foreground">
          Unable to load movie
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>ID: {id}</span>
        </div>
      </div>
    </div>
  );
}

function MovieSearchResultSkeleton() {
  return (
    <div className="space-y-1">
      <Skeleton className="aspect-[2/3] w-full rounded-md" />
      <div className="space-y-0.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-2.5 w-12" />
      </div>
    </div>
  );
}
