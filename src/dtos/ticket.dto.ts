import { CarSize } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class QueryTicketListDTO {
  @IsOptional()
  @IsEnum(CarSize)
  carSize?: CarSize;
}

export class CreateTicketDTO {
  @IsString()
  registration_no: string;

  @IsEnum(CarSize)
  size: CarSize;
}
