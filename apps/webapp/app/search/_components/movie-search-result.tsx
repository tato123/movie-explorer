"use client";

import { getMovieByIdOptions } from "@jfontanez/tanstack-query-client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Film } from "lucide-react";
import { useState } from "react";

interface MovieSearchResultProps {
  id: string;
}

export function MovieSearchResult({ id }: MovieSearchResultProps) {
  const {
    data: movie,
    isLoading,
    isError,
    error,
  } = useQuery({
    ...getMovieByIdOptions({ params: { id } }),
    retry: 2,
    retryDelay: 1000,
  });
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return <MovieSearchResultSkeleton />;
  }

  if (isError) {
    console.error(`Failed to load movie ${id}:`, error);
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

  if (!movie) {
    return <MovieSearchResultSkeleton />;
  }

  const showPlaceholder =
    !movie.posterUrl || movie.posterUrl.trim() === "" || imageError;

  return (
    <Link
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
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Film className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="space-y-0.5">
        <h3 className="font-medium text-xs line-clamp-2 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
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
    </Link>
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
