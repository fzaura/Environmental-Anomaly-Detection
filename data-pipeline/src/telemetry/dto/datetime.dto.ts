import { Type } from 'class-transformer';
import { IsDate, IsDefined } from 'class-validator';

export class DateTimeDto {
  @IsDefined()
  @IsDate()
  @Type(() => Date)
  readonly utc!: Date;
}
