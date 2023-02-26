import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateParkingLotDTO } from '@/dtos/parking-lot.dto';
import { PrismaService } from '../pisma.service';

@Injectable()
export class ParkingLotsService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getParkingLot(parkingLotId: number) {
    const parkingLot = await this.prismaService.parking_lot.findFirst({
      where: { id: parkingLotId },
      include: {
        parking_slots: {
          select: { id: true, slot_no: true, is_allocated: true },
          orderBy: { slot_no: 'asc' },
        },
      },
    });

    if (!parkingLot)
      throw new NotFoundException('The parking lot could not be found.');

    return { parkingLot };
  }

  public async createParkingLot(payload: CreateParkingLotDTO) {
    try {
      const parkingLot = await this.prismaService.parking_lot.create({
        data: {
          name: payload.name,
          capacity: payload.capacity,
        },
        select: { id: true, name: true, capacity: true, created_at: true },
      });

      await this.prismaService.parking_slot.createMany({
        data: Array.from(Array(parkingLot.capacity).keys()).map((key) => ({
          slot_no: key + 1,
          parking_lot_id: parkingLot.id,
          is_allocated: false,
        })),
      });

      return { parkingLot };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            'There is a unique constraint violation, a new parking lot cannot be created with this name',
          );
        }
      }
      throw error;
    }
  }
}
