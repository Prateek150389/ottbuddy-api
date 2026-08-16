import { Module } from '@nestjs/common';
import { TmdbModule } from '../tmdb/tmdb.module';
import { TrendingService } from './trending.service';
import { TrendingController } from './trending.controller';

@Module({
  imports: [TmdbModule],
  providers: [TrendingService],
  controllers: [TrendingController],
})
export class TrendingModule {}
