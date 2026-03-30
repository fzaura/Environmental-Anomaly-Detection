import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { DateTimeDto } from './datetime.dto';
import { CoordinatesDto } from './coordinate.dto';
import { SensorReadingsDto } from './sensor-readings.dto';

export class AnomalyDto {
  @IsDefined()
  @Type(() => DateTimeDto)
  @ValidateNested()
  readonly datetime!: DateTimeDto;

  @IsDefined()
  @Type(() => CoordinatesDto)
  @ValidateNested()
  readonly coordinates!: CoordinatesDto;

  @IsDefined()
  @Type(() => SensorReadingsDto)
  @ValidateNested()
  readonly sensorReadings!: SensorReadingsDto;
}
