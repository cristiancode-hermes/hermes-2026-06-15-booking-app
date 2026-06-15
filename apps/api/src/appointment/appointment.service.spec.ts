import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { AppointmentService } from './appointment.service';
import { Appointment } from './appointment.entity';
import { Service } from '../service/service.entity';

const mockAppointmentRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockServiceRepo = {
  findOne: jest.fn(),
};

describe('AppointmentService', () => {
  let service: AppointmentService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        { provide: getRepositoryToken(Appointment), useValue: mockAppointmentRepo },
        { provide: getRepositoryToken(Service), useValue: mockServiceRepo },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
  });

  const mockService: Service = {
    id: 1,
    businessId: 1,
    name: 'Classic Haircut',
    description: 'A standard haircut',
    duration: 30,
    price: 30,
    isActive: true,
    createdAt: new Date(),
  };

  const futureStart = new Date();
  futureStart.setDate(futureStart.getDate() + 1);
  futureStart.setHours(10, 0, 0, 0);

  const futureEnd = new Date(futureStart.getTime() + 30 * 60 * 1000);

  const validDto = {
    businessId: 1,
    serviceId: 1,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '555-0100',
    startTime: futureStart.toISOString(),
    notes: null,
  };

  describe('create', () => {
    it('should create an appointment when no conflicts exist', async () => {
      mockServiceRepo.findOne.mockResolvedValue(mockService);
      mockAppointmentRepo.find.mockResolvedValue([]); // no conflicts
      mockAppointmentRepo.create.mockReturnValue({ id: 1, ...validDto, startTime: futureStart, endTime: futureEnd });
      mockAppointmentRepo.save.mockResolvedValue({ id: 1, ...validDto, startTime: futureStart, endTime: futureEnd, status: 'confirmed' });

      const result = await service.create(validDto as any);

      expect(result.status).toBe('confirmed');
      expect(mockAppointmentRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            businessId: 1,
            status: 'confirmed',
            startTime: expect.any(Object),
            endTime: expect.any(Object),
          }),
        }),
      );
    });

    it('should throw ConflictException when overlapping appointments exist', async () => {
      mockServiceRepo.findOne.mockResolvedValue(mockService);
      mockAppointmentRepo.find.mockResolvedValue([
        { id: 10, startTime: futureStart, endTime: futureEnd, status: 'confirmed' },
      ]);

      await expect(service.create(validDto as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create appointment when overlapping appointment is cancelled', async () => {
      mockServiceRepo.findOne.mockResolvedValue(mockService);
      // only cancelled appointments overlap
      mockAppointmentRepo.find.mockResolvedValue([]);
      mockAppointmentRepo.create.mockReturnValue({ id: 2, ...validDto, startTime: futureStart, endTime: futureEnd });
      mockAppointmentRepo.save.mockResolvedValue({ id: 2, ...validDto, startTime: futureStart, endTime: futureEnd, status: 'confirmed' });

      const result = await service.create(validDto as any);
      expect(result.id).toBe(2);
    });

    it('should throw NotFoundException when service does not exist', async () => {
      mockServiceRepo.findOne.mockResolvedValue(null);

      await expect(service.create(validDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should find all appointments for a business', async () => {
      const mockAppointments = [
        { id: 1, businessId: 1, startTime: new Date(), endTime: new Date(), status: 'confirmed', business: { id: 1 }, service: { id: 1 } },
      ];
      mockAppointmentRepo.find.mockResolvedValue(mockAppointments);

      const result = await service.findAll(1);
      expect(result).toHaveLength(1);
      expect(mockAppointmentRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { businessId: 1 },
        }),
      );
    });

    it('should filter by date when provided', async () => {
      mockAppointmentRepo.find.mockResolvedValue([]);
      const dateStr = '2026-06-16';

      await service.findAll(1, dateStr);

      expect(mockAppointmentRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            businessId: 1,
            startTime: expect.objectContaining({
              _type: 'between',
            }),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return appointment when it exists', async () => {
      const mockAppt = { id: 1, businessId: 1, status: 'confirmed', business: { id: 1 }, service: { id: 1 } };
      mockAppointmentRepo.findOne.mockResolvedValue(mockAppt);

      const result = await service.findOne(1);
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException when appointment does not exist', async () => {
      mockAppointmentRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update appointment status', async () => {
      const existing = { id: 1, businessId: 1, serviceId: 1, status: 'confirmed' };
      mockAppointmentRepo.findOne.mockResolvedValue(existing);
      mockAppointmentRepo.save.mockResolvedValue({ ...existing, status: 'cancelled' });

      const result = await service.update(1, { status: 'cancelled' as any });
      expect(result.status).toBe('cancelled');
    });
  });

  describe('remove', () => {
    it('should delete existing appointment', async () => {
      const existing = { id: 1, businessId: 1 };
      mockAppointmentRepo.findOne.mockResolvedValue(existing);
      mockAppointmentRepo.remove.mockResolvedValue(existing);

      await service.remove(1);
      expect(mockAppointmentRepo.remove).toHaveBeenCalledWith(existing);
    });
  });
});
