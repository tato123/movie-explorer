import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GET_AUTH_TOKEN,
  GET_GENRES_MOVIES,
  GET_HEALTHCHECK,
  GET_MOVIES,
  GET_MOVIES_TITLES,
  GET_MOVIE_BY_ID,
  GET_MOVIE_GENRE_STATS,
  createClient,
} from "../client";
import {
  MOVIE_API_INVALID_SCHEMA,
  MOVIE_API_NOT_FOUND,
  MOVIE_API_SERVICE_UNAVAILABLE,
  MOVIE_API_UNAUTHORIZED,
  MOVIE_API_UNEXPECTED_ERROR,
} from "../errors";

const BASE_URL = "https://api.example.com";
const MOCK_TOKEN = "test-token-123";

describe("GET_AUTH_TOKEN", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch auth token successfully", async () => {
    const mockResponse = {
      status: 200,
      ok: true,
      json: async () => ({ token: MOCK_TOKEN }),
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    const getToken = GET_AUTH_TOKEN(BASE_URL);
    const result = await getToken();

    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/auth/token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(result).toHaveProperty("token", MOCK_TOKEN);
  });

  it("should handle 401 error", async () => {
    const mockResponse = {
      status: 401,
      ok: false,
      statusText: "Unauthorized",
      json: async () => ({}),
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    const getToken = GET_AUTH_TOKEN(BASE_URL);

    await expect(getToken()).rejects.toThrow(MOVIE_API_UNAUTHORIZED);
  });

  it("should handle 500+ errors", async () => {
    const mockResponse = {
      status: 500,
      ok: false,
      statusText: "Internal Server Error",
      json: async () => ({}),
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    const getToken = GET_AUTH_TOKEN(BASE_URL);

    await expect(getToken()).rejects.toThrow(MOVIE_API_SERVICE_UNAVAILABLE);
  });
});

describe("GET_HEALTHCHECK", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch healthcheck successfully", async () => {
    const mockResponse = {
      status: 200,
      ok: true,
      json: async () => ({ contentful: true }),
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    const healthcheck = GET_HEALTHCHECK(BASE_URL)(MOCK_TOKEN);
    const result = await healthcheck();

    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/healthcheck`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MOCK_TOKEN}`,
      },
    });
    expect(result).toHaveProperty("contentful", true);
  });
});

describe("GET_GENRES_MOVIES", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch genres with movies successfully", async () => {
    const mockData = {
      data: [
        {
          id: "1",
          title: "Action",
          movies: [{ id: "101" }, { id: "102" }],
        },
      ],
      totalPages: 1,
    };

    const mockResponse = {
      status: 200,
      ok: true,
      json: async () => mockData,
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    const getGenres = GET_GENRES_MOVIES(BASE_URL)(MOCK_TOKEN);
    const result = await getGenres({ queryParams: { page: 1, limit: 10 } });

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/genres/movies?page=1&limit=10`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MOCK_TOKEN}`,
        },
      }
    );
    expect(result.data).toHaveLength(1);
    expect(result.totalPages).toBe(1);
  });

  it("should handle request without query params", async () => {
    const mockData = {
      data: [],
      totalPages: 0,
    };

    const mockResponse = {
      status: 200,
      ok: true,
      json: async () => mockData,
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    const getGenres = GET_GENRES_MOVIES(BASE_URL)(MOCK_TOKEN);
    const result = await getGenres({});

    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/genres/movies`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MOCK_TOKEN}`,
      },
    });
    expect(result.data).toEqual([]);
  });
});

describe("GET_MOVIES", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch movies with all query params", async () => {
    const mockData = {
      data: [
        {
          id: "1",
          title: "Inception",
          posterUrl: "https://example.com/poster.jpg",
          rating: "PG-13",
        },
      ],
      totalPages: 5,
    };

    const mockResponse = {
      status: 200,
      ok: true,
      json: async () => mockData,
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    const getMovies = GET_MOVIES(BASE_URL)(MOCK_TOKEN);
    const result = await getMovies({
      queryParams: {
        page: 2,
        limit: 25,
        search: "inception",
        genre: "Action",
      },
    });

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/movies?page=2&limit=25&search=inception&genre=Action`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MOCK_TOKEN}`,
        },
      }
    );
    expect(result.data).toHaveLength(1);
  });
});

describe("GET_MOVIE_BY_ID", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch movie by ID successfully", async () => {
    const mockData = {
      id: "123",
      title: "The Matrix",
      duration: "136 min",
      directors: ["Lana Wachowski", "Lilly Wachowski"],
      mainActors: ["Keanu Reeves", "Laurence Fishburne"],
      datePublished: "1999-03-31",
      ratingValue: 8.7,
      bestRating: 10,
      worstRating: 1,
      genres: [
        { id: "1", title: "Action" },
        { id: "2", title: "Sci-Fi" },
      ],
    };

    const mockResponse = {
      status: 200,
      ok: true,
      json: async () => mockData,
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    const getMovie = GET_MOVIE_BY_ID(BASE_URL)(MOCK_TOKEN);
    const result = await getMovie({ params: { id: "123" } });

    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/movies/123`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MOCK_TOKEN}`,
      },
    });
    expect(result.id).toBe("123");
    expect(result.title).toBe("The Matrix");
  });

  it("should handle 404 error for non-existent movie", async () => {
    const mockResponse = {
      status: 404,
      ok: false,
      statusText: "Not Found",
      json: async () => ({}),
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    const getMovie = GET_MOVIE_BY_ID(BASE_URL)(MOCK_TOKEN);

    await expect(getMovie({ params: { id: "999" } })).rejects.toThrow(
      MOVIE_API_NOT_FOUND
    );
  });
});

describe("GET_MOVIES_TITLES", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch movie titles successfully", async () => {
    const mockData = {
      data: [
        { id: "1", title: "The Matrix" },
        { id: "2", title: "Inception" },
      ],
      totalPages: 10,
    };

    const mockResponse = {
      status: 200,
      ok: true,
      json: async () => mockData,
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    const getTitles = GET_MOVIES_TITLES(BASE_URL)(MOCK_TOKEN);
    const result = await getTitles({ queryParams: { page: 1, limit: 100 } });

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/movies/titles?page=1&limit=100`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MOCK_TOKEN}`,
        },
      }
    );
    expect(result.data).toHaveLength(2);
  });
});

describe("GET_MOVIE_GENRE_STATS", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch genre stats successfully", async () => {
    const mockData = {
      id: "1",
      title: "Action",
      totalMovies: 150,
    };

    const mockResponse = {
      status: 200,
      ok: true,
      json: async () => mockData,
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    const getStats = GET_MOVIE_GENRE_STATS(BASE_URL)(MOCK_TOKEN);
    const result = await getStats({ params: { id: "1" } });

    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/movies/genres/1`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MOCK_TOKEN}`,
      },
    });
    expect(result.id).toBe("1");
    expect(result.totalMovies).toBe(150);
  });
});

describe("createClient", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create client with pre-configured methods", async () => {
    const mockTokenResponse = {
      status: 200,
      ok: true,
      json: async () => ({ token: MOCK_TOKEN }),
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockTokenResponse as Response);

    const client = await createClient(BASE_URL);

    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/auth/token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(client).toHaveProperty("GET_HEALTHCHECK");
    expect(client).toHaveProperty("GET_GENRES_MOVIES");
    expect(client).toHaveProperty("GET_MOVIES");
    expect(client).toHaveProperty("GET_MOVIE_BY_ID");
    expect(client).toHaveProperty("GET_MOVIES_TITLES");
    expect(client).toHaveProperty("GET_MOVIE_GENRE_STATS");
  });
});

describe("Error Handling", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should throw MOVIE_API_INVALID_SCHEMA for invalid response schema", async () => {
    const mockResponse = {
      status: 200,
      ok: true,
      json: async () => ({ invalid: "data" }),
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    const getToken = GET_AUTH_TOKEN(BASE_URL);

    await expect(getToken()).rejects.toThrow(MOVIE_API_INVALID_SCHEMA);
  });

  it("should throw MOVIE_API_UNEXPECTED_ERROR for unexpected status codes", async () => {
    const mockResponse = {
      status: 418,
      ok: false,
      statusText: "I'm a teapot",
      json: async () => ({}),
    };

    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

    const getToken = GET_AUTH_TOKEN(BASE_URL);

    await expect(getToken()).rejects.toThrow(MOVIE_API_UNEXPECTED_ERROR);
  });
});
