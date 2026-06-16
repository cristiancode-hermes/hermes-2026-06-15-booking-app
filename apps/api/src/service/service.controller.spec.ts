import { Test, TestingModule } from '@nestjs/testing';
import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { Service } from './service.entity';

const mockService = {
  id: 1,
  businessId: 1,
  name: 'Classic Haircut',
  description: 'A standard haircut',
  duration: 30,
  price: 30,
  isActive: true,
  createdAt: new Date(),
  business: { id: 1, name: 'Urban Barber Studio' },
};

const mockServiceService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ServiceController', () => {
  let controller: ServiceController;
  let serviceService: ServiceService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceController],
      providers: [
        { provide: ServiceService, useValue: mockServiceService },
      ],
    }).compile();

    controller = module.get<ServiceController>(ServiceController);
    serviceService = module.get<ServiceService>(ServiceService);
  });

  describe('findAll', () => {
    it('should return all services without businessId filter', async () => {
      mockServiceService.findAll.mockResolvedValue([mockService]);
      const result = await controller.findAll(undefined);
      expect(result).toHaveLength(1);
      expect(mockServiceService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return services filtered by businessId', async () => {
      mockServiceService.findAll.mockResolvedValue([mockService]);
      const result = await controller.findAll('1');
      expect(result).toHaveLength(1);
      expect(mockServiceService.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('findByBusiness', () => {
    it('should return services for a given business', async () => {
      mockServiceService.findAll.mockResolvedValue([mockService]);
      const result = await controller.findByBusiness(1);
      expect(result).toHaveLength(1);
      expect(mockServiceService.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('findOne', () => {
    it('should return a service by id', async () => {
      mockServiceService.findOne.mockResolvedValue(mockService);
      const result = await controller.findOne(1);
      expect(result.id).toBe(1);
      expect(mockServiceService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new service', async () => {
      const dto = { businessId: 1, name: 'New Service', duration: 45, price: 50 };
      mockServiceService.create.mockResolvedValue({ id: 2, ...dto });
      const result = await controller.create(dto as any);
      expect(result.id).toBe(2);
      expect(mockServiceService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a service', async () => {
      const dto = { name: 'Updated Name' };
      mockServiceService.update.mockResolvedValue({ ...mockService, name: 'Updated Name' });
      const result = await controller.update(1, dto as any);
      expect(result.name).toBe('Updated Name');
      expect(mockServiceService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete a service', async () => {
      mockServiceService.remove.mockResolvedValue(undefined);
      await controller.remove(1);
      expect(mockServiceService.remove).toHaveBeenCalledWith(1);
    });
  });
});
