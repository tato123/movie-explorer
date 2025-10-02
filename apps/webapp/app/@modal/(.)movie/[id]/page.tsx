'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { MovieModalContent } from '@/components/movie/movie-modal-content';
import { useMovieById } from '@/hooks/use-movies';

export default function MovieModal({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const { data: movie, isLoading } = useMovieById(unwrappedParams.id);

  if (isLoading) {
    return null;
  }

  if (!movie) {
    router.back();
    return null;
  }

  return (
    <Dialog open onOpenChange={() => router.back()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 hover:bg-black/70 transition-colors">
          <X className="h-5 w-5 text-white" />
        </DialogClose>
        <MovieModalContent movie={movie} />
      </DialogContent>
    </Dialog>
  );
}
