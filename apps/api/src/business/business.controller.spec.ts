import { Test, TestingModule } from '@nestjs/testing';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { Business } from './business.entity';

const mockBusiness: Business = {
  id: 1,
  name: 'Urban Barber Studio',
  slug: 'urban-barber',
  email: 'hello@urbanbarber.com',
  phone: '555-0100',
  address: '123 Main St',
  description: 'A premium barber shop',
  createdAt: new Date(),
  updatedAt: new Date(),
  services: [],
  appointments: [],
};

const mockBusinessService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findOneBySlug: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('BusinessController', () => {
  let controller: BusinessController;
  let businessService: BusinessService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessController],
      providers: [
        { provide: BusinessService, useValue: mockBusinessService },
      ],
    }).compile();

    controller = module.get<BusinessController>(BusinessController);
    businessService = module.get<BusinessService>(BusinessService);
  });

  describe('findAll', () => {
    it('should return all businesses', async () => {
      mockBusinessService.findAll.mockResolvedValue([mockBusiness]);
      const result = await controller.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Urban Barber Studio');
      expect(mockBusinessService.findAll).toHaveBeenCalled();
    });
  });

  describe('findBySlug', () => {
    it('should return a business by slug', async () => {
      mockBusinessService.findOneBySlug.mockResolvedValue(mockBusiness);
      const result = await controller.findBySlug('urban-barber');
      expect(result.slug).toBe('urban-barber');
      expect(mockBusinessService.findOneBySlug).toHaveBeenCalledWith('urban-barber');
    });
  });

  describe('findOne', () => {
    it('should return a business by id', async () => {
      mockBusinessService.findOne.mockResolvedValue(mockBusiness);
      const result = await controller.findOne(1);
      expect(result.id).toBe(1);
      expect(mockBusinessService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new business', async () => {
      const dto = { name: 'New Shop', slug: 'new-shop', email: 'a@b.com', phone: '555' };
      mockBusinessService.create.mockResolvedValue({ id: 2, ...dto } as any);
      const result = await controller.create(dto as any);
      expect(result.id).toBe(2);
      expect(mockBusinessService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update a business', async () => {
      const dto = { name: 'Updated Name' };
      mockBusinessService.update.mockResolvedValue({ ...mockBusiness, name: 'Updated Name' });
      const result = await controller.update(1, dto);
      expect(result.name).toBe('Updated Name');
      expect(mockBusinessService.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete a business', async () => {
      mockBusinessService.remove.mockResolvedValue(undefined);
      await controller.remove(1);
      expect(mockBusinessService.remove).toHaveBeenCalledWith(1);
    });
  });
});
