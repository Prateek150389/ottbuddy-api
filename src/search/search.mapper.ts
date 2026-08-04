type TmdbSearchItem = {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  original_language?: string;
};

export type SearchResultDto = {
  id: string;
  tmdbId: number;
  title: string;
  type: 'Movie' | 'Series';
  poster: string;
  year: number | null;
  language: string;
  tmdbRating: number;
  overview: string;
};

const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export function mapSearchResult(
  item: TmdbSearchItem,
): SearchResultDto {
  const isMovie = item.media_type === 'movie';

  const title = isMovie
    ? item.title ?? 'Untitled'
    : item.name ?? 'Untitled';

  const date = isMovie
    ? item.release_date
    : item.first_air_date;

  const year =
    date && date.length >= 4
      ? Number(date.slice(0, 4))
      : null;

  return {
    id: `${item.media_type}-${item.id}`,
    tmdbId: item.id,
    title,
    type: isMovie ? 'Movie' : 'Series',
    poster: item.poster_path
      ? `${POSTER_BASE_URL}${item.poster_path}`
      : '',
    year,
    language: item.original_language?.toUpperCase() ?? '',
    tmdbRating: Number(
      (item.vote_average ?? 0).toFixed(1),
    ),
    overview:
      item.overview?.trim() ||
      'Overview is currently unavailable.',
  };
}

export function mapSearchResults(
  items: TmdbSearchItem[],
): SearchResultDto[] {
  return items.map(mapSearchResult);
}