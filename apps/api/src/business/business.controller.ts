import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { Business } from './business.entity';

@ApiTags('businesses')
@Controller('businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get()
  @ApiOperation({ summary: 'Get all businesses' })
  async findAll(): Promise<Business[]> {
    return this.businessService.findAll();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a business by slug' })
  async findBySlug(@Param('slug') slug: string): Promise<Business> {
    return this.businessService.findOneBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a business by id' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Business> {
    return this.businessService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a business' })
  async create(@Body() dto: CreateBusinessDto): Promise<Business> {
    return this.businessService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a business' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateBusinessDto>,
  ): Promise<Business> {
    return this.businessService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a business' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.businessService.remove(id);
  }
}
