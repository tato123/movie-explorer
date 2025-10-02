import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const moviecardVariants = cva("", {
  variants: {
    variant: {
      default: "",

      outline:
        "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
    },
    size: {
      default: "",
      lg: "w-[33%]",
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
}: React.ComponentProps<"div"> &
  MovieCardProps &
  VariantProps<typeof moviecardVariants>) {
  return (
    <div className="">
      <Link
        href={`/movie/${movie.id}`}
        className={cn(
          "movie-card group block",
          moviecardVariants({ variant }),
          className
        )}
        style={
          {
            "--vt-name": `movie-${movie.id}`,
            "--vt-poster": `poster-${movie.id}`,
            "--vt-title": `title-${movie.id}`,
          } as React.CSSProperties
        }
      >
        <div className="relative overflow-hidden rounded-lg bg-muted transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary/20">
          <div className="aspect-[2/3] relative">
            {movie.posterUrl ? (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover movie-poster transition-opacity group-hover:opacity-75"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <Star className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />

            {/* Rating badge */}
            {movie.rating && (
              <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Badge className="bg-black/70 backdrop-blur-sm border-0 text-yellow-400">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400" />
                  {movie.rating.split("/")[0]}
                </Badge>
              </div>
            )}

            {/* Title on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full transition-transform group-hover:translate-y-0">
              <h3 className="font-semibold text-white text-sm line-clamp-2 movie-title drop-shadow-lg">
                {movie.title}
              </h3>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
