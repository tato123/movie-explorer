'use client';

import { Button } from '@/components/ui/button';

export default function GenresError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="py-8">
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Failed to load genres
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={reset} variant="outline">
          Try Again
        </Button>
      </div>
    </section>
  );
}
