import { CarSize } from '@prisma/client';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class CreateParkingLotDTO {
  @IsString()
  name: string;

  @IsNumber()
  capacity: number;
}

export class ParkDTO {
  @IsNumber()
  parking_lot_id: number;

  @IsString()
  registration_no: string;

  @IsEnum(CarSize)
  size: CarSize;
}

export class LeaveCar {
  @IsNumber()
  parking_lot_id: number;

  @IsString()
  registration_no: string;

  @IsEnum(CarSize)
  size: CarSize;
}
