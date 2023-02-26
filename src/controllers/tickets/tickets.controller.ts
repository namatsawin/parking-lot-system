import { CreateTicketDTO, QueryTicketListDTO } from '@/dtos/ticket.dto';
import { TicketService } from '@/services/ticket/ticket.service';
import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Controller } from '@nestjs/common';

@Controller('parking-lots/:parkingLotId/tickets')
export class TicketsController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  public async getList(
    @Param('parkingLotId') parkingLotId: number,
    @Query() query: QueryTicketListDTO,
  ) {
    return this.ticketService.getTicketList(parkingLotId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Param('parkingLotId') parkingLotId: number,
    @Body() payload: CreateTicketDTO,
  ) {
    return this.ticketService.createTicket(parkingLotId, payload);
  }

  @Delete(':ticketId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param('ticketId') ticketId: number) {
    return this.ticketService.deleteTicket(ticketId);
  }
}
