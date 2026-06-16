import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ServiceService } from './service.service';
import { Service } from './service.entity';

const mockServiceRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('ServiceService', () => {
  let service: ServiceService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceService,
        { provide: getRepositoryToken(Service), useValue: mockServiceRepo },
      ],
    }).compile();

    service = module.get<ServiceService>(ServiceService);
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
    business: null as any,
  };

  describe('findAll', () => {
    it('should return all services when no businessId filter', async () => {
      mockServiceRepo.find.mockResolvedValue([mockService]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Classic Haircut');
      expect(mockServiceRepo.find).toHaveBeenCalledWith({
        where: {},
        relations: { business: true },
      });
    });

    it('should filter services by businessId', async () => {
      mockServiceRepo.find.mockResolvedValue([mockService]);
      const result = await service.findAll(1);
      expect(result).toHaveLength(1);
      expect(mockServiceRepo.find).toHaveBeenCalledWith({
        where: { businessId: 1 },
        relations: { business: true },
      });
    });

    it('should return empty array when no services exist', async () => {
      mockServiceRepo.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a service by id', async () => {
      mockServiceRepo.findOne.mockResolvedValue(mockService);
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Classic Haircut');
      expect(mockServiceRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: { business: true },
      });
    });

    it('should throw NotFoundException for non-existent id', async () => {
      mockServiceRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new service', async () => {
      const dto = {
        businessId: 1,
        name: 'Beard Trim',
        description: 'Professional beard shaping',
        duration: 20,
        price: 20,
      };
      mockServiceRepo.create.mockReturnValue(mockService);
      mockServiceRepo.save.mockResolvedValue(mockService);

      const result = await service.create(dto as any);
      expect(result.name).toBe('Classic Haircut');
      expect(mockServiceRepo.create).toHaveBeenCalledWith(dto);
      expect(mockServiceRepo.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing service', async () => {
      mockServiceRepo.findOne.mockResolvedValue(mockService);
      mockServiceRepo.save.mockResolvedValue({ ...mockService, name: 'Premium Haircut' });

      const result = await service.update(1, { name: 'Premium Haircut' } as any);
      expect(result.name).toBe('Premium Haircut');
    });

    it('should throw NotFoundException when updating non-existent service', async () => {
      mockServiceRepo.findOne.mockResolvedValue(null);
      await expect(service.update(999, { name: 'Nope' } as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an existing service', async () => {
      mockServiceRepo.findOne.mockResolvedValue(mockService);
      mockServiceRepo.remove.mockResolvedValue(mockService);

      await service.remove(1);
      expect(mockServiceRepo.remove).toHaveBeenCalledWith(mockService);
    });

    it('should throw NotFoundException when deleting non-existent service', async () => {
      mockServiceRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
