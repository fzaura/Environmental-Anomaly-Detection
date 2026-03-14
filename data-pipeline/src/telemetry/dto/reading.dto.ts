import { IsDefined, IsNumber, ValidateNested } from 'class-validator';
import { CoordinatesDto } from './coordinate.dto';
import { DateTimeDto } from './datetime.dto';
import { Type } from 'class-transformer';

export class ReadingDto {
  @IsDefined()
  @Type(() => DateTimeDto)
  @ValidateNested()
  readonly datetime!: DateTimeDto;

  @IsDefined()
  @IsNumber()
  readonly value!: number;

  @IsDefined()
  @Type(() => CoordinatesDto)
  @ValidateNested()
  readonly coordinates!: CoordinatesDto;

  @IsDefined()
  @IsNumber()
  readonly sensorsId!: number;

  @IsDefined()
  @IsNumber()
  readonly locationsId!: number;
}
