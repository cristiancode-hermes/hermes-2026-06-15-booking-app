import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../business/business.entity';
import { Service } from '../service/service.entity';
import { Appointment } from '../appointment/appointment.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async onModuleInit() {
    const count = await this.businessRepository.count();
    if (count > 0) {
      this.logger.log('Database already seeded, skipping');
      return;
    }

    this.logger.log('Seeding database...');

    // Create businesses
    const barber = await this.businessRepository.save({
      name: 'Urban Barber Studio',
      slug: 'urban-barber',
      email: 'contact@urbanbarber.com',
      phone: '+1-555-0101',
      address: '123 Main Street, Downtown',
      description: 'Premium barber services for the modern gentleman',
    });

    const spa = await this.businessRepository.save({
      name: 'Serenity Spa & Wellness',
      slug: 'serenity-spa',
      email: 'info@serenityspa.com',
      phone: '+1-555-0202',
      address: '456 Oak Avenue, Westside',
      description: 'Relax, rejuvenate, and restore your inner balance',
    });

    // Create services
    const classicHaircut = await this.serviceRepository.save({
      businessId: barber.id,
      name: 'Classic Haircut',
      description: 'Traditional scissor and clipper cut',
      duration: 30,
      price: 30,
    });

    const beardTrim = await this.serviceRepository.save({
      businessId: barber.id,
      name: 'Beard Trim',
      description: 'Professional beard shaping and trimming',
      duration: 20,
      price: 20,
    });

    const hairBeardCombo = await this.serviceRepository.save({
      businessId: barber.id,
      name: 'Hair & Beard Combo',
      description: 'Full haircut and beard grooming package',
      duration: 45,
      price: 45,
    });

    const swedishMassage = await this.serviceRepository.save({
      businessId: spa.id,
      name: 'Swedish Massage',
      description: 'Full body relaxation massage',
      duration: 60,
      price: 80,
    });

    const facialTreatment = await this.serviceRepository.save({
      businessId: spa.id,
      name: 'Facial Treatment',
      description: 'Deep cleansing and rejuvenating facial',
      duration: 45,
      price: 65,
    });

    // Create appointments spread across the next 7 days
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    function getDay(hoursFromNow: number): Date {
      const d = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
      // Round to nearest hour
      d.setMinutes(0, 0, 0);
      return d;
    }

    await this.appointmentRepository.save([
      // Day 1 - confirmed appointments at barber
      {
        businessId: barber.id,
        serviceId: classicHaircut.id,
        customerName: 'John Smith',
        customerEmail: 'john.smith@email.com',
        customerPhone: '+1-555-1001',
        startTime: getDay(24), // tomorrow
        endTime: new Date(getDay(24).getTime() + 30 * 60 * 1000),
        status: 'confirmed',
      },
      {
        businessId: barber.id,
        serviceId: beardTrim.id,
        customerName: 'Mike Johnson',
        customerEmail: 'mike.j@email.com',
        customerPhone: '+1-555-1002',
        startTime: getDay(26), // tomorrow + 2h
        endTime: new Date(getDay(26).getTime() + 20 * 60 * 1000),
        status: 'confirmed',
      },
      // Day 2 - completed appointments at spa
      {
        businessId: spa.id,
        serviceId: swedishMassage.id,
        customerName: 'Sarah Williams',
        customerEmail: 'sarah.w@email.com',
        customerPhone: '+1-555-2001',
        startTime: getDay(2), // later today (2h from now)
        endTime: new Date(getDay(2).getTime() + 60 * 60 * 1000),
        status: 'completed',
      },
      {
        businessId: spa.id,
        serviceId: facialTreatment.id,
        customerName: 'Emily Davis',
        customerEmail: 'emily.d@email.com',
        customerPhone: '+1-555-2002',
        startTime: getDay(4), // later today (4h from now)
        endTime: new Date(getDay(4).getTime() + 45 * 60 * 1000),
        status: 'completed',
      },
      // Day 3 - cancelled appointment
      {
        businessId: barber.id,
        serviceId: hairBeardCombo.id,
        customerName: 'Robert Brown',
        customerEmail: 'rob.brown@email.com',
        customerPhone: '+1-555-1003',
        startTime: getDay(48), // day after tomorrow
        endTime: new Date(getDay(48).getTime() + 45 * 60 * 1000),
        status: 'cancelled',
      },
      // Day 4 - confirmed appointments
      {
        businessId: spa.id,
        serviceId: swedishMassage.id,
        customerName: 'Lisa Anderson',
        customerEmail: 'lisa.a@email.com',
        customerPhone: '+1-555-2003',
        startTime: getDay(72), // 3 days from now
        endTime: new Date(getDay(72).getTime() + 60 * 60 * 1000),
        status: 'confirmed',
      },
      {
        businessId: barber.id,
        serviceId: classicHaircut.id,
        customerName: 'David Wilson',
        customerEmail: 'david.w@email.com',
        customerPhone: '+1-555-1004',
        startTime: getDay(74),
        endTime: new Date(getDay(74).getTime() + 30 * 60 * 1000),
        status: 'confirmed',
      },
      // Day 5 - more variety
      {
        businessId: spa.id,
        serviceId: facialTreatment.id,
        customerName: 'Jessica Taylor',
        customerEmail: 'jessica.t@email.com',
        customerPhone: '+1-555-2004',
        startTime: getDay(96), // 4 days from now
        endTime: new Date(getDay(96).getTime() + 45 * 60 * 1000),
        status: 'confirmed',
      },
      {
        businessId: barber.id,
        serviceId: beardTrim.id,
        customerName: 'Tom Martinez',
        customerEmail: 'tom.m@email.com',
        customerPhone: '+1-555-1005',
        startTime: getDay(98),
        endTime: new Date(getDay(98).getTime() + 20 * 60 * 1000),
        status: 'completed',
      },
      // Day 6 - future confirmed
      {
        businessId: barber.id,
        serviceId: hairBeardCombo.id,
        customerName: 'Chris Lee',
        customerEmail: 'chris.lee@email.com',
        customerPhone: '+1-555-1006',
        startTime: getDay(120), // 5 days from now
        endTime: new Date(getDay(120).getTime() + 45 * 60 * 1000),
        status: 'confirmed',
      },
    ]);

    this.logger.log('Database seeded successfully');
  }
}
