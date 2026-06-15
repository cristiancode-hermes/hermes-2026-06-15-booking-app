import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Business } from '../business/business.entity';
import { Service } from '../service/service.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  businessId: number;

  @ManyToOne(() => Business, (business) => business.appointments)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @Column()
  serviceId: number;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column()
  customerPhone: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({ default: 'confirmed' })
  status: 'confirmed' | 'cancelled' | 'completed';

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
