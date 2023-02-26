import { CreateTicketDTO, QueryTicketListDTO } from '@/dtos/ticket.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ParkingSlotService } from '../parking-slot/parking-slot.service';
import { PrismaService } from '../pisma.service';

@Injectable()
export class TicketService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly parkingSlotService: ParkingSlotService,
  ) {}

  public async getTicketList(
    parkingLotId: number,
    filter?: QueryTicketListDTO,
  ) {
    const tickets = await this.prismaService.ticket.findMany({
      where: {
        car_size: filter?.carSize,
        parking_slot: { parking_lot_id: parkingLotId },
        exit_time: null,
      },
    });

    return { tickets };
  }

  public async createTicket(parkingLotId: number, payload: CreateTicketDTO) {
    const availableSlot = await this.parkingSlotService.getAvailableSlot(
      parkingLotId,
    );

    const [ticket, slot] = await this.prismaService.$transaction([
      this.prismaService.ticket.create({
        data: {
          parking_slot_id: availableSlot.id,
          registration_no: payload.registration_no,
          car_size: payload.size,
          entry_time: new Date(),
        },
        select: {
          id: true,
          registration_no: true,
          car_size: true,
          entry_time: true,
          exit_time: true,
        },
      }),
      this.prismaService.parking_slot.update({
        where: { id: availableSlot.id },
        data: { is_allocated: true },
        select: { slot_no: true, is_allocated: true, parking_lot_id: true },
      }),
    ]);

    return { ticket: { ...ticket, ...slot } };
  }

  public async deleteTicket(ticketId: number) {
    const ticket = await this.prismaService.ticket.findFirst({
      where: { id: ticketId },
    });

    if (!ticket) throw new NotFoundException('The ticket could not be found.');

    await this.prismaService.$transaction([
      this.prismaService.ticket.update({
        where: { id: ticket.id },
        data: { exit_time: new Date() },
      }),
      this.prismaService.parking_slot.update({
        where: { id: ticket.parking_slot_id },
        data: { is_allocated: false },
      }),
    ]);
  }
}
