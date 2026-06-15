import { IsString, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty()
  @IsInt()
  businessId: number;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Duration in minutes' })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;
}
