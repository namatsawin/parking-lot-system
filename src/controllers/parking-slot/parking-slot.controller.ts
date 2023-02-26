import { QuerySlotListDTO } from '@/dtos/parking-slot.dto';
import { ParkingSlotService } from '@/services/parking-slot/parking-slot.service';
import { Get, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { Controller } from '@nestjs/common';

@Controller('parking-lots/:parkingLotId/slots')
export class ParkingSLotController {
  constructor(private readonly parkingSlotService: ParkingSlotService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  public async get(
    @Param('parkingLotId') parkingLotId: number,
    @Query() query: QuerySlotListDTO,
  ) {
    return this.parkingSlotService.getSlotList(parkingLotId, query);
  }
}
