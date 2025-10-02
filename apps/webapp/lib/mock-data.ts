import type {
  MoviesResponse,
  MovieDetail,
  GenresMoviesResponse,
  QueryParams,
} from '@jfontanez/api-client/rest';

// Helper to generate Picsum URLs
function getPosterUrl(id: number, width = 300, height = 450): string {
  return `https://picsum.photos/seed/${id}/${width}/${height}`;
}

// Mock Genres Data (matches GenresMoviesResponse schema)
const MOCK_GENRES_DATA: GenresMoviesResponse = {
  data: [
    {
      id: '1',
      title: 'Action',
      movies: [{ id: '1' }, { id: '2' }, { id: '5' }, { id: '8' }, { id: '12' }, { id: '15' }, { id: '18' }, { id: '21' }],
    },
    {
      id: '2',
      title: 'Comedy',
      movies: [{ id: '3' }, { id: '7' }, { id: '11' }, { id: '15' }, { id: '19' }, { id: '22' }, { id: '25' }],
    },
    {
      id: '3',
      title: 'Drama',
      movies: [{ id: '4' }, { id: '6' }, { id: '9' }, { id: '13' }, { id: '16' }, { id: '20' }, { id: '23' }],
    },
    {
      id: '4',
      title: 'Sci-Fi',
      movies: [{ id: '1' }, { id: '10' }, { id: '14' }, { id: '24' }, { id: '26' }],
    },
    {
      id: '5',
      title: 'Horror',
      movies: [{ id: '16' }, { id: '17' }, { id: '27' }, { id: '28' }],
    },
    {
      id: '6',
      title: 'Romance',
      movies: [{ id: '18' }, { id: '19' }, { id: '29' }, { id: '30' }],
    },
    {
      id: '7',
      title: 'Thriller',
      movies: [{ id: '20' }, { id: '21' }, { id: '31' }, { id: '32' }],
    },
  ],
  totalPages: 1,
};

// Mock Movie Details (matches MovieDetail schema)
const MOCK_MOVIE_DETAILS: Record<string, MovieDetail> = {
  '1': {
    id: '1',
    title: 'The Stellar Voyage',
    duration: '142 min',
    directors: ['Christopher Nolan'],
    mainActors: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    datePublished: '2024-03-15',
    ratingValue: 8.5,
    bestRating: 10,
    worstRating: 1,
    genres: [
      { id: '1', title: 'Action' },
      { id: '4', title: 'Sci-Fi' },
    ],
    posterUrl: getPosterUrl(1, 300, 450),
    summary:
      'A group of astronauts embark on a dangerous mission to save humanity from an impending cosmic disaster. Through the vast emptiness of space, they must confront their own fears and the unknown.',
    rating: '8.5/10',
    writers: ['Jonathan Nolan', 'Lisa Joy'],
  },
  '2': {
    id: '2',
    title: 'Urban Justice',
    duration: '118 min',
    directors: ['Denis Villeneuve'],
    mainActors: ['Jake Gyllenhaal', 'Emily Blunt', 'Benicio Del Toro'],
    datePublished: '2023-11-20',
    ratingValue: 7.8,
    bestRating: 10,
    worstRating: 1,
    genres: [
      { id: '1', title: 'Action' },
      { id: '7', title: 'Thriller' },
    ],
    posterUrl: getPosterUrl(2, 300, 450),
    summary:
      'A detective races against time to solve a series of mysterious crimes that threaten to tear the city apart.',
    rating: '7.8/10',
    writers: ['Taylor Sheridan'],
  },
  '3': {
    id: '3',
    title: 'Laugh Riot',
    duration: '95 min',
    directors: ['Judd Apatow'],
    mainActors: ['Seth Rogen', 'Kristen Wiig', 'Bill Hader'],
    datePublished: '2024-01-12',
    ratingValue: 7.2,
    bestRating: 10,
    worstRating: 1,
    genres: [{ id: '2', title: 'Comedy' }],
    posterUrl: getPosterUrl(3, 300, 450),
    summary: 'A hilarious comedy about a group of friends navigating the chaos of modern life.',
    rating: '7.2/10',
    writers: ['Evan Goldberg', 'Seth Rogen'],
  },
  '4': {
    id: '4',
    title: 'The Last Letter',
    duration: '128 min',
    directors: ['Greta Gerwig'],
    mainActors: ['Saoirse Ronan', 'Timothée Chalamet', 'Laura Dern'],
    datePublished: '2023-12-08',
    ratingValue: 8.9,
    bestRating: 10,
    worstRating: 1,
    genres: [{ id: '3', title: 'Drama' }],
    posterUrl: getPosterUrl(4, 300, 450),
    summary:
      'A powerful drama about family, loss, and the letters that bring them together across generations.',
    rating: '8.9/10',
    writers: ['Greta Gerwig', 'Noah Baumbach'],
  },
  '5': {
    id: '5',
    title: 'Rapid Fire',
    duration: '105 min',
    directors: ['John Woo'],
    mainActors: ['Tom Cruise', 'Charlize Theron', 'Idris Elba'],
    datePublished: '2024-02-28',
    ratingValue: 7.5,
    bestRating: 10,
    worstRating: 1,
    genres: [{ id: '1', title: 'Action' }],
    posterUrl: getPosterUrl(5, 300, 450),
    summary: 'An adrenaline-fueled action thriller about a special agent facing impossible odds.',
    rating: '7.5/10',
    writers: ['Shane Black'],
  },
  '6': {
    id: '6',
    title: 'Echoes of Silence',
    duration: '135 min',
    directors: ['Chloé Zhao'],
    mainActors: ['Frances McDormand', 'David Strathairn', 'Linda May'],
    datePublished: '2023-10-15',
    ratingValue: 8.7,
    bestRating: 10,
    worstRating: 1,
    genres: [{ id: '3', title: 'Drama' }],
    posterUrl: getPosterUrl(6, 300, 450),
    summary: 'A woman in her sixties embarks on a journey through the American West.',
    rating: '8.7/10',
    writers: ['Chloé Zhao'],
  },
  '7': {
    id: '7',
    title: 'Buddy Cops',
    duration: '112 min',
    directors: ['Edgar Wright'],
    mainActors: ['Simon Pegg', 'Nick Frost', 'Rosamund Pike'],
    datePublished: '2024-03-22',
    ratingValue: 7.9,
    bestRating: 10,
    worstRating: 1,
    genres: [
      { id: '2', title: 'Comedy' },
      { id: '1', title: 'Action' },
    ],
    posterUrl: getPosterUrl(7, 300, 450),
    summary: 'Two mismatched cops must work together to solve a crime spree in their small town.',
    rating: '7.9/10',
    writers: ['Edgar Wright', 'Simon Pegg'],
  },
  '8': {
    id: '8',
    title: 'Titanfall',
    duration: '150 min',
    directors: ['James Cameron'],
    mainActors: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
    datePublished: '2023-12-15',
    ratingValue: 9.1,
    bestRating: 10,
    worstRating: 1,
    genres: [
      { id: '1', title: 'Action' },
      { id: '4', title: 'Sci-Fi' },
    ],
    posterUrl: getPosterUrl(8, 300, 450),
    summary: 'An epic sci-fi adventure set on a distant alien world.',
    rating: '9.1/10',
    writers: ['James Cameron'],
  },
  '9': {
    id: '9',
    title: 'The Inheritance',
    duration: '140 min',
    directors: ['Yorgos Lanthimos'],
    mainActors: ['Emma Stone', 'Willem Dafoe', 'Mark Ruffalo'],
    datePublished: '2024-01-26',
    ratingValue: 8.3,
    bestRating: 10,
    worstRating: 1,
    genres: [{ id: '3', title: 'Drama' }],
    posterUrl: getPosterUrl(9, 300, 450),
    summary: 'A darkly comedic drama about a wealthy family torn apart by greed and secrets.',
    rating: '8.3/10',
    writers: ['Tony McNamara'],
  },
  '10': {
    id: '10',
    title: 'Quantum Paradox',
    duration: '138 min',
    directors: ['Denis Villeneuve'],
    mainActors: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas'],
    datePublished: '2023-11-03',
    ratingValue: 8.8,
    bestRating: 10,
    worstRating: 1,
    genres: [{ id: '4', title: 'Sci-Fi' }],
    posterUrl: getPosterUrl(10, 300, 450),
    summary: 'A mind-bending sci-fi thriller exploring the nature of reality and consciousness.',
    rating: '8.8/10',
    writers: ['Hampton Fancher', 'Michael Green'],
  },
};

// Generate additional movies 11-32
for (let i = 11; i <= 32; i++) {
  const genres = [
    [{ id: '2', title: 'Comedy' }],
    [{ id: '1', title: 'Action' }],
    [{ id: '3', title: 'Drama' }],
    [{ id: '4', title: 'Sci-Fi' }],
    [{ id: '2', title: 'Comedy' }],
    [{ id: '5', title: 'Horror' }],
    [{ id: '5', title: 'Horror' }],
    [{ id: '6', title: 'Romance' }],
    [{ id: '6', title: 'Romance' }],
    [{ id: '7', title: 'Thriller' }],
    [{ id: '1', title: 'Action' }],
    [{ id: '2', title: 'Comedy' }],
    [{ id: '3', title: 'Drama' }],
    [{ id: '4', title: 'Sci-Fi' }],
    [{ id: '2', title: 'Comedy' }],
    [{ id: '4', title: 'Sci-Fi' }],
    [{ id: '5', title: 'Horror' }],
    [{ id: '5', title: 'Horror' }],
    [{ id: '6', title: 'Romance' }],
    [{ id: '6', title: 'Romance' }],
    [{ id: '7', title: 'Thriller' }],
    [{ id: '7', title: 'Thriller' }],
  ];

  MOCK_MOVIE_DETAILS[i.toString()] = {
    id: i.toString(),
    title: `Movie Title ${i}`,
    duration: `${90 + Math.floor(Math.random() * 50)} min`,
    directors: ['Director Name'],
    mainActors: ['Actor One', 'Actor Two', 'Actor Three'],
    datePublished: '2024-01-01',
    ratingValue: 6 + Math.random() * 3,
    bestRating: 10,
    worstRating: 1,
    genres: genres[i - 11] || [{ id: '1', title: 'Action' }],
    posterUrl: getPosterUrl(i, 300, 450),
    summary: `An exciting story that will keep you on the edge of your seat. Movie ${i} delivers entertainment and emotion.`,
    rating: `${(6 + Math.random() * 3).toFixed(1)}/10`,
    writers: ['Writer Name'],
  };
}

// Mock Movies List (matches MoviesResponse schema)
const MOCK_MOVIES_LIST: MoviesResponse['data'] = Object.values(MOCK_MOVIE_DETAILS).map((movie) => ({
  id: movie.id,
  title: movie.title,
  posterUrl: movie.posterUrl,
  rating: movie.rating,
}));

// Query Functions (async to simulate API calls)

export async function getMovies(params?: QueryParams): Promise<MoviesResponse> {
  let filteredMovies = [...MOCK_MOVIES_LIST];

  // Filter by search query
  if (params?.search) {
    const query = params.search.toLowerCase();
    filteredMovies = filteredMovies.filter((movie) => movie.title.toLowerCase().includes(query));
  }

  // Filter by genre
  if (params?.genre) {
    const genreMovies = MOCK_GENRES_DATA.data.find((g: { id: string }) => g.id === params.genre);
    if (genreMovies) {
      const movieIds = genreMovies.movies.map((m: { id: string }) => m.id);
      filteredMovies = filteredMovies.filter((m) => movieIds.includes(m.id));
    }
  }

  // Pagination
  const page = params?.page || 1;
  const limit = params?.limit || 25;
  const startIndex = (page - 1) * limit;
  const paginatedMovies = filteredMovies.slice(startIndex, startIndex + limit);

  return {
    data: paginatedMovies,
    totalPages: Math.ceil(filteredMovies.length / limit),
  };
}

export async function getMovieById(id: string): Promise<MovieDetail | null> {
  return MOCK_MOVIE_DETAILS[id] || null;
}

export async function getGenresWithMovies(): Promise<GenresMoviesResponse> {
  return MOCK_GENRES_DATA;
}

export async function getGenreById(id: string) {
  return MOCK_GENRES_DATA.data.find((g: { id: string }) => g.id === id) || null;
}

// Helper to get all genres (for filters)
export function getAllGenres() {
  return MOCK_GENRES_DATA.data.map((g: { id: string; title: string }) => ({ id: g.id, title: g.title }));
}
