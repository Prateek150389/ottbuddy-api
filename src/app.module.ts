import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { HealthModule } from './health/health.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { SearchModule } from './search/search.module';
import { TitlesModule } from './titles/titles.module';
import { TrendingModule } from './trending/trending.module';
import { TodaysPickModule } from './todays-pick/todays-pick.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    HealthModule,
    TmdbModule,
    SearchModule,
    TitlesModule,
    TrendingModule,
    TodaysPickModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}