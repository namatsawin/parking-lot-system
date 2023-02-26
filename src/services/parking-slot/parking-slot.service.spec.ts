import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../pisma.service';
import { ParkingSlotService } from './parking-slot.service';

describe('ParkingSlotService', () => {
  let service: ParkingSlotService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParkingSlotService, PrismaService],
    }).compile();

    service = module.get<ParkingSlotService>(ParkingSlotService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSlotList', () => {
    it('should get slot list successfully', async () => {
      const inputId = 1;
      const output = {
        slots: [
          { id: 1, slot_no: 1, is_allocated: false, parking_lot_id: inputId },
        ],
      };
      prisma.parking_slot.findMany = jest
        .fn()
        .mockResolvedValueOnce(output.slots);
      const actual = await service.getSlotList(inputId);
      expect(actual).toEqual(output);
    });
  });

  describe('getAvailableSlot', () => {
    it('should get available slot succesfully', async () => {
      const inputId = 1;
      const output = {
        id: 1,
        slot_no: 1,
        is_allocated: false,
        parking_lot_id: inputId,
      };
      prisma.parking_lot.findFirst = jest
        .fn()
        .mockResolvedValueOnce({ id: inputId });

      prisma.parking_slot.findFirst = jest.fn().mockResolvedValueOnce(output);

      const actual = await service.getAvailableSlot(inputId);
      expect(actual).toEqual(output);
    });

    it('should throw correctly if the parking lot does not exist', async () => {
      const inputId = 1;
      const output = new NotFoundException(
        'The parking lot could not be found.',
      );
      prisma.parking_lot.findFirst = jest.fn().mockResolvedValueOnce(undefined);

      expect(service.getAvailableSlot(inputId)).rejects.toThrow(output);
    });

    it('should throw correctly if the parking lot is full', async () => {
      const inputId = 1;
      const output = new ForbiddenException(
        'Sorry, The parking lot is full. Please try again later.',
      );
      prisma.parking_lot.findFirst = jest
        .fn()
        .mockResolvedValueOnce({ id: inputId });

      prisma.parking_slot.findFirst = jest
        .fn()
        .mockResolvedValueOnce(undefined);

      expect(service.getAvailableSlot(inputId)).rejects.toThrow(output);
    });
  });
});
