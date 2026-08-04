import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type TmdbSearchItem = {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  original_language?: string;
};

type TmdbSearchResponse = {
  page: number;
  results: TmdbSearchItem[];
  total_pages: number;
  total_results: number;
};

export type TmdbWatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
};

export type TmdbWatchProviderRegion = {
  link?: string;
  flatrate?: TmdbWatchProvider[];
  rent?: TmdbWatchProvider[];
  buy?: TmdbWatchProvider[];
  free?: TmdbWatchProvider[];
  ads?: TmdbWatchProvider[];
};

type TmdbWatchProviderResponse = {
  id: number;
  results: Record<string, TmdbWatchProviderRegion>;
};

export type TmdbGenre = {
  id: number;
  name: string;
};

export type TmdbProductionCompany = {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
};

export type TmdbVideo = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
};

type TmdbVideosResponse = {
  results: TmdbVideo[];
};

export type TmdbTitleDetails = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  runtime?: number;
  episode_run_time?: number[];
  vote_average?: number;
  vote_count?: number;
  original_language?: string;
  genres?: TmdbGenre[];
  production_companies?: TmdbProductionCompany[];
  tagline?: string;
  status?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  videos?: TmdbVideosResponse;
};

export type TmdbCastMember = {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
  order?: number;
};

type TmdbCreditsResponse = {
  cast: TmdbCastMember[];
};

type TmdbRecommendationsResponse = {
  results: TmdbSearchItem[];
};

@Injectable()
export class TmdbService {
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  constructor(
    private readonly configService: ConfigService,
  ) {}

  private getApiKey(): string {
    const apiKey =
      this.configService.get<string>('TMDB_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'TMDB_API_KEY is not configured.',
      );
    }

    return apiKey;
  }

  private async fetchWithRetry(
    url: URL,
    attempts = 3,
  ): Promise<Response> {
    let lastError: unknown;

    for (
      let attempt = 1;
      attempt <= attempts;
      attempt += 1
    ) {
      try {
        const response = await fetch(url);

        if (response.ok) {
          return response;
        }

        lastError = new Error(
          `TMDb request failed with status ${response.status}`,
        );
      } catch (error) {
        lastError = error;
      }

      if (attempt < attempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, attempt * 1000),
        );
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('TMDb request failed.');
  }

  async searchMulti(
    query: string,
  ): Promise<TmdbSearchItem[]> {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    const url = new URL(`${this.baseUrl}/search/multi`);

    url.searchParams.set('api_key', this.getApiKey());
    url.searchParams.set('query', trimmedQuery);
    url.searchParams.set('language', 'en-US');
    url.searchParams.set('include_adult', 'false');

    try {
      const response = await this.fetchWithRetry(url);
      const data =
        (await response.json()) as TmdbSearchResponse;

      return data.results.filter(
        (item) =>
          item.media_type === 'movie' ||
          item.media_type === 'tv',
      );
    } catch {
      throw new InternalServerErrorException(
        'Unable to search TMDb right now.',
      );
    }
  }

  async getWatchProviders(
    mediaType: 'movie' | 'tv',
    tmdbId: number,
    region = 'IN',
  ): Promise<TmdbWatchProviderRegion | null> {
    const url = new URL(
      `${this.baseUrl}/${mediaType}/${tmdbId}/watch/providers`,
    );

    url.searchParams.set('api_key', this.getApiKey());

    try {
      const response = await this.fetchWithRetry(url);
      const data =
        (await response.json()) as TmdbWatchProviderResponse;

      return data.results[region] ?? null;
    } catch {
      return null;
    }
  }

  async getTitleDetails(
    mediaType: 'movie' | 'tv',
    tmdbId: number,
  ): Promise<TmdbTitleDetails> {
    const url = new URL(
      `${this.baseUrl}/${mediaType}/${tmdbId}`,
    );

    url.searchParams.set('api_key', this.getApiKey());
    url.searchParams.set('language', 'en-US');
    url.searchParams.set('append_to_response', 'videos');

    try {
      const response = await this.fetchWithRetry(url);

      return (await response.json()) as TmdbTitleDetails;
    } catch (error) {
      console.error(
        'TMDb getTitleDetails error:',
        error,
      );

      throw new InternalServerErrorException(
        'Unable to load title details right now.',
      );
    }
  }

  async getCredits(
    mediaType: 'movie' | 'tv',
    tmdbId: number,
  ): Promise<TmdbCastMember[]> {
    const url = new URL(
      `${this.baseUrl}/${mediaType}/${tmdbId}/credits`,
    );

    url.searchParams.set('api_key', this.getApiKey());
    url.searchParams.set('language', 'en-US');

    try {
      const response = await this.fetchWithRetry(url);
      const data =
        (await response.json()) as TmdbCreditsResponse;

      return data.cast.slice(0, 12);
    } catch {
      return [];
    }
  }

  async getRecommendations(
    mediaType: 'movie' | 'tv',
    tmdbId: number,
  ): Promise<TmdbSearchItem[]> {
    const url = new URL(
      `${this.baseUrl}/${mediaType}/${tmdbId}/recommendations`,
    );

    url.searchParams.set('api_key', this.getApiKey());
    url.searchParams.set('language', 'en-US');

    try {
      const response = await this.fetchWithRetry(url);
      const data =
        (await response.json()) as TmdbRecommendationsResponse;

      return data.results.slice(0, 8);
    } catch {
      return [];
    }
  }

  getPosterUrl(
    posterPath?: string | null,
    size: 'w342' | 'w500' | 'w780' = 'w500',
  ): string {
    if (!posterPath) {
      return '';
    }

    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  }

  getProfileUrl(
    profilePath?: string | null,
    size: 'w185' | 'h632' = 'w185',
  ): string {
    if (!profilePath) {
      return '';
    }

    return `https://image.tmdb.org/t/p/${size}${profilePath}`;
  }
}