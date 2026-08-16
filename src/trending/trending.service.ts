import { Injectable } from '@nestjs/common';
import { TmdbService } from '../tmdb/tmdb.service';
import {
  mapSearchResult,
  type SearchResultDto,
} from '../search/search.mapper';

@Injectable()
export class TrendingService {
  constructor(
    private readonly tmdbService: TmdbService,
  ) {}

  async getTrending(
    timeWindow: 'day' | 'week' = 'day',
  ): Promise<{
    success: true;
    timeWindow: 'day' | 'week';
    totalResults: number;
    results: SearchResultDto[];
  }> {
    const tmdbResults =
      await this.tmdbService.getTrending(timeWindow);

    const results = tmdbResults
      .slice(0, 12)
      .map(mapSearchResult);

    return {
      success: true,
      timeWindow,
      totalResults: results.length,
      results,
    };
  }
}
