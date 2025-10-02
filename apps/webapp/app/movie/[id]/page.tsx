import { notFound } from 'next/navigation';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getMovieById } from '@/lib/mock-data';
import { MovieModalContent } from '@/components/movie/movie-modal-content';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieById(id);

  if (!movie) {
    return {
      title: 'Movie Not Found',
    };
  }

  return {
    title: `${movie.title} - Movies Explorer`,
    description: movie.summary,
    openGraph: {
      title: movie.title,
      description: movie.summary,
      images: movie.posterUrl ? [{ url: movie.posterUrl }] : [],
    },
  };
}

export default async function MoviePage({ params }: Props) {
  const queryClient = new QueryClient();
  const { id } = await params;

  const movie = await getMovieById(id);

  if (!movie) {
    notFound();
  }

  await queryClient.prefetchQuery({
    queryKey: ['movie', id],
    queryFn: () => getMovieById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen">
        <MovieModalContent movie={movie} />
      </div>
    </HydrationBoundary>
  );
}
