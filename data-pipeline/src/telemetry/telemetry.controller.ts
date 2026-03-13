import { Body, Controller, Post } from '@nestjs/common';
import { ReadingDto } from './dto/reading.dto';

@Controller('telemetry')
export class TelemetryController {
  @Post()
  ingestReading(@Body() data: ReadingDto) {
    console.log(data);
    return { status: 'received' };
  }
}
