import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { TelemetryService } from '../telemetry/telemetry.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { ReadingDto } from '../telemetry/dto/reading.dto';

interface OpenAqResponse {
  results: ReadingDto[];
}

interface RawOpenAqMeasurement {
  value: number;
  datetime?: { utc: string; local?: string };
  period?: { datetimeTo: { utc: string; local?: string } };
  coordinates?: { latitude: number; longitude: number };
}

interface OpenAqHistoricalResponse {
  results: RawOpenAqMeasurement[];
}

@Injectable()
export class OpenaqService {
  private readonly logger = new Logger(OpenaqService.name);

  // Your exact sensor map mapping OpenAQ IDs to your database columns
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

  constructor(
    private readonly httpService: HttpService,
    private readonly telemetryService: TelemetryService,
    private readonly configService: ConfigService,
  ) {}

  // LIVE HARVESTER (Runs automatically)
  @Cron(CronExpression.EVERY_30_MINUTES)
  async fetchFromOpenAq() {
    try {
      this.logger.log('Waking up: Fetching live data from OpenAQ...');
      const url = 'https://api.openaq.org/v3/locations/2178/latest';
      const apiKey = this.configService.get<string>('X_API_KEY');

      const response = await firstValueFrom(
        this.httpService.get<OpenAqResponse>(url, {
          headers: { 'X-API-Key': apiKey },
        }),
      );

      const data = response.data.results;
      await this.telemetryService.saveTelemetry(data);
      this.logger.log(`Success: Ingested ${data.length} live sensor readings.`);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          'Failed to fetch live data from OpenAQ',
          error.message,
        );
      } else {
        this.logger.error(
          'Failed to fetch live data from OpenAQ',
          String(error),
        );
      }
    }
  }

  // HISTORICAL SEEDER (Triggered manually via Controller)
  async seedHistoricalData() {
    this.logger.log('Starting historical data seeder...');
    const apiKey = this.configService.get<string>('X_API_KEY');

    // Dynamically extract the numeric IDs from your map
    const targetSensors = Object.keys(this.sensorMap).map(Number);

    const datetimeFrom = '2026-01-01T00:00:00Z';
    const datetimeTo = '2026-03-26T00:00:00Z';

    let totalIngested = 0;

    try {
      // Outer Loop: Iterate through each specific sensor
      for (const sensorId of targetSensors) {
        const sensorName = this.sensorMap[sensorId];
        this.logger.log(
          `--- Fetching history for Sensor ID: ${sensorId} (${sensorName}) ---`,
        );

        const baseUrl = `https://api.openaq.org/v3/sensors/${sensorId}/measurements`;

        // Inner Loop: Fetch up to 5 pages (5,000 readings) per sensor
        for (let page = 1; page <= 5; page++) {
          this.logger.log(`Fetching page ${page} for ${sensorName}...`);
          const url = `${baseUrl}?datetime_from=${datetimeFrom}&datetime_to=${datetimeTo}&limit=1000&page=${page}`;

          const response = await firstValueFrom(
            this.httpService.get<OpenAqHistoricalResponse>(url, {
              headers: { 'X-API-Key': apiKey },
            }),
          );

          const rawData = response.data.results;

          // If a specific sensor has less than 5 pages of history, break early
          if (rawData.length === 0) {
            this.logger.log(
              `End of history reached for ${sensorName}. Moving to next sensor.`,
            );
            break;
          }

          // ADAPTER: Normalize the strictly-typed historical payload to perfectly match your ReadingDto
          const normalizedData = rawData.map((item) => {
            // Safely extract the date object regardless of whether it is live or historical
            const rawDate =
              item.datetime || (item.period && item.period.datetimeTo);

            return {
              sensorsId: sensorId,
              locationsId: 2178,
              value: item.value,
              datetime: {
                utc: new Date(rawDate!.utc), // THE FIX: Instantiate a real JS Date object
                local: rawDate!.local,
              },
              coordinates: item.coordinates || {
                latitude: 35.1353,
                longitude: -106.584702,
              },
            };
          });

          // Pass the perfectly mapped data to your database
          await this.telemetryService.saveTelemetry(
            normalizedData as ReadingDto[],
          );
          totalIngested += normalizedData.length;

          // Pause for 1 second to respect API rate limits and avoid bans
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      this.logger.log(
        `Seeder Complete: Ingested ${totalIngested} total historical readings.`,
      );
      return { message: `Successfully seeded ${totalIngested} readings` };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error('Seeder failed', error.message);
      } else {
        this.logger.error('Seeder failed', String(error));
      }
      throw error;
    }
  }
}
