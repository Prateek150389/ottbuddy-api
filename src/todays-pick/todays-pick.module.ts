import { Module } from '@nestjs/common';
import { TitlesModule } from '../titles/titles.module';
import { TodaysPickController } from './todays-pick.controller';
import { TodaysPickService } from './todays-pick.service';

@Module({
  imports: [TitlesModule],
  controllers: [TodaysPickController],
  providers: [TodaysPickService],
})
export class TodaysPickModule {}
