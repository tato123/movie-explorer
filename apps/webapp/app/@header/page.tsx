"use client";

import { GenreCombobox } from "./_components/genre-combobox";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDebounce } from "@uidotdev/usehooks";
import { Home, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { ChangeEvent, Suspense, useEffect, useRef, useState } from "react";

// ---------------------------------------------------
// Example of a parallel route that is being re-used within our
// main layout and the /search page. This allows us to stream in the
// page.tsx and header content in parallel
// ---------------------------------------------------

export default function Header() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeaderContent />
    </Suspense>
  );
}

export function HeaderContent({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const isSearchPage = pathname === "/search";
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearchValue] = useState<string>("");
  const debouncedSearchTerm = useDebounce(search, 500);
  const [searchParam, setSearchParam] = useQueryState(
    "q",
    parseAsString.withDefault("")
  );

  const handleSearchClick = () => {
    if (!isSearchPage) {
      router.push("/search");
    }

    inputRef.current?.focus();
  };

  useEffect(() => {
    if (debouncedSearchTerm !== searchParam) {
      if (isSearchPage) {
        setSearchParam(debouncedSearchTerm.trim());
      } else if (debouncedSearchTerm.trim()) {
        // Navigate to search page with query when not on search page
        router.push(
          `/search?q=${encodeURIComponent(debouncedSearchTerm.trim())}`
        );
      }
    }
  }, [debouncedSearchTerm, isSearchPage, searchParam, setSearchParam, router]);

  return (
    <header className={cn("flex flex-row top-0 z-50 w-full", className)}>
      <div className="flex w-full h-16 items-center justify-between px-8 gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Link href="/" aria-label="Go to home">
            <Home className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
          </Link>
          <div className="relative flex-1" onClick={handleSearchClick}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setSearchValue(e.target.value);
              }}
              aria-controls="search-results"
              value={search}
              placeholder="Search movies..."
              className="pl-12 h-12 text-base cursor-pointer hover:bg-muted transition-colors z-10"
            />
          </div>
          <GenreCombobox />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
