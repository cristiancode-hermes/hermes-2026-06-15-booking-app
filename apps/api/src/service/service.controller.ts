import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './service.entity';

@ApiTags('services')
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all services, optionally filtered by businessId' })
  @ApiQuery({ name: 'businessId', required: false })
  async findAll(@Query('businessId') businessId?: string): Promise<Service[]> {
    return this.serviceService.findAll(businessId ? parseInt(businessId, 10) : undefined);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get all services for a business' })
  async findByBusiness(
    @Param('businessId', ParseIntPipe) businessId: number,
  ): Promise<Service[]> {
    return this.serviceService.findAll(businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by id' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Service> {
    return this.serviceService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a service' })
  async create(@Body() dto: CreateServiceDto): Promise<Service> {
    return this.serviceService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a service' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto,
  ): Promise<Service> {
    return this.serviceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.serviceService.remove(id);
  }
}
