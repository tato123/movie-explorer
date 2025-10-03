import { getQueryClient } from "@/lib/get-query-client";
import { getMovieByIdOptions } from "@jfontanez/tanstack-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

export default async function MoviePage({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  const { id } = await params;

  void queryClient.prefetchQuery(
    getMovieByIdOptions({
      params: { id },
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>loading</div>}>
        <div className="min-h-screen">{children}</div>
      </Suspense>
    </HydrationBoundary>
  );
}
