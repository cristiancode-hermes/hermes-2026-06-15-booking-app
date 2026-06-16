import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Business } from '../business/business.entity';
import { Service } from '../service/service.entity';
import { Appointment } from '../appointment/appointment.entity';

const mockBusinessRepo = {
  count: jest.fn(),
  save: jest.fn(),
};

const mockServiceRepo = {
  save: jest.fn(),
};

const mockAppointmentRepo = {
  save: jest.fn(),
};

describe('SeedService', () => {
  let seedService: SeedService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: getRepositoryToken(Business), useValue: mockBusinessRepo },
        { provide: getRepositoryToken(Service), useValue: mockServiceRepo },
        { provide: getRepositoryToken(Appointment), useValue: mockAppointmentRepo },
      ],
    }).compile();

    seedService = module.get<SeedService>(SeedService);
    // Suppress logger output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  describe('onModuleInit', () => {
    it('should seed the database when empty', async () => {
      mockBusinessRepo.count.mockResolvedValue(0);
      // Each save returns the input with an id
      mockBusinessRepo.save
        .mockResolvedValueOnce({ id: 1, name: 'Urban Barber Studio', slug: 'urban-barber' })
        .mockResolvedValueOnce({ id: 2, name: 'Serenity Spa & Wellness', slug: 'serenity-spa' });

      mockServiceRepo.save
        .mockResolvedValueOnce({ id: 1, name: 'Classic Haircut' })
        .mockResolvedValueOnce({ id: 2, name: 'Beard Trim' })
        .mockResolvedValueOnce({ id: 3, name: 'Hair & Beard Combo' })
        .mockResolvedValueOnce({ id: 4, name: 'Swedish Massage' })
        .mockResolvedValueOnce({ id: 5, name: 'Facial Treatment' });

      mockAppointmentRepo.save.mockResolvedValue({});

      await seedService.onModuleInit();

      expect(mockBusinessRepo.count).toHaveBeenCalled();
      expect(mockBusinessRepo.save).toHaveBeenCalledTimes(2);
      expect(mockServiceRepo.save).toHaveBeenCalledTimes(5);
      expect(mockAppointmentRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should skip seeding when database already has data', async () => {
      mockBusinessRepo.count.mockResolvedValue(1);

      await seedService.onModuleInit();

      expect(mockBusinessRepo.save).not.toHaveBeenCalled();
      expect(mockServiceRepo.save).not.toHaveBeenCalled();
      expect(mockAppointmentRepo.save).not.toHaveBeenCalled();
    });
  });
});
