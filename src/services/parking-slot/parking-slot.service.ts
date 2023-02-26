import { QuerySlotListDTO } from '@/dtos/parking-slot.dto';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../pisma.service';

@Injectable()
export class ParkingSlotService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getSlotList(parkingLotId: number, filter?: QuerySlotListDTO) {
    const slots = await this.prismaService.parking_slot.findMany({
      where: {
        parking_lot_id: parkingLotId,
        is_allocated: filter?.isAllocated,
        tickets: { some: { car_size: filter?.carSize, exit_time: null } },
      },
    });

    return { slots };
  }

  public async getAvailableSlot(parkingLotId: number) {
    const parkingLot = await this.prismaService.parking_lot.findFirst({
      where: { id: parkingLotId, deleted_at: null },
      select: { id: true },
    });

    if (!parkingLot)
      throw new NotFoundException('The parking lot could not be found.');

    const slot = await this.prismaService.parking_slot.findFirst({
      where: {
        parking_lot_id: parkingLot.id,
        is_allocated: false,
      },
      // To sort for getting the nearest one
      orderBy: { slot_no: 'asc' },
    });

    if (!slot)
      throw new ForbiddenException(
        'Sorry, The parking lot is full. Please try again later.',
      );

    return slot;
  }
}
