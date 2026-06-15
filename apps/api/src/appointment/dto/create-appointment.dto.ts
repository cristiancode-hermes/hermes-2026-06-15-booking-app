import { IsString, IsInt, IsEmail, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsInt()
  businessId: number;

  @ApiProperty()
  @IsInt()
  serviceId: number;

  @ApiProperty()
  @IsString()
  customerName: string;

  @ApiProperty()
  @IsEmail()
  customerEmail: string;

  @ApiProperty()
  @IsString()
  customerPhone: string;

  @ApiProperty({ description: 'ISO 8601 start time' })
  @IsDateString()
  startTime: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
