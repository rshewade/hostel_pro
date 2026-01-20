import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsDateString,
  IsPhoneNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveStatus, LeaveType } from '../leaves.types';

export class CreateLeaveRequestDto {
  @ApiProperty({
    enum: ['REGULAR', 'EMERGENCY', 'MEDICAL', 'VACATION'],
    description: 'Type of leave',
  })
  @IsEnum(['REGULAR', 'EMERGENCY', 'MEDICAL', 'VACATION'])
  @IsNotEmpty()
  leaveType: LeaveType;

  @ApiProperty({ description: 'Reason for leave', minLength: 10 })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ description: 'Start date of leave', example: '2024-02-15' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'End date of leave', example: '2024-02-17' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ description: 'Destination city/place' })
  @IsString()
  @IsNotEmpty()
  destination: string;

  @ApiPropertyOptional({ description: 'Full destination address' })
  @IsString()
  @IsOptional()
  destinationAddress?: string;

  @ApiProperty({ description: 'Emergency contact number', example: '+919876543210' })
  @IsPhoneNumber('IN')
  @IsNotEmpty()
  emergencyContact: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateLeaveStatusDto {
  @ApiProperty({
    enum: ['APPROVED', 'REJECTED'],
    description: 'New status',
  })
  @IsEnum(['APPROVED', 'REJECTED'])
  @IsNotEmpty()
  status: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ description: 'Rejection reason (required if rejecting)' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

export class RecordCheckoutDto {
  @ApiPropertyOptional({ description: 'Notes at checkout' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class RecordReturnDto {
  @ApiPropertyOptional({ description: 'Notes at return' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CancelLeaveDto {
  @ApiProperty({ description: 'Reason for cancellation' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class ListLeavesDto {
  @ApiPropertyOptional({ description: 'Student user ID to filter by' })
  @IsUUID()
  @IsOptional()
  studentUserId?: string;

  @ApiPropertyOptional({
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CHECKED_OUT', 'RETURNED'],
    description: 'Filter by status',
  })
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'CHECKED_OUT', 'RETURNED'])
  @IsOptional()
  status?: LeaveStatus;

  @ApiPropertyOptional({
    enum: ['REGULAR', 'EMERGENCY', 'MEDICAL', 'VACATION'],
    description: 'Filter by leave type',
  })
  @IsEnum(['REGULAR', 'EMERGENCY', 'MEDICAL', 'VACATION'])
  @IsOptional()
  leaveType?: LeaveType;

  @ApiPropertyOptional({ description: 'Start date filter (from)' })
  @IsDateString()
  @IsOptional()
  startDateFrom?: string;

  @ApiPropertyOptional({ description: 'Start date filter (to)' })
  @IsDateString()
  @IsOptional()
  startDateTo?: string;

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
