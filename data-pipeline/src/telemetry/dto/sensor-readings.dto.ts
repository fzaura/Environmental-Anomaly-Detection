import { IsNumber, IsOptional } from 'class-validator';

export class SensorReadingsDto {
  @IsNumber()
  PM10!: number;

  @IsNumber()
  PM2_5!: number;

  @IsNumber()
  CO!: number;

  @IsNumber()
  O3!: number;

  @IsNumber()
  Temperature!: number;

  @IsNumber()
  Humidity!: number;

  @IsOptional()
  @IsNumber()
  Absolute_Humidity_Proxy?: number;

  @IsOptional()
  @IsNumber()
  CO_to_Temp_Ratio?: number;
}
