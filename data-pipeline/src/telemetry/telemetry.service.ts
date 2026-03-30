import { Injectable } from '@nestjs/common';
import { ReadingDto } from './dto/openaq-reading.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CoordinatesDto } from './dto/coordinate.dto';
import { CubesatReading } from './dto/cubesat-reading.dto';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: configService.get<string>('GMAIL_USER'),
        pass: configService.get<string>('GMAIL_APP_PASSWORD'),
      },
    });
  }

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

  async sendAnomalyReportToUser(report: CubesatReading) {
    console.log('Anomalies detected. Sending report to user');

    const eventsHtml = report.Events.map(
      (event, index) => `
      <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fcfcfc;">
        <h3 style="margin-top: 0; color: #d9534f; border-bottom: 2px solid #eee; padding-bottom: 5px;">
          ⚠️ Event #${index + 1}
        </h3>
        <p style="margin: 5px 0;"><strong>Time (UTC):</strong> ${new Date(event.datetime.utc).toLocaleString()}</p>
        <p style="margin: 5px 0 15px 0;"><strong>Location:</strong> Lat: ${event.coordinates.latitude}, Lng: ${event.coordinates.longitude}</p>
        
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background-color: #f1f1f1;">
              <th style="padding: 8px; border: 1px solid #ddd;">Sensor</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Reading</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">PM2.5</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${event.sensorReadings.PM2_5}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">PM10</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${event.sensorReadings.PM10}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">CO</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${event.sensorReadings.CO}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">O3</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${event.sensorReadings.O3}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Temperature</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${event.sensorReadings.Temperature}°C</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Humidity</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${event.sensorReadings.Humidity}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
    ).join('');

    const mailOptions = {
      from: `"CubeSat Ground Control" <${this.configService.get<string>('GMAIL_USER')}>`,
      to: this.configService.get<string>('GMAIL_USER'),
      subject: `CRITICAL: ${report.TotalAnomaliesDetected} Anomalies on ${report.SatelliteId}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-top: 5px solid #d9534f; border-radius: 8px;">
          <h2 style="color: #d9534f; margin-top: 0;">🛰️ CubeSat Anomaly Alert</h2>
          <p style="font-size: 16px;"><strong>Satellite ID:</strong> ${report.SatelliteId}</p>
          <p style="font-size: 16px;"><strong>Transmission Time:</strong> ${new Date(report.TransmissionTime).toLocaleString()}</p>
          <p style="font-size: 16px;"><strong>Total Events Detected:</strong> <span style="color: #d9534f; font-weight: bold;">${report.TotalAnomaliesDetected}</span></p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
          
          <h3 style="color: #555;">Detailed Event Logs:</h3>
          ${eventsHtml}
          
          <p style="font-size: 0.85em; color: #888; margin-top: 30px; text-align: center;">
            This is an automated alert generated by the NestJS Ground Control Telemetry Service.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email report sent successfully.');
    } catch (error) {
      console.error('Failed to send report. Check credentials.', error);
    }
  }
}
