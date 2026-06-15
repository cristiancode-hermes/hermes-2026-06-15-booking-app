import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Service } from '../service/service.entity';
import { Appointment } from '../appointment/appointment.entity';

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Service, (service) => service.business)
  services: Service[];

  @OneToMany(() => Appointment, (appointment) => appointment.business)
  appointments: Appointment[];
}
