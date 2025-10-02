"use client";

import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useMovies } from "@/hooks/use-movies";
import { MovieCard } from "@/components/movie/movie-card";
import { MovieCardSkeleton } from "@/components/movie/movie-card-skeleton";
import { Pagination } from "@/components/shared/pagination";

const GENRES = [
  { id: "1", title: "Action" },
  { id: "2", title: "Comedy" },
  { id: "3", title: "Drama" },
  { id: "4", title: "Sci-Fi" },
  { id: "5", title: "Horror" },
  { id: "6", title: "Romance" },
  { id: "7", title: "Thriller" },
];

export default function Page() {
  const [query, setQuery] = useQueryState("q", parseAsString.withDefault(""));
  const [genre, setGenre] = useQueryState(
    "genre",
    parseAsString.withDefault("")
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

  const { data, isLoading } = useMovies({
    search: query,
    genre,
    page,
    limit: 25,
  });

  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1); // Reset to first page on new search
  };

  const handleGenreChange = (value: string) => {
    setGenre(value === "all" ? "" : value);
    setPage(1); // Reset to first page on genre change
  };

  const totalPages = data?.totalPages || 0;
  const totalCount = data ? data.totalPages * 25 : 0;

  return (
    <div className="px-8 py-12 space-y-8">
      {/* Search header */}
      <div className="space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Search Movies</h1>
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-12 text-base bg-muted/50 border-border/50 focus:bg-background transition-colors"
            />
          </div>
          <Select value={genre || "all"} onValueChange={handleGenreChange}>
            <SelectTrigger className="w-full sm:w-56 h-12 bg-muted/50 border-border/50">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {GENRES.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {isLoading ? (
          <>
            <p className="text-sm text-muted-foreground">Loading results...</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          </>
        ) : data && data.data.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {totalCount} {totalCount === 1 ? "result" : "results"}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {data.data.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center pt-8">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground mb-4">
              No movies found matching your search.
            </p>
            {(query || genre) && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setQuery("");
                  setGenre("");
                  setPage(1);
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
