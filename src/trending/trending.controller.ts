import {
  BadRequestException,
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { TrendingService } from './trending.service';

@Controller('trending')
export class TrendingController {
  constructor(
    private readonly trendingService: TrendingService,
  ) {}

  @Get()
  async getTrending(
    @Query('window') window?: string,
  ) {
    const timeWindow = window ?? 'day';

    if (
      timeWindow !== 'day' &&
      timeWindow !== 'week'
    ) {
      throw new BadRequestException(
        'The window query parameter must be day or week.',
      );
    }

    return this.trendingService.getTrending(
      timeWindow,
    );
  }
}
