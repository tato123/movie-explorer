"use client";

import { useGenresWithMovies } from "@/hooks/use-movies";
import { GenreSection } from "./_components/genre-section";

export default function Page() {
  const { data } = useGenresWithMovies();

  if (!data) {
    return null;
  }

  return (
    <section className="px-8 py-12 space-y-16">
      {data.data.slice(0, 3).map((genre: { id: string; title: string }) => (
        <GenreSection key={genre.id} genre={genre} />
      ))}
    </section>
  );
}
