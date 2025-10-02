import { MovieCardSkeleton } from '@/components/movie/movie-card-skeleton';

export default function GenresLoading() {
  return (
    <section className="py-8 space-y-12">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <div className="h-8 w-64 bg-muted animate-pulse rounded mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="w-[200px] flex-shrink-0">
                <MovieCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
