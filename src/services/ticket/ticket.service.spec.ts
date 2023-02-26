import { CreateTicketDTO } from '@/dtos/ticket.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CarSize } from '@prisma/client';
import { ParkingSlotService } from '../parking-slot/parking-slot.service';
import { PrismaService } from '../pisma.service';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
  let service: TicketService;
  let prisma: PrismaService;
  let slotService: ParkingSlotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketService, PrismaService, ParkingSlotService],
    }).compile();

    service = module.get<TicketService>(TicketService);
    slotService = module.get<ParkingSlotService>(ParkingSlotService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTicketList', () => {
    it('should get ticket list successfully', async () => {
      const inputId = 1;
      const output = {
        tickets: [],
      };
      prisma.ticket.findMany = jest.fn().mockResolvedValueOnce(output.tickets);
      const actual = await service.getTicketList(inputId);
      expect(actual).toEqual(output);
    });
  });

  describe('createTicket', () => {
    it('should has been succesfully created', async () => {
      const inputParkingId = 1;
      const inputCarInfo: CreateTicketDTO = {
        registration_no: 'TEST',
        size: CarSize.MEDIUM,
      };
      const output = {
        ticket: {
          id: 1,
          registration_no: inputCarInfo.registration_no,
          car_size: inputCarInfo.size,
          entry_time: new Date(),
          exit_time: null,
          slot_no: 1,
          is_allocated: true,
          parking_lot_id: inputParkingId,
        },
      };

      slotService.getAvailableSlot = jest.fn().mockResolvedValueOnce({ id: 1 });
      prisma.$transaction = jest.fn().mockResolvedValueOnce([
        output.ticket,
        {
          slot_no: output.ticket.slot_no,
          is_allocated: true,
          parking_lot_id: inputParkingId,
        },
      ]);
      const actual = await service.createTicket(inputParkingId, inputCarInfo);
      expect(actual).toEqual(output);
    });

    it('should throw correctly if the parking lot does not exist', async () => {
      const inputParkingId = 1;
      const inputCarInfo: CreateTicketDTO = {
        registration_no: 'TEST',
        size: CarSize.MEDIUM,
      };
      const output = new NotFoundException(
        'The parking lot could not be found.',
      );

      prisma.parking_lot.findFirst = jest.fn().mockResolvedValueOnce(undefined);
      expect(
        service.createTicket(inputParkingId, inputCarInfo),
      ).rejects.toThrow(output);
    });

    it('should throw correctly if the parking lot is full', async () => {
      const inputParkingId = 1;
      const inputCarInfo: CreateTicketDTO = {
        registration_no: 'TEST',
        size: CarSize.MEDIUM,
      };

      const output = new ForbiddenException(
        'Sorry, The parking lot is full. Please try again later.',
      );
      prisma.parking_lot.findFirst = jest
        .fn()
        .mockResolvedValueOnce({ id: inputParkingId });

      prisma.parking_slot.findFirst = jest
        .fn()
        .mockResolvedValueOnce(undefined);

      expect(
        service.createTicket(inputParkingId, inputCarInfo),
      ).rejects.toThrow(output);
    });
  });

  describe('DeleteTicket', () => {
    it('should has been deleted successfully', () => {
      const inputId = 123;
      prisma.ticket.findFirst = jest
        .fn()
        .mockResolvedValueOnce({ id: inputId });

      prisma.$transaction = jest.fn().mockResolvedValueOnce([]);

      expect(service.deleteTicket(inputId)).resolves.not.toThrow();
    });

    it('should throw correctly if the ticket does not exist', () => {
      const inputId = 123;
      const output = new NotFoundException('The ticket could not be found.');
      prisma.ticket.findFirst = jest.fn().mockResolvedValueOnce(undefined);
      expect(service.deleteTicket(inputId)).rejects.toThrow(output);
    });
  });
});
