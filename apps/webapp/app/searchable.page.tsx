"use client";

import { useQueryState, parseAsBoolean } from "nuqs";
import { useEffect, useState } from "react";

/**
 * Shows how you can pass components as props to a page. Used when
 * you want to pass a server component into a client component or
 * another client component
 */

export default function SerachablePage({
  children,
  topMovies,
  genres,
  header,
}: {
  children: React.ReactNode;
  topMovies: React.ReactNode;
  genres: React.ReactNode;
  header: React.ReactNode;
}) {
  const { shouldRender, isVisible } = useFadeOnSearchBehavior();
  return (
    <>
      <div className="flex flex-col gap-3 w-full px-5">
        {header}
        {shouldRender && (
          <section
            data-display="titles"
            className={`transition-opacity duration-300 ease-in-out ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            {topMovies}
            {genres}
            {children}
          </section>
        )}
        <section data-display="search-results"></section>
      </div>
    </>
  );
}

function useFadeOnSearchBehavior() {
  const [searchOpen] = useQueryState(
    "search",
    parseAsBoolean.withDefault(false)
  );
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (searchOpen) {
      // Start fade out immediately
      setIsVisible(false);
      // Unmount after transition completes
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      // Mount first, then fade in
      setShouldRender(true);
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }
  }, [searchOpen]);

  return { shouldRender, isVisible };
}
