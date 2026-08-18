import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TitlesService } from '../titles/titles.service';

@Injectable()
export class TodaysPickService {
  constructor(
    private readonly configService: ConfigService,
    private readonly titlesService: TitlesService,
  ) {}

  async getTodaysPick() {
    const type =
      this.configService.get<string>('TODAYS_PICK_TYPE');

    const idValue =
      this.configService.get<string>('TODAYS_PICK_ID');

    if (type !== 'movie' && type !== 'tv') {
      throw new InternalServerErrorException(
        'TODAYS_PICK_TYPE must be movie or tv.',
      );
    }

    const id = Number(idValue);

    if (!Number.isInteger(id) || id <= 0) {
      throw new InternalServerErrorException(
        'TODAYS_PICK_ID must be a valid TMDb ID.',
      );
    }

    const title = await this.titlesService.getTitle(
      type,
      id,
    );

    return {
      ...title,
      todaysPick: true,
    };
  }
}
