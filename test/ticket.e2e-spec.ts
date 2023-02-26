import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/services/pisma.service';
import { CarSize } from '@prisma/client';
import { CreateTicketDTO } from '@/dtos/ticket.dto';
import { v4 as uuid } from 'uuid';
import { ParkingLotsService } from '@/services/parking-lots/parking-lots.service';

describe('TicketController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let parkingLotService: ParkingLotsService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    parkingLotService =
      moduleFixture.get<ParkingLotsService>(ParkingLotsService);
    await prisma.parking_lot.deleteMany();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('parking-lots/:parkingLotId/tickets (GET)', () => {
    it('should return 200', async () => {
      const parkingLot = await prisma.parking_lot.create({
        data: { name: uuid(), capacity: 1 },
      });
      const slot = await prisma.parking_slot.create({
        data: { slot_no: 1, parking_lot_id: parkingLot.id, is_allocated: true },
      });
      const ticket = await prisma.ticket.create({
        data: {
          car_size: CarSize.MEDIUM,
          registration_no: uuid(),
          parking_slot_id: slot.id,
        },
      });

      const response = await request(app.getHttpServer()).get(
        `/parking-lots/${parkingLot.id}/tickets`,
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ tickets: [ticket] });
    });
  });

  describe('parking-lots/:parkingLotId/tickets (POST)', () => {
    it('should return 201', async () => {
      const input: CreateTicketDTO = {
        registration_no: uuid(),
        size: CarSize.MEDIUM,
      };
      const { parkingLot } = await parkingLotService.createParkingLot({
        name: uuid(),
        capacity: 10,
      });

      const response = await request(app.getHttpServer())
        .post(`/parking-lots/${parkingLot.id}/tickets`)
        .send(input);

      expect(response.statusCode).toBe(201);
    });

    it('should return 404 if the parking lot does not exist', async () => {
      const input: CreateTicketDTO = {
        registration_no: uuid(),
        size: CarSize.SMALL,
      };
      const response = await request(app.getHttpServer())
        .post(`/parking-lots/404/tickets`)
        .send(input);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('The parking lot could not be found.');
    });

    it('should return 403 if the parking lot is full', async () => {
      const input: CreateTicketDTO = {
        registration_no: uuid(),
        size: CarSize.SMALL,
      };
      const parkingLot = await prisma.parking_lot.create({
        data: { name: uuid(), capacity: 0 },
      });

      const response = await request(app.getHttpServer())
        .post(`/parking-lots/${parkingLot.id}/tickets`)
        .send(input);

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toBe(
        'Sorry, The parking lot is full. Please try again later.',
      );
    });
  });

  describe('parking-lots/:parkingLotId/tickets (DELETE)', () => {
    it('should return 204', async () => {
      const parkingLot = await prisma.parking_lot.create({
        data: { name: uuid(), capacity: 1 },
      });
      const slot = await prisma.parking_slot.create({
        data: { slot_no: 1, parking_lot_id: parkingLot.id, is_allocated: true },
      });
      const ticket = await prisma.ticket.create({
        data: {
          car_size: CarSize.MEDIUM,
          registration_no: uuid(),
          parking_slot_id: slot.id,
        },
      });

      const response = await request(app.getHttpServer()).delete(
        `/parking-lots/${parkingLot.id}/tickets/${ticket.id}`,
      );

      expect(response.statusCode).toBe(204);
    });

    it('should return 404 if the ticket does not exist', async () => {
      const parkingLot = await prisma.parking_lot.create({
        data: { name: uuid(), capacity: 1 },
      });

      const response = await request(app.getHttpServer()).delete(
        `/parking-lots/${parkingLot.id}/tickets/404`,
      );

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('The ticket could not be found.');
    });
  });
});
