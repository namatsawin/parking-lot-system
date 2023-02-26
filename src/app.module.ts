import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ParkingLotsController } from './controllers/parking-lot/parking-lot.controller';
import { ParkingSLotController } from './controllers/parking-slot/parking-slot.controller';
import { TicketsController } from './controllers/tickets/tickets.controller';
import { ParkingLotsService } from './services/parking-lots/parking-lots.service';
import { ParkingSlotService } from './services/parking-slot/parking-slot.service';
import { PrismaService } from './services/pisma.service';
import { TicketService } from './services/ticket/ticket.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [
    ParkingLotsController,
    TicketsController,
    ParkingSLotController,
  ],
  providers: [
    PrismaService,
    ParkingLotsService,
    TicketService,
    ParkingSlotService,
  ],
})
export class AppModule {}
