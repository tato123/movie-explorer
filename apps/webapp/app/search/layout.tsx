import { getQueryClient } from "@/lib/get-query-client";
import { getGenreMoviesOptions } from "@jfontanez/tanstack-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(getGenreMoviesOptions({}));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
