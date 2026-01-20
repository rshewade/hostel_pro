import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsDateString,
  Min,
  Max,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeeType, PaymentMethod, PaymentStatus } from '../payments.types';

export class CreateFeeDto {
  @ApiProperty({ description: 'Student user ID' })
  @IsUUID()
  @IsNotEmpty()
  studentUserId: string;

  @ApiPropertyOptional({ description: 'Related application ID' })
  @IsUUID()
  @IsOptional()
  applicationId?: string;

  @ApiProperty({
    enum: ['HOSTEL_FEE', 'PROCESSING_FEE', 'SECURITY_DEPOSIT', 'KEY_DEPOSIT', 'MESS_FEE', 'ELECTRICITY', 'LAUNDRY', 'OTHER'],
    description: 'Type of fee',
  })
  @IsEnum(['HOSTEL_FEE', 'PROCESSING_FEE', 'SECURITY_DEPOSIT', 'KEY_DEPOSIT', 'MESS_FEE', 'ELECTRICITY', 'LAUNDRY', 'OTHER'])
  @IsNotEmpty()
  feeType: FeeType;

  @ApiProperty({ description: 'Fee amount in INR', example: 5000 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: 'Due date for payment', example: '2024-02-15' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiPropertyOptional({ description: 'Fee description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class RecordPaymentDto {
  @ApiProperty({ description: 'Fee ID to record payment against' })
  @IsUUID()
  @IsNotEmpty()
  feeId: string;

  @ApiProperty({ description: 'Payment amount in INR', example: 5000 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE'],
    description: 'Payment method',
  })
  @IsEnum(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE'])
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'Payment reference (transaction ID, cheque number, etc.)' })
  @IsString()
  @IsOptional()
  paymentReference?: string;

  @ApiPropertyOptional({ description: 'Date of payment', example: '2024-02-10' })
  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Verification notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateFeeStatusDto {
  @ApiProperty({
    enum: ['PENDING', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'WAIVED'],
    description: 'New fee status',
  })
  @IsEnum(['PENDING', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'WAIVED'])
  @IsNotEmpty()
  status: PaymentStatus;

  @ApiPropertyOptional({ description: 'Reason for status change (required for waiver)' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ListFeesDto {
  @ApiPropertyOptional({ description: 'Student user ID to filter by' })
  @IsUUID()
  @IsOptional()
  studentUserId?: string;

  @ApiPropertyOptional({
    enum: ['PENDING', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'WAIVED'],
    description: 'Filter by status',
  })
  @IsEnum(['PENDING', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'WAIVED'])
  @IsOptional()
  status?: PaymentStatus;

  @ApiPropertyOptional({
    enum: ['HOSTEL_FEE', 'PROCESSING_FEE', 'SECURITY_DEPOSIT', 'KEY_DEPOSIT', 'MESS_FEE', 'ELECTRICITY', 'LAUNDRY', 'OTHER'],
    description: 'Filter by fee type',
  })
  @IsEnum(['HOSTEL_FEE', 'PROCESSING_FEE', 'SECURITY_DEPOSIT', 'KEY_DEPOSIT', 'MESS_FEE', 'ELECTRICITY', 'LAUNDRY', 'OTHER'])
  @IsOptional()
  feeType?: FeeType;

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

export class ListPaymentsDto {
  @ApiPropertyOptional({ description: 'Student user ID to filter by' })
  @IsUUID()
  @IsOptional()
  studentUserId?: string;

  @ApiPropertyOptional({ description: 'Fee ID to filter by' })
  @IsUUID()
  @IsOptional()
  feeId?: string;

  @ApiPropertyOptional({ description: 'Start date for payment date filter' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for payment date filter' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

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
