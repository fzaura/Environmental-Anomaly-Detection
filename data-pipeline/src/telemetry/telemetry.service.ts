import { Injectable } from '@nestjs/common';
import { ReadingDto } from './dto/reading.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TelemetryService {
  private readonly sensorMap: Record<number, string> = {
    4247: 'temperature',
    4237: 'humidity',
    4231: 'CO',
    162: 'NO2',
  };
  constructor(private readonly prismaService: PrismaService) {}

  async saveTelemetry(data: ReadingDto[]) {
    const { datetime, locationsId, coordinates } = data[0];
    const aggregatedPayload = data.reduce((row, reading) => {
      const readingType = this.sensorMap[reading.sensorsId];

      return { ...row, [readingType]: reading.value };
    }, {});

    const hourOfTheDay = datetime.utc.getUTCHours();
    const dayOfTheWeek = datetime.utc.getUTCDay();
    const month = datetime.utc.getUTCMonth();
    const { longitude, latitude } = coordinates;

    await this.prismaService.telemetry.create({
      data: {
        ...aggregatedPayload,
        hourOfTheDay,
        dayOfTheWeek,
        month,
        stationId: locationsId,
        recordedAt: datetime.utc,
        longitude,
        latitude,
      },
    });
  }
}
