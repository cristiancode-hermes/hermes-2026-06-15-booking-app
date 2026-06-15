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
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './appointment.entity';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create an appointment (with conflict detection)' })
  async create(@Body() dto: CreateAppointmentDto): Promise<Appointment> {
    return this.appointmentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments, optionally filtered' })
  @ApiQuery({ name: 'businessId', required: false })
  @ApiQuery({ name: 'date', required: false })
  async findAll(
    @Query('businessId') businessId?: string,
    @Query('date') date?: string,
  ): Promise<Appointment[]> {
    return this.appointmentService.findAll(
      businessId ? parseInt(businessId, 10) : undefined,
      date,
    );
  }

  @Get('range')
  @ApiOperation({ summary: 'Get appointments by date range' })
  @ApiQuery({ name: 'businessId', required: true })
  @ApiQuery({ name: 'start', required: true })
  @ApiQuery({ name: 'end', required: true })
  async findByDateRange(
    @Query('businessId', ParseIntPipe) businessId: number,
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<Appointment[]> {
    return this.appointmentService.findByDateRange(businessId, start, end);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an appointment by id' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Appointment> {
    return this.appointmentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an appointment' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateAppointmentDto>,
  ): Promise<Appointment> {
    return this.appointmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.appointmentService.remove(id);
  }
}
