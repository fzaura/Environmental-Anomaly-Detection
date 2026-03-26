import { Controller, Get } from '@nestjs/common';
import { OpenaqService } from './openaq.service';

@Controller('openaq')
export class OpenaqController {
  constructor(private readonly openaqService: OpenaqService) {}

  // Trigger for the live harvester (Approach A)
  @Get('test-live')
  async testLiveFetch() {
    await this.openaqService.fetchFromOpenAq();
    return {
      message:
        'Live data fetch triggered successfully. Check terminal for logs.',
    };
  }

  // Trigger for the historical seeder
  @Get('seed')
  async seedData() {
    return await this.openaqService.seedHistoricalData();
  }
}
