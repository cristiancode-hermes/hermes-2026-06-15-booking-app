import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { Appointment } from './appointment.entity';

const mockAppointment: Appointment = {
  id: 1,
  businessId: 1,
  serviceId: 1,
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '555-0100',
  startTime: new Date('2026-06-17T10:00:00Z'),
  endTime: new Date('2026-06-17T10:30:00Z'),
  status: 'confirmed',
  notes: null,
  createdAt: new Date(),
  business: null as any,
  service: null as any,
};

const mockAppointmentService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByBusiness: jest.fn(),
  findByDateRange: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('AppointmentController', () => {
  let controller: AppointmentController;
  let appointmentService: AppointmentService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentController],
      providers: [
        { provide: AppointmentService, useValue: mockAppointmentService },
      ],
    }).compile();

    controller = module.get<AppointmentController>(AppointmentController);
    appointmentService = module.get<AppointmentService>(AppointmentService);
  });

  describe('create', () => {
    it('should create an appointment', async () => {
      const dto = {
        businessId: 1,
        serviceId: 1,
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '555-0100',
        startTime: '2026-06-17T10:00:00Z',
      };
      mockAppointmentService.create.mockResolvedValue(mockAppointment);
      const result = await controller.create(dto as any);
      expect(result.id).toBe(1);
      expect(result.status).toBe('confirmed');
      expect(mockAppointmentService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all appointments without filters', async () => {
      mockAppointmentService.findAll.mockResolvedValue([mockAppointment]);
      const result = await controller.findAll(undefined, undefined);
      expect(result).toHaveLength(1);
      expect(mockAppointmentService.findAll).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should return appointments filtered by businessId and date', async () => {
      mockAppointmentService.findAll.mockResolvedValue([mockAppointment]);
      const result = await controller.findAll('1', '2026-06-17');
      expect(result).toHaveLength(1);
      expect(mockAppointmentService.findAll).toHaveBeenCalledWith(1, '2026-06-17');
    });
  });

  describe('findByDateRange', () => {
    it('should return appointments within date range', async () => {
      mockAppointmentService.findByDateRange.mockResolvedValue([mockAppointment]);
      const result = await controller.findByDateRange(1, '2026-06-17', '2026-06-18');
      expect(result).toHaveLength(1);
      expect(mockAppointmentService.findByDateRange).toHaveBeenCalledWith(1, '2026-06-17', '2026-06-18');
    });
  });

  describe('findOne', () => {
    it('should return an appointment by id', async () => {
      mockAppointmentService.findOne.mockResolvedValue(mockAppointment);
      const result = await controller.findOne(1);
      expect(result.id).toBe(1);
      expect(mockAppointmentService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an appointment', async () => {
      const dto = { status: 'cancelled' as const };
      mockAppointmentService.update.mockResolvedValue({ ...mockAppointment, status: 'cancelled' });
      const result = await controller.update(1, dto);
      expect(result.status).toBe('cancelled');
      expect(mockAppointmentService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete an appointment', async () => {
      mockAppointmentService.remove.mockResolvedValue(undefined);
      await controller.remove(1);
      expect(mockAppointmentService.remove).toHaveBeenCalledWith(1);
    });
  });
});
