"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { getGenreMoviesOptions } from "@jfontanez/tanstack-query-client";
import { parseAsString, useQueryState } from "nuqs";

export function GenreCombobox() {
  return (
    <React.Suspense fallback={<div>loading</div>}>
      <GenreComboboxInternal />
    </React.Suspense>
  );
}

export function GenreComboboxInternal() {
  const [open, setOpen] = React.useState(false);
  const [genre, setGenre] = useQueryState(
    "genre",
    parseAsString.withDefault("")
  );

  const { data, isLoading } = useQuery(getGenreMoviesOptions({}));
  const genres = data?.data ?? [];

  const handleGenreSelection = (currentValue: string) => {
    setOpen(false);
    setGenre(currentValue === genre ? "" : currentValue);
  };

  const handleClearGenre = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGenre(null);
  };

  return (
    <div className="relative flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-[200px] h-12 justify-between",
              genre && "border-primary text-primary pr-10"
            )}
          >
            {genre
              ? genres.find((g) => g.title === genre)?.title
              : "Filter by Genre"}
            {!genre && <ChevronsUpDown className="opacity-50" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search genre..." className="h-9" />
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm">Loading genres...</div>
              )}
              {!isLoading && genres.length === 0 && (
                <CommandEmpty>No genre found.</CommandEmpty>
              )}
              <CommandGroup>
                {genres.map((g) => (
                  <CommandItem
                    key={g.id}
                    value={g.title}
                    onSelect={handleGenreSelection}
                  >
                    {g.title}
                    <Check
                      className={cn(
                        "ml-auto",
                        genre === g.title ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {genre && (
        <button
          onClick={handleClearGenre}
          className="absolute right-2 z-10 p-1 hover:bg-accent rounded-sm"
          aria-label="Clear genre filter"
        >
          <X className="h-4 w-4 text-primary" />
        </button>
      )}
    </div>
  );
}
