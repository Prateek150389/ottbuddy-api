import {
  BadRequestException,
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { TitlesService } from './titles.service';

@Controller('titles')
export class TitlesController {
  constructor(
    private readonly titlesService: TitlesService,
  ) {}

  @Get(':type/:id')
  async getTitle(
    @Param('type') type: string,
    @Param('id') id: string,
  ) {
    if (type !== 'movie' && type !== 'tv') {
      throw new BadRequestException(
        'Type must be either movie or tv.',
      );
    }

    const tmdbId = Number(id);

    if (Number.isNaN(tmdbId)) {
      throw new BadRequestException(
        'Invalid TMDb ID.',
      );
    }

    return this.titlesService.getTitle(
      type,
      tmdbId,
    );
  }
}