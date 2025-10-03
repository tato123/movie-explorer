import { Skeleton } from '@/components/ui/skeleton';
import { MovieCardSkeleton } from '@/components/movie/movie-card-skeleton';
import { LoopContent } from '@/components/loop-content';

export default function Loading() {
  return (
    <div className="container py-8 space-y-8">
      {/* Search header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-48" />
        </div>
      </div>

      {/* Results skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <LoopContent count={10}>
            {(i) => <MovieCardSkeleton key={i} />}
          </LoopContent>
        </div>
      </div>
    </div>
  );
}
