"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, usePathname } from "next/navigation";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@uidotdev/usehooks";
import { parseAsString, useQueryState } from "nuqs";

// ---------------------------------------------------
// Example of a parallel route that is being re-used within our
// main layout and the /search page. This allows us to stream in the
// page.tsx and header content in parallel
// ---------------------------------------------------

export default function Header({ className }: { className?: string }) {
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

  const handleCloseClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      router.back();
    },
    [router]
  );

  useEffect(() => {
    if (isSearchPage && debouncedSearchTerm !== searchParam) {
      setSearchParam(debouncedSearchTerm.trim());
    }
  }, [debouncedSearchTerm, isSearchPage, searchParam, setSearchParam]);

  return (
    <header className={cn("flex flex-row top-0 z-50 w-full", className)}>
      <div className="flex w-full h-16 items-center justify-between px-8 gap-4">
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
            className="pl-12 pr-12 h-12 text-base  cursor-pointer hover:bg-muted transition-colors z-10"
          />
          {isSearchPage && (
            <Button
              onClick={handleCloseClick}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-blue-100 hover:bg-blue-400 dark:bg-purple-400 dark:hover:bg-purple-800 dark:text-white"
              variant={"ghost"}
              aria-label="Close search"
            >
              Stop Searching
            </Button>
          )}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
