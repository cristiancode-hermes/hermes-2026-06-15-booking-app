import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Business } from '../business/business.entity';
import { Service } from '../service/service.entity';
import { Appointment } from '../appointment/appointment.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Business, Service, Appointment]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
