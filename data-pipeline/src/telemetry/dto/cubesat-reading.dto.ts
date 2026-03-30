import {
  IsArray,
  IsDate,
  IsInt,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AnomalyDto } from './anomaly.dto';
import { Type } from 'class-transformer';

export class CubesatReading {
  @IsString()
  readonly SatelliteId!: string;

  @IsInt()
  readonly TotalAnomaliesDetected!: number;

  @Type(() => Date)
  @IsDate()
  readonly TransmissionTime!: Date;

  @ValidateNested({ each: true })
  @Type(() => AnomalyDto)
  @IsArray()
  readonly Events!: AnomalyDto[];
}
