import {
  BadRequestException,
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
  ) {}

  @Get()
  async search(
    @Query('q') query?: string,
  ) {
    const trimmedQuery = query?.trim();

    if (!trimmedQuery) {
      throw new BadRequestException(
        'The q query parameter is required.',
      );
    }

    return this.searchService.search(trimmedQuery);
  }
}