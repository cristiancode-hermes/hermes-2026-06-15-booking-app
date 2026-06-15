import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async findAll(): Promise<Business[]> {
    return this.businessRepository.find();
  }

  async findOne(id: number): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id },
    });
    if (!business) {
      throw new NotFoundException(`Business with id ${id} not found`);
    }
    return business;
  }

  async findOneBySlug(slug: string): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { slug },
    });
    if (!business) {
      throw new NotFoundException(`Business with slug "${slug}" not found`);
    }
    return business;
  }

  async create(dto: CreateBusinessDto): Promise<Business> {
    const business = this.businessRepository.create(dto);
    return this.businessRepository.save(business);
  }

  async update(id: number, dto: Partial<CreateBusinessDto>): Promise<Business> {
    const business = await this.findOne(id);
    Object.assign(business, dto);
    return this.businessRepository.save(business);
  }

  async remove(id: number): Promise<void> {
    const business = await this.findOne(id);
    await this.businessRepository.remove(business);
  }
}
