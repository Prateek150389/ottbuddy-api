import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import type { MediaType } from './ratings.service';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Put()
  async saveRating(
    @Body()
    body: {
      mediaType: MediaType;
      tmdbId: number;
      rating: number;
      anonymousId?: string;
      userId?: string;
    },
  ) {
    if (!['movie', 'tv'].includes(body.mediaType)) {
      throw new BadRequestException('mediaType must be movie or tv');
    }

    if (!Number.isInteger(body.tmdbId) || body.tmdbId <= 0) {
      throw new BadRequestException('tmdbId must be a positive integer');
    }

    if (
      !Number.isInteger(body.rating) ||
      body.rating < 1 ||
      body.rating > 5
    ) {
      throw new BadRequestException('rating must be between 1 and 5');
    }

    if (!body.userId && !body.anonymousId) {
      throw new BadRequestException(
        'anonymousId or userId is required',
      );
    }

    return this.ratingsService.saveRating(body);
  }

  @Get(':mediaType/:tmdbId')
  async getRating(
    @Param('mediaType') mediaType: MediaType,
    @Param('tmdbId') tmdbId: string,
    @Query('anonymousId') anonymousId?: string,
    @Query('userId') userId?: string,
  ) {
    if (!['movie', 'tv'].includes(mediaType)) {
      throw new BadRequestException('mediaType must be movie or tv');
    }

    const parsedTmdbId = Number(tmdbId);

    if (!Number.isInteger(parsedTmdbId) || parsedTmdbId <= 0) {
      throw new BadRequestException('Invalid tmdbId');
    }

    return this.ratingsService.getRating(
      mediaType,
      parsedTmdbId,
      anonymousId,
      userId,
    );
  }
}
