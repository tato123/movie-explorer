import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDuration } from "date-fns"
import { parse, toSeconds } from "iso8601-duration"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts an ISO 8601 duration string (e.g., "PT1H30M") to a human-readable format
 * @param duration - ISO 8601 duration string or undefined
 * @returns Human-readable duration string (e.g., "1 hour 30 minutes") or empty string if invalid
 */
export function formatIso8601Duration(duration: string | undefined | null): string {
  const defaultValue = duration ?? "";

  try {
    if (!duration) {
      return defaultValue;
    }

    const parsed = parse(duration);
    const totalSeconds = toSeconds(parsed);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return formatDuration(
      { hours, minutes },
      { format: ["hours", "minutes"], zero: false }
    );
  } catch {
    return defaultValue;
  }
}
