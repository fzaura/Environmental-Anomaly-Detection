import { Body, Controller, ParseArrayPipe, Post } from '@nestjs/common';
import { ReadingDto } from './dto/openaq-reading.dto';
import { TelemetryService } from './telemetry.service';
import { CubesatReading } from './dto/cubesat-reading.dto';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post()
  async ingestReading(
    @Body(new ParseArrayPipe({ items: ReadingDto })) data: ReadingDto[],
  ) {
    return await this.telemetryService.saveTelemetry(data);
  }

  @Post('alerts')
  async sendAnomalyReportToUser(@Body() report: CubesatReading) {
    return await this.telemetryService.sendAnomalyReportToUser(report);
  }
}
