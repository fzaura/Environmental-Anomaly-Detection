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

@Injectable()
export class OpenaqService {
  private readonly logger = new Logger(OpenaqService.name);

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

  // HISTORICAL SEEDER (Triggered manually)
  async seedHistoricalData() {
    this.logger.log('Starting historical data seeder...');
    const apiKey = this.configService.get<string>('X_API_KEY');
    const baseUrl = 'https://api.openaq.org/v3/locations/2178/measurements';

    const datetimeFrom = '2026-01-01T00:00:00Z';
    const datetimeTo = '2026-03-26T00:00:00Z';

    let totalIngested = 0;

    try {
      // Loop through 5 pages of 1000 items (5,000 raw sensor readings)
      for (let page = 1; page <= 5; page++) {
        this.logger.log(`Fetching historical page ${page}...`);
        const url = `${baseUrl}?datetime_from=${datetimeFrom}&datetime_to=${datetimeTo}&limit=1000&page=${page}`;

        const response = await firstValueFrom(
          this.httpService.get<OpenAqResponse>(url, {
            headers: { 'X-API-Key': apiKey },
          }),
        );

        const data = response.data.results;

        // If the API returns an empty array, we've reached the end of the history
        if (data.length === 0) {
          this.logger.log('No more historical data found. Stopping seeder.');
          break;
        }

        await this.telemetryService.saveTelemetry(data);
        totalIngested += data.length;

        // Industry Standard: Pause for 1 second to respect API rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
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
