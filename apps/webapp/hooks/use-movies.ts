'use client';

import { useQuery } from '@tanstack/react-query';
import { getMovies, getMovieById, getGenresWithMovies } from '@/lib/mock-data';
import type { QueryParams } from '@jfontanez/api-client/rest';

export function useMovies(params?: QueryParams) {
  return useQuery({
    queryKey: ['movies', params],
    queryFn: () => getMovies(params),
  });
}

export function useMovieById(id: string) {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => getMovieById(id),
    enabled: !!id,
  });
}

export function useGenresWithMovies() {
  return useQuery({
    queryKey: ['genres-with-movies'],
    queryFn: () => getGenresWithMovies(),
  });
}
