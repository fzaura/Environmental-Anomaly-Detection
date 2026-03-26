import { Body, Controller, ParseArrayPipe, Post } from '@nestjs/common';
import { ReadingDto } from './dto/reading.dto';
import { TelemetryService } from './telemetry.service';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}
  @Post()
  async ingestReading(
    @Body(new ParseArrayPipe({ items: ReadingDto })) data: ReadingDto[],
  ) {
    return await this.telemetryService.saveTelemetry(data);
  }
}
