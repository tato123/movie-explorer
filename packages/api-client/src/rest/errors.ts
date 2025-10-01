import { z } from 'zod';

/**
 * Movie API Unauthorized Error
 * Thrown when API returns 401 status
 */
export class MOVIE_API_UNAUTHORIZED extends Error {
  public statusCode: number;
  public statusText: string;

  constructor(
    statusCode: number = 401,
    statusText: string = 'Unauthorized',
    customMessage?: string
  ) {
    const message = customMessage
      ? `${customMessage} (${statusCode} ${statusText})`
      : `Unauthorized: Invalid or expired token (${statusCode} ${statusText})`;
    super(message);
    this.name = 'MOVIE_API_UNAUTHORIZED';
    this.statusCode = statusCode;
    this.statusText = statusText;
  }
}

/**
 * Movie API Invalid Schema Error
 * Thrown when response doesn't match expected schema
 */
export class MOVIE_API_INVALID_SCHEMA extends Error {
  public zodError: z.ZodError;

  constructor(zodError: z.ZodError) {
    super(`Invalid API response schema: ${zodError.message}`);
    this.name = 'MOVIE_API_INVALID_SCHEMA';
    this.zodError = zodError;
  }
}

/**
 * Movie API Service Unavailable Error
 * Thrown when API returns 500+ status codes
 */
export class MOVIE_API_SERVICE_UNAVAILABLE extends Error {
  public statusCode: number;
  public statusText: string;

  constructor(
    statusCode: number,
    statusText: string = 'Internal Server Error',
    customMessage?: string
  ) {
    const message = customMessage
      ? `${customMessage} (${statusCode} ${statusText})`
      : `Service unavailable: Server error occurred (${statusCode} ${statusText})`;
    super(message);
    this.name = 'MOVIE_API_SERVICE_UNAVAILABLE';
    this.statusCode = statusCode;
    this.statusText = statusText;
  }
}

/**
 * Movie API Not Found Error
 * Thrown when API returns 404 status
 */
export class MOVIE_API_NOT_FOUND extends Error {
  public statusCode: number;
  public statusText: string;

  constructor(
    statusCode: number = 404,
    statusText: string = 'Not Found',
    customMessage?: string
  ) {
    const message = customMessage
      ? `${customMessage} (${statusCode} ${statusText})`
      : `Resource not found (${statusCode} ${statusText})`;
    super(message);
    this.name = 'MOVIE_API_NOT_FOUND';
    this.statusCode = statusCode;
    this.statusText = statusText;
  }
}

/**
 * Movie API Unexpected Error
 * Thrown when API returns an unexpected error status
 */
export class MOVIE_API_UNEXPECTED_ERROR extends Error {
  public statusCode: number;
  public statusText: string;

  constructor(
    statusCode: number,
    statusText: string = 'Unknown Error',
    customMessage?: string
  ) {
    const message = customMessage
      ? `${customMessage} (${statusCode} ${statusText})`
      : `Unexpected API error occurred (${statusCode} ${statusText})`;
    super(message);
    this.name = 'MOVIE_API_UNEXPECTED_ERROR';
    this.statusCode = statusCode;
    this.statusText = statusText;
  }
}
