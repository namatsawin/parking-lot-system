import { CreateParkingLotDTO, ParkDTO } from '@/dtos/parking-lot.dto';
import { ParkingLotsService } from '@/services/parking-lots/parking-lots.service';
import { Body, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';

@Controller('parking-lots')
export class ParkingLotsController {
  constructor(private readonly parkingLotService: ParkingLotsService) {}

  @Get(':parkingLotId')
  @HttpCode(HttpStatus.OK)
  public async get(@Param('parkingLotId') parkingLotId: number) {
    return this.parkingLotService.getParkingLot(parkingLotId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(@Body() payload: CreateParkingLotDTO) {
    return this.parkingLotService.createParkingLot(payload);
  }
}
