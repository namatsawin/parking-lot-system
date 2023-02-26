import { Test, TestingModule } from '@nestjs/testing';
import { CreateParkingLotDTO } from '@/dtos/parking-lot.dto';
import { ParkingLotsService } from '../parking-lots/parking-lots.service';
import { PrismaService } from '../pisma.service';
import { Prisma } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ParkingLotsService', () => {
  let service: ParkingLotsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParkingLotsService, PrismaService],
    }).compile();

    service = module.get<ParkingLotsService>(ParkingLotsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createParkingLot', () => {
    const input: CreateParkingLotDTO = {
      name: 'parking-lot-test',
      capacity: 10,
    };
    it('should has been successfully completed.', async () => {
      prisma.parking_lot.create = jest.fn().mockResolvedValueOnce({
        id: 1,
        name: input.name,
        capacity: input.capacity,
        created_at: new Date(),
      });
      prisma.parking_slot.createMany = jest
        .fn()
        .mockResolvedValueOnce({ count: input.capacity });

      const actual = await service.createParkingLot(input);
      expect(actual.parkingLot.id).toEqual(1);
    });

    it('should throw correctly if there is a unique constraint violation', async () => {
      const output = new ConflictException(
        'There is a unique constraint violation, a new parking lot cannot be created with this name',
      );
      prisma.parking_lot.create = jest.fn().mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('', {
          code: 'P2002',
          clientVersion: '1',
        }),
      );
      expect(service.createParkingLot(input)).rejects.toThrow(output);
    });
  });

  describe('getParkingLot', () => {
    it('should get parking lot successfully', async () => {
      const inputId = 1;
      const output = { parkingLot: { id: inputId } };

      prisma.parking_lot.findFirst = jest
        .fn()
        .mockResolvedValueOnce({ id: inputId });

      const actual = await service.getParkingLot(inputId);
      expect(actual).toEqual(output);
    });

    it('should throw correctly if the parking lot does not exist', async () => {
      const inputId = 1;
      const output = new NotFoundException(
        'The parking lot could not be found.',
      );

      prisma.parking_lot.findFirst = jest.fn().mockResolvedValueOnce(undefined);

      expect(service.getParkingLot(inputId)).rejects.toThrow(output);
    });
  });

  // describe('parkCar', () => {
  //   const input: ParkDTO = {
  //     registration_no: 'test',
  //     parking_lot_id: 1,
  //     size: CarSize.MEDIUM,
  //   };

  //   it('should has been successfully completed', async () => {
  //     const output = {
  //       ticket: {
  //         registration_no: input.registration_no,
  //         slot_no: 1,
  //         entry_time: new Date(),
  //         exit_time: null,
  //         car_size: input.size,
  //         is_allocated: false,
  //       },
  //     };

  //     prisma.parking_lot.findFirst = jest.fn().mockResolvedValueOnce({ id: 1 });

  //     prisma.parking_slot.findFirst = jest
  //       .fn()
  //       .mockResolvedValueOnce({ id: 1 });

  //     prisma.$transaction = jest.fn().mockResolvedValueOnce([
  //       {
  //         registration_no: output.ticket.registration_no,
  //         car_size: output.ticket.car_size,
  //         entry_time: output.ticket.entry_time,
  //         exit_time: output.ticket.exit_time,
  //       },
  //       {
  //         slot_no: output.ticket.slot_no,
  //         is_allocated: output.ticket.is_allocated,
  //       },
  //     ]);

  //     const actual = await service.parkCar(input);

  //     expect(actual).toEqual(output);
  //   });

  //   it('should throw correctly if the parking lot does not exist', async () => {
  //     const output = new NotFoundException(
  //       'The parking lot could not be found.',
  //     );
  //     prisma.parking_lot.findFirst = jest.fn().mockResolvedValueOnce(undefined);

  //     expect(service.parkCar(input)).rejects.toThrow(output);
  //   });

  //   it('should throw correctly if no parking slot available', async () => {
  //     const output = new ForbiddenException(
  //       'Sorry, The parking lot is full. Please try again later.',
  //     );
  //     prisma.parking_lot.findFirst = jest.fn().mockResolvedValueOnce({ id: 1 });

  //     prisma.parking_slot.findFirst = jest
  //       .fn()
  //       .mockResolvedValueOnce(undefined);

  //     expect(service.parkCar(input)).rejects.toThrow(output);
  //   });
  // });
});
