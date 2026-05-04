import { IsNumber, IsOptional } from 'class-validator';

export class SensorReadingsDto {
  @IsOptional()
  @IsNumber()
  PM10?: number;

  @IsOptional()
  @IsNumber()
  PM2_5?: number;

  @IsNumber()
  CO!: number;

  @IsOptional()
  @IsNumber()
  O3?: number;

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
