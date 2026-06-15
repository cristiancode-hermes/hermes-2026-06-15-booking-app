import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan } from 'typeorm';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Service } from '../service/service.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const startTime = new Date(dto.startTime);
    const service = await this.serviceRepository.findOne({
      where: { id: dto.serviceId },
    });
    if (!service) {
      throw new NotFoundException(`Service with id ${dto.serviceId} not found`);
    }
    const endTime = new Date(startTime.getTime() + service.duration * 60 * 1000);

    // Conflict detection: check for overlapping appointments
    const conflicts = await this.appointmentRepository.find({
      where: {
        businessId: dto.businessId,
        status: 'confirmed',
        startTime: LessThan(endTime),
        endTime: MoreThan(startTime),
      },
    });

    if (conflicts.length > 0) {
      throw new ConflictException(
        'This time slot conflicts with an existing appointment',
      );
    }

    const appointment = this.appointmentRepository.create({
      ...dto,
      startTime,
      endTime,
    });
    return this.appointmentRepository.save(appointment);
  }

  async findAll(
    businessId?: number,
    date?: string,
  ): Promise<Appointment[]> {
    const where: any = {};
    if (businessId) {
      where.businessId = businessId;
    }
    if (date) {
      const dateObj = new Date(date);
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
      where.startTime = Between(startOfDay, endOfDay);
    }
    return this.appointmentRepository.find({
      where,
      relations: { business: true, service: true },
      order: { startTime: 'ASC' },
    });
  }

  async findByBusiness(
    businessId: number,
    date?: string,
  ): Promise<Appointment[]> {
    return this.findAll(businessId, date);
  }

  async findByDateRange(
    businessId: number,
    start: string,
    end: string,
  ): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: {
        businessId,
        startTime: Between(new Date(start), new Date(end)),
      },
      relations: { business: true, service: true },
      order: { startTime: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: { business: true, service: true },
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with id ${id} not found`);
    }
    return appointment;
  }

  async update(
    id: number,
    dto: Partial<CreateAppointmentDto>,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);
    if (dto.startTime) {
      const startTime = new Date(dto.startTime);
      const service = await this.serviceRepository.findOne({
        where: { id: dto.serviceId ?? appointment.serviceId },
      });
      if (!service) {
        throw new NotFoundException(
          `Service with id ${dto.serviceId ?? appointment.serviceId} not found`,
        );
      }
      (dto as any).endTime = new Date(
        startTime.getTime() + service.duration * 60 * 1000,
      );
    }
    Object.assign(appointment, dto);
    return this.appointmentRepository.save(appointment);
  }

  async remove(id: number): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepository.remove(appointment);
  }
}
