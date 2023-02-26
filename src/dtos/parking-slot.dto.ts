import { CarSize } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export class QuerySlotListDTO {
  @IsOptional()
  @IsEnum(CarSize)
  carSize?: CarSize;

  @IsOptional()
  @Transform(({ value }) => ({ true: true, false: false }[value]))
  isAllocated?: boolean;
}
