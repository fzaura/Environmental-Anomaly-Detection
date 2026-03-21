import { Injectable } from '@nestjs/common';
import { ReadingDto } from './dto/reading.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CoordinatesDto } from './dto/coordinate.dto';

@Injectable()
export class TelemetryService {
  private readonly sensorMap: Record<number, string> = {
    3916: 'SO2',
    3917: 'O3',
    3918: 'NO2',
    3919: 'PM10',
    3920: 'PM2_5',
    25227: 'CO',
    4272103: 'temperature',
    4272226: 'humidity',
  };
  constructor(private readonly prismaService: PrismaService) {}

  async saveTelemetry(data: ReadingDto[]) {
    const groupedData: Record<string, Record<string, number | object>> = {};

    data.forEach((reading) => {
      const readingType = this.sensorMap[reading.sensorsId];
      const { datetime, locationsId, coordinates } = reading;
      const isoString = datetime.utc.toISOString();

      if (!groupedData[isoString]) {
        groupedData[isoString] = { locationsId, coordinates };
      }

      if (readingType) {
        groupedData[isoString] = {
          ...groupedData[isoString],
          [readingType]: reading.value,
        };
      }
    });
    await Promise.all(
      Object.entries(groupedData).map(([timestampKey, bucketValue]) => {
        const { locationsId, coordinates, ...dynamicSensors } = bucketValue;
        const datetime = new Date(timestampKey);

        const hourOfTheDay = datetime.getUTCHours();
        const dayOfTheWeek = datetime.getUTCDay();
        const month = datetime.getUTCMonth() + 1;

        const { longitude, latitude } = coordinates as CoordinatesDto;

        return this.prismaService.telemetry.upsert({
          where: {
            stationId_recordedAt: {
              stationId: locationsId as number,
              recordedAt: datetime,
            },
          },
          update: {
            stationId: locationsId as number,
            longitude,
            latitude,
            hourOfTheDay,
            dayOfTheWeek,
            month,
            recordedAt: datetime,
            ...dynamicSensors,
          },
          create: {
            stationId: locationsId as number,
            longitude,
            latitude,
            hourOfTheDay,
            dayOfTheWeek,
            month,
            recordedAt: datetime,
            ...dynamicSensors,
          },
        });
      }),
    );
  }
}
