import { IsDefined, IsNumber } from 'class-validator';

export class CoordinatesDto {
  @IsDefined()
  @IsNumber()
  readonly longitude!: number;

  @IsDefined()
  @IsNumber()
  readonly latitude!: number;
}
