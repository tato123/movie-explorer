import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Plus, ThumbsUp } from 'lucide-react';
import type { MovieDetail } from '@jfontanez/api-client/rest';

export function MovieModalContent({ movie }: { movie: MovieDetail }) {
  return (
    <div className="relative">
      {/* Hero section with poster */}
      <div className="relative aspect-video w-full">
        {movie.posterUrl && (
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Action buttons */}
        <div className="absolute bottom-8 left-8 flex gap-3">
          <Button size="lg" className="gap-2">
            <Play className="h-5 w-5" />
            Play
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Plus className="h-5 w-5" />
            My List
          </Button>
          <Button size="lg" variant="outline">
            <ThumbsUp className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Movie details */}
      <div className="p-8 space-y-4">
        <h2 className="text-3xl font-bold">{movie.title}</h2>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="text-green-500 font-semibold">
            {Math.round(movie.ratingValue * 10)}% Match
          </span>
          <span>{movie.datePublished?.split('-')[0]}</span>
          <span>{movie.duration}</span>
          <Badge variant="outline">HD</Badge>
        </div>

        <p className="text-base leading-relaxed">{movie.summary}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Cast: </span>
            <span>{movie.mainActors.join(', ')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Genres: </span>
            <span>{movie.genres.map((g: { title: string }) => g.title).join(', ')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Director: </span>
            <span>{movie.directors.join(', ')}</span>
          </div>
          {movie.writers && (
            <div>
              <span className="text-muted-foreground">Writers: </span>
              <span>{movie.writers.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
