'use client';

import { useMovies } from '@/hooks/use-movies';
import { MovieCard } from '@/components/movie/movie-card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

type GenreSectionProps = {
  genre: {
    id: string;
    title: string;
  };
};

export function GenreSection({ genre }: GenreSectionProps) {
  const { data } = useMovies({ genre: genre.id, limit: 10 });

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold tracking-tight">{genre.title}</h3>
        <Link
          href={`/search?genre=${genre.id}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Explore All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {data?.data.map((movie) => (
            <div key={movie.id} className="w-[180px] flex-shrink-0">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  );
}
