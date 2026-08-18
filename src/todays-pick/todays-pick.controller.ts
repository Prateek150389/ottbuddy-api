import { Controller, Get } from '@nestjs/common';
import { TodaysPickService } from './todays-pick.service';

@Controller('todays-pick')
export class TodaysPickController {
  constructor(
    private readonly todaysPickService: TodaysPickService,
  ) {}

  @Get()
  getTodaysPick() {
    return this.todaysPickService.getTodaysPick();
  }
}
