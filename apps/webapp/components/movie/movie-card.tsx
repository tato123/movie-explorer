import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const moviecardVariants = cva("", {
  variants: {
    variant: {
      default: "",
      outline:
        "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground w-full  rounded-lg p-2",
    },
    size: {
      default: "",
      lg: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface MovieCardProps {
  movie: {
    id: string;
    title: string;
    posterUrl?: string;
    rating?: string;
  };
}

export function MovieCard({
  movie,
  className,
  variant,
  size,
}: React.ComponentProps<"div"> &
  MovieCardProps &
  VariantProps<typeof moviecardVariants>) {
  return (
    <div
      className={cn(
        "h-full max-h-full space-y-2",
        moviecardVariants({ variant })
      )}
    >
      <Link
        href={`/movie/${movie.id}`}
        className={cn("movie-card group block", className)}
      >
        <div className="relative overflow-hidden rounded-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary/20">
          <div
            className={cn(
              "aspect-[2/3] relative w-full h-full",
              size === "lg" && "max-h-[400px]",
              variant === "outline" && "bg-muted"
            )}
          >
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className={cn(
                  "object-contain movie-poster transition-opacity group-hover:opacity-75 h-full w-full aspect-[2/3]"
                )}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <Star className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>
      </Link>

      {/* Title below card */}
      <h3 className="font-semibold text-lg line-clamp-2 movie-title">
        {movie.title}
      </h3>

      {/* Rating below title */}
      {movie.rating && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="text-sm">{movie.rating.split("/")[0]}</span>
        </div>
      )}
    </div>
  );
}
