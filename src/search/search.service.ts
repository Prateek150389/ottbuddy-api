import { Injectable } from '@nestjs/common';
import {
  TmdbService,
  type TmdbSearchItem,
  type TmdbWatchProviderRegion,
} from '../tmdb/tmdb.service';
import {
  mapSearchResult,
  type SearchResultDto,
} from './search.mapper';

function uniqueProviderNames(
  providers:
    | TmdbWatchProviderRegion['flatrate']
    | TmdbWatchProviderRegion['rent']
    | TmdbWatchProviderRegion['buy']
    | TmdbWatchProviderRegion['free']
    | TmdbWatchProviderRegion['ads'],
): string[] {
  if (!providers) {
    return [];
  }

  return [
    ...new Set(
      providers.map((provider) => provider.provider_name),
    ),
  ];
}

type SearchResultWithProviders = SearchResultDto & {
  streamingOn: string[];
  availableToRent: string[];
  availableToBuy: string[];
  freeOn: string[];
  adsOn: string[];
  availabilityLink: string;
};

@Injectable()
export class SearchService {
  constructor(
    private readonly tmdbService: TmdbService,
  ) {}

  private async enrichWithProviders(
    item: TmdbSearchItem,
  ): Promise<SearchResultWithProviders> {
    const mappedResult = mapSearchResult(item);

    const mediaType =
      item.media_type === 'movie' ? 'movie' : 'tv';

    const providers =
      await this.tmdbService.getWatchProviders(
        mediaType,
        item.id,
        'IN',
      );

    return {
      ...mappedResult,
      streamingOn: uniqueProviderNames(
        providers?.flatrate,
      ),
      availableToRent: uniqueProviderNames(
        providers?.rent,
      ),
      availableToBuy: uniqueProviderNames(
        providers?.buy,
      ),
      freeOn: uniqueProviderNames(providers?.free),
      adsOn: uniqueProviderNames(providers?.ads),
      availabilityLink: providers?.link ?? '',
    };
  }

  async search(query: string) {
    const tmdbResults =
      await this.tmdbService.searchMulti(query);

    const limitedResults = tmdbResults.slice(0, 8);

    const results = await Promise.all(
      limitedResults.map((item) =>
        this.enrichWithProviders(item),
      ),
    );

    return {
      success: true,
      query,
      region: 'IN',
      totalResults: results.length,
      results,
      attribution:
        'Streaming availability data provided by JustWatch via TMDb.',
    };
  }
}