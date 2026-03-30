import { Controller, Get } from '@nestjs/common';
import { OpenaqService } from './openaq.service';

@Controller('openaq')
export class OpenaqController {
  constructor(private readonly openaqService: OpenaqService) {}

  @Get('test-live')
  async testLiveFetch() {
    await this.openaqService.fetchFromOpenAq();
    return {
      message:
        'Live data fetch triggered successfully. Check terminal for logs.',
    };
  }

  @Get('seed')
  async seedData() {
    return await this.openaqService.seedHistoricalData();
  }
}
