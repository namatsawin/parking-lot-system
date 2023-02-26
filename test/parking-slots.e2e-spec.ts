import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/services/pisma.service';
import { CarSize } from '@prisma/client';

describe('ParkingSlotController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
    await prisma.parking_lot.deleteMany();
    await app.init();
  });

  describe('parking-lots/:parkingLotId/slots (GET)', () => {
    it('should return 200', async () => {
      const parkingLot = await prisma.parking_lot.create({
        data: { name: 'name', capacity: 1 },
      });
      const slot = await prisma.parking_slot.create({
        data: { slot_no: 1, parking_lot_id: parkingLot.id, is_allocated: true },
      });
      await prisma.ticket.create({
        data: {
          car_size: CarSize.MEDIUM,
          registration_no: 'name',
          parking_slot_id: slot.id,
        },
      });

      const response = await request(app.getHttpServer()).get(
        `/parking-lots/${parkingLot.id}/slots`,
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ slots: [slot] });
    });
  });
});
