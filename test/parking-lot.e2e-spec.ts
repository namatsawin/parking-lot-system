import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/services/pisma.service';
import { CreateParkingLotDTO } from '@/dtos/parking-lot.dto';

describe('ParkingLotController (e2e)', () => {
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

  afterAll(async () => {
    await app.close();
  });

  describe('/:parkingLotId (GET)', () => {
    it('should return 200', async () => {
      const parkingLot = await prisma.parking_lot.create({
        data: { name: 'name', capacity: 10 },
      });
      const response = await request(app.getHttpServer()).get(
        `/parking-lots/${parkingLot.id}`,
      );

      expect(response.statusCode).toBe(200);
      expect(response.body.parkingLot.id).toBe(parkingLot.id);
    });

    it('should return 404 if the parking lot does not exist', async () => {
      const response = await request(app.getHttpServer()).get(
        `/parking-lots/404`,
      );

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('The parking lot could not be found.');
    });
  });

  describe('/ (POST)', () => {
    it('should return 201', async () => {
      const body: CreateParkingLotDTO = {
        name: 'name',
        capacity: 10,
      };
      const response = await request(app.getHttpServer())
        .post(`/parking-lots`)
        .send(body);

      expect(response.statusCode).toBe(201);
      expect(response.body.parkingLot.name).toBe(body.name);
      expect(response.body.parkingLot.capacity).toBe(body.capacity);
    });

    it('should return 409 if enter a duplicated name', async () => {
      const body: CreateParkingLotDTO = {
        name: 'parking-lot-test',
        capacity: 10,
      };
      await prisma.parking_lot.create({ data: body });
      const response = await request(app.getHttpServer())
        .post(`/parking-lots`)
        .send(body);

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe(
        'There is a unique constraint violation, a new parking lot cannot be created with this name',
      );
    });
  });
});
