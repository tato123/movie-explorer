"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { usePathname, useRouter } from "next/navigation";

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
  const router = useRouter();
  const pathname = usePathname();

  const { data, isLoading } = useQuery(getGenreMoviesOptions({}));
  const genres = data?.data ?? [];

  const handleGenreSelection = (currentValue: string) => {
    setOpen(false);

    // If not on search page, navigate there first
    if (pathname !== "/search") {
      router.push(`/search?genre=${currentValue}`);
    } else {
      // On search page, use nuqs to preserve other params
      setGenre(currentValue === genre ? "" : currentValue);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] h-12 justify-between"
        >
          {genre
            ? genres.find((g) => g.title === genre)?.title
            : "Filter by Genre"}
          <ChevronsUpDown className="opacity-50" />
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
  );
}
