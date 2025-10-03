"use client";

import { GenreCombobox } from "./_components/genre-combobox";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Home, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { Suspense } from "react";

export default function Header() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeaderContent />
    </Suspense>
  );
}

export function HeaderContent({ className }: { className?: string }) {
  const pathname = usePathname();
  const isSearchPage = pathname === "/search";
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );

  return (
    <header className={cn("flex flex-row top-0 z-50 w-full", className)}>
      <div className="flex w-full h-16 items-center px-8 gap-4">
        <Link href="/" aria-label="Go to home">
          <Home className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" />
        </Link>
        {isSearchPage ? (
          <>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                onChange={(e) => setSearch(e.target.value)}
                value={search}
                placeholder="Search movies..."
                className="pl-12 h-12 text-base"
              />
            </div>
            <GenreCombobox />
          </>
        ) : (
          <Button variant="outline" asChild className="h-12 flex-1">
            <Link href="/search" className="flex items-center justify-center gap-2">
              Search
              <Search className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
