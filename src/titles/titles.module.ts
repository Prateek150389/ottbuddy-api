import { Module } from '@nestjs/common';
import { TmdbModule } from '../tmdb/tmdb.module';
import { TitlesController } from './titles.controller';
import { TitlesService } from './titles.service';

@Module({
  imports: [TmdbModule],
  controllers: [TitlesController],
  providers: [TitlesService],
})
export class TitlesModule {}