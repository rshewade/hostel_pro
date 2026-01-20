import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsArray,
  Min,
  Max,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoomStatus, VerticalType } from '../rooms.types';

export class CreateRoomDto {
  @ApiProperty({ description: 'Room number', example: '101' })
  @IsString()
  @IsNotEmpty()
  roomNumber: string;

  @ApiProperty({ enum: ['BOYS', 'GIRLS', 'DHARAMSHALA'], description: 'Hostel vertical' })
  @IsEnum(['BOYS', 'GIRLS', 'DHARAMSHALA'])
  @IsNotEmpty()
  vertical: VerticalType;

  @ApiProperty({ description: 'Floor number', example: 1 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  floor: number;

  @ApiProperty({ description: 'Room capacity', example: 4 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  capacity: number;

  @ApiPropertyOptional({ description: 'Room amenities', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateRoomDto {
  @ApiPropertyOptional({ description: 'Room capacity', example: 4 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({
    enum: ['AVAILABLE', 'OCCUPIED', 'PARTIALLY_OCCUPIED', 'MAINTENANCE', 'RESERVED'],
    description: 'Room status',
  })
  @IsEnum(['AVAILABLE', 'OCCUPIED', 'PARTIALLY_OCCUPIED', 'MAINTENANCE', 'RESERVED'])
  @IsOptional()
  status?: RoomStatus;

  @ApiPropertyOptional({ description: 'Room amenities', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class AllocateRoomDto {
  @ApiProperty({ description: 'Student user ID to allocate room to' })
  @IsUUID()
  @IsNotEmpty()
  studentUserId: string;

  @ApiPropertyOptional({ description: 'Bed number (optional)', example: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  bedNumber?: number;
}

export class EndAllocationDto {
  @ApiProperty({ description: 'Reason for ending allocation' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class TransferRoomDto {
  @ApiProperty({ description: 'Target room ID' })
  @IsUUID()
  @IsNotEmpty()
  targetRoomId: string;

  @ApiPropertyOptional({ description: 'Bed number in target room' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  bedNumber?: number;

  @ApiProperty({ description: 'Reason for transfer' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ListRoomsDto {
  @ApiPropertyOptional({ enum: ['BOYS', 'GIRLS', 'DHARAMSHALA'], description: 'Filter by vertical' })
  @IsEnum(['BOYS', 'GIRLS', 'DHARAMSHALA'])
  @IsOptional()
  vertical?: VerticalType;

  @ApiPropertyOptional({
    enum: ['AVAILABLE', 'OCCUPIED', 'PARTIALLY_OCCUPIED', 'MAINTENANCE', 'RESERVED'],
    description: 'Filter by status',
  })
  @IsEnum(['AVAILABLE', 'OCCUPIED', 'PARTIALLY_OCCUPIED', 'MAINTENANCE', 'RESERVED'])
  @IsOptional()
  status?: RoomStatus;

  @ApiPropertyOptional({ description: 'Filter by floor' })
  @IsNumber()
  @IsOptional()
  floor?: number;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
