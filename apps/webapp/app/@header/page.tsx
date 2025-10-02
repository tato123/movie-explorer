"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQueryState, parseAsBoolean } from "nuqs";

export default function Header({ className }: { className?: string }) {
  const [_searchOpen, setSearchOpen] = useQueryState(
    "search",
    parseAsBoolean.withDefault(false)
  );

  return (
    <header className={cn("flex flex-row top-0 z-50 w-full", className)}>
      <div className="flex w-full h-16 items-center justify-between px-8 gap-4">
        <div className="relative flex-1" onClick={() => setSearchOpen(true)}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search movies..."
            readOnly
            className="pl-12 h-12 text-base bg-muted/50 border-border/50 cursor-pointer hover:bg-muted transition-colors"
          />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
