import { Injectable } from '@nestjs/common';
import {
  TmdbService,
  type TmdbSearchItem,
} from '../tmdb/tmdb.service';

@Injectable()
export class TitlesService {
  constructor(
    private readonly tmdbService: TmdbService,
  ) {}

  private mapRecommendation(
    item: TmdbSearchItem,
    fallbackType: 'movie' | 'tv',
  ) {
    const mediaType =
      item.media_type === 'movie' || item.media_type === 'tv'
        ? item.media_type
        : fallbackType;

    const title =
      mediaType === 'movie'
        ? item.title ?? 'Untitled'
        : item.name ?? 'Untitled';

    const date =
      mediaType === 'movie'
        ? item.release_date
        : item.first_air_date;

    return {
      id: `${mediaType}-${item.id}`,
      tmdbId: item.id,
      type: mediaType,
      title,
      poster: this.tmdbService.getPosterUrl(
        item.poster_path,
        'w342',
      ),
      backdrop: this.tmdbService.getPosterUrl(
        item.backdrop_path,
        'w780',
      ),
      year:
        date && date.length >= 4
          ? Number(date.slice(0, 4))
          : null,
      rating: Number(
        (item.vote_average ?? 0).toFixed(1),
      ),
      overview:
        item.overview?.trim() ||
        'Overview is currently unavailable.',
    };
  }

  async getTitle(
    type: 'movie' | 'tv',
    id: number,
  ) {
    const [
      details,
      providers,
      cast,
      recommendations,
    ] = await Promise.all([
      this.tmdbService.getTitleDetails(type, id),
      this.tmdbService.getWatchProviders(type, id, 'IN'),
      this.tmdbService.getCredits(type, id),
      this.tmdbService.getRecommendations(type, id),
    ]);

    return {
      success: true,
      type,
      id,

      title: details.title ?? details.name ?? 'Untitled',

      tagline: details.tagline ?? '',

      overview:
        details.overview?.trim() ||
        'Overview is currently unavailable.',

      poster: this.tmdbService.getPosterUrl(
        details.poster_path,
      ),

      backdrop: this.tmdbService.getPosterUrl(
        details.backdrop_path,
        'w780',
      ),

      rating: Number(
        (details.vote_average ?? 0).toFixed(1),
      ),

      votes: details.vote_count ?? 0,

      language:
        details.original_language?.toUpperCase() ?? '',

      runtime:
        details.runtime ??
        details.episode_run_time?.[0] ??
        null,

      genres:
        details.genres?.map((genre) => genre.name) ?? [],

      releaseDate:
        details.release_date ??
        details.first_air_date ??
        '',

      status: details.status ?? '',

      seasons: details.number_of_seasons ?? null,

      episodes: details.number_of_episodes ?? null,

      streamingOn:
        providers?.flatrate?.map((provider) => ({
          id: provider.provider_id,
          name: provider.provider_name,
          logo: provider.logo_path
            ? `https://image.tmdb.org/t/p/w92${provider.logo_path}`
            : '',
        })) ?? [],

      availabilityLink: providers?.link ?? '',

      trailer:
        details.videos?.results.find(
          (video) =>
            video.site === 'YouTube' &&
            video.type === 'Trailer' &&
            video.official,
        )?.key ??
        details.videos?.results.find(
          (video) =>
            video.site === 'YouTube' &&
            video.type === 'Trailer',
        )?.key ??
        null,

      cast: cast.map((member) => ({
        id: member.id,
        name: member.name,
        character: member.character ?? '',
        profile: this.tmdbService.getProfileUrl(
          member.profile_path,
        ),
      })),

      recommendations: recommendations.map((item) =>
        this.mapRecommendation(item, type),
      ),
    };
  }
}