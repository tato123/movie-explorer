import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { getGenresWithMovies, getMovies } from "@/lib/mock-data";

export default async function GenresSlot({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  // Prefetch genres data
  const genresData = await getGenresWithMovies();
  await queryClient.prefetchQuery({
    queryKey: ["genres-with-movies"],
    queryFn: () => getGenresWithMovies(),
  });

  // Prefetch movie details for first few genres
  for (const genre of genresData.data.slice(0, 3)) {
    await queryClient.prefetchQuery({
      queryKey: ["movies", { genre: genre.id, limit: 10 }],
      queryFn: () => getMovies({ genre: genre.id, limit: 10 }),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
