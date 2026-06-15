import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { BusinessService } from './business.service';
import { Business } from './business.entity';

const mockBusinessRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

describe('BusinessService', () => {
  let service: BusinessService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        { provide: getRepositoryToken(Business), useValue: mockBusinessRepo },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
  });

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
  };

  describe('findAll', () => {
    it('should return all businesses', async () => {
      mockBusinessRepo.find.mockResolvedValue([mockBusiness]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Urban Barber Studio');
    });
  });

  describe('findOne', () => {
    it('should return a business by id', async () => {
      mockBusinessRepo.findOne.mockResolvedValue(mockBusiness);
      const result = await service.findOne(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('Urban Barber Studio');
    });

    it('should throw NotFoundException for non-existent id', async () => {
      mockBusinessRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneBySlug', () => {
    it('should return a business by slug', async () => {
      mockBusinessRepo.findOne.mockResolvedValue(mockBusiness);
      const result = await service.findOneBySlug('urban-barber');
      expect(result.slug).toBe('urban-barber');
    });

    it('should throw NotFoundException for non-existent slug', async () => {
      mockBusinessRepo.findOne.mockResolvedValue(null);
      await expect(service.findOneBySlug('no-exist')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new business', async () => {
      const dto = { name: 'New Shop', slug: 'new-shop', email: 'a@b.com', phone: '555' };
      mockBusinessRepo.create.mockReturnValue(mockBusiness);
      mockBusinessRepo.save.mockResolvedValue(mockBusiness);

      const result = await service.create(dto as any);
      expect(result.name).toBe('Urban Barber Studio');
      expect(mockBusinessRepo.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update existing business', async () => {
      mockBusinessRepo.findOne.mockResolvedValue(mockBusiness);
      mockBusinessRepo.save.mockResolvedValue({ ...mockBusiness, name: 'Updated Name' });

      const result = await service.update(1, { name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when updating non-existent business', async () => {
      mockBusinessRepo.findOne.mockResolvedValue(null);
      await expect(service.update(999, { name: 'Nope' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete existing business', async () => {
      mockBusinessRepo.findOne.mockResolvedValue(mockBusiness);
      mockBusinessRepo.remove.mockResolvedValue(mockBusiness);

      await service.remove(1);
      expect(mockBusinessRepo.remove).toHaveBeenCalledWith(mockBusiness);
    });

    it('should throw NotFoundException when deleting non-existent business', async () => {
      mockBusinessRepo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
