import { getQueryClient } from "@/lib/get-query-client";
import { getMovies } from "@/lib/mock-data";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

interface Props {
  searchParams: {
    q?: string;
    genre?: string;
    page?: string;
  };
  children: React.ReactNode;
}

export default async function Layout({ searchParams, children }: Props) {
  const queryClient = getQueryClient();
  const params = await searchParams;

  const query = params.q || "";
  const genre = params.genre || "";
  const page = parseInt(params.page || "1", 10);

  // Prefetch search results
  void queryClient.prefetchQuery({
    queryKey: ["movies", { search: query, genre, page, limit: 25 }],
    queryFn: () => getMovies({ search: query, genre, page, limit: 25 }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
