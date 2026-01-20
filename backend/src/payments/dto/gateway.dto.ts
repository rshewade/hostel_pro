import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  IsObject,
  IsPositive,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FeeBreakdownItemDto {
  @ApiProperty({ description: 'Fee type identifier' })
  @IsString()
  @IsNotEmpty()
  feeType: string;

  @ApiProperty({ description: 'Fee description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Amount in INR' })
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class InitiatePaymentDto {
  @ApiPropertyOptional({ description: 'Application ID (for application-related payments)' })
  @IsUUID()
  @IsOptional()
  applicationId?: string;

  @ApiPropertyOptional({ description: 'Fee ID (for existing fee payments)' })
  @IsUUID()
  @IsOptional()
  feeId?: string;

  @ApiProperty({ description: 'Total payment amount in INR' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ description: 'Fee breakdown', type: [FeeBreakdownItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeeBreakdownItemDto)
  @IsOptional()
  feeBreakdown?: FeeBreakdownItemDto[];

  @ApiPropertyOptional({ description: 'Idempotency key to prevent duplicate payments' })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;

  @ApiPropertyOptional({ description: 'Customer email for receipt' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Customer mobile' })
  @IsString()
  @IsOptional()
  mobile?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Razorpay order ID' })
  @IsString()
  @IsNotEmpty()
  razorpay_order_id: string;

  @ApiProperty({ description: 'Razorpay payment ID' })
  @IsString()
  @IsNotEmpty()
  razorpay_payment_id: string;

  @ApiProperty({ description: 'Razorpay signature for verification' })
  @IsString()
  @IsNotEmpty()
  razorpay_signature: string;
}

export class RefundPaymentDto {
  @ApiPropertyOptional({ description: 'Partial refund amount in INR (if not provided, full refund)' })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  amount?: number;

  @ApiProperty({ description: 'Reason for refund' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class WebhookPayloadDto {
  @ApiProperty({ description: 'Webhook event type' })
  @IsString()
  event: string;

  @ApiProperty({ description: 'Webhook payload' })
  @IsObject()
  payload: Record<string, unknown>;
}

// Response DTOs

export class InitiatePaymentResponseDto {
  @ApiProperty({ description: 'Internal payment ID' })
  paymentId: string;

  @ApiProperty({ description: 'Razorpay order ID' })
  orderId: string;

  @ApiProperty({ description: 'Razorpay key ID for frontend' })
  keyId: string;

  @ApiProperty({ description: 'Amount in paise' })
  amount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiPropertyOptional({ description: 'Customer name' })
  name?: string;

  @ApiPropertyOptional({ description: 'Customer email' })
  email?: string;

  @ApiPropertyOptional({ description: 'Customer mobile' })
  mobile?: string;

  @ApiProperty({ description: 'Order notes' })
  notes: Record<string, string>;
}

export class PaymentStatusResponseDto {
  @ApiProperty({ description: 'Internal payment ID' })
  paymentId: string;

  @ApiProperty({ description: 'Payment status' })
  status: string;

  @ApiProperty({ description: 'Amount in INR' })
  amount: number;

  @ApiPropertyOptional({ description: 'Razorpay order ID' })
  orderId?: string;

  @ApiPropertyOptional({ description: 'Razorpay payment ID' })
  razorpayPaymentId?: string;

  @ApiPropertyOptional({ description: 'Payment method used' })
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Payment completion timestamp' })
  paidAt?: string;

  @ApiPropertyOptional({ description: 'Receipt URL' })
  receiptUrl?: string;
}

export class RefundResponseDto {
  @ApiProperty({ description: 'Refund ID' })
  refundId: string;

  @ApiProperty({ description: 'Refund status' })
  status: string;

  @ApiProperty({ description: 'Refunded amount in INR' })
  amount: number;

  @ApiProperty({ description: 'Refund processed timestamp' })
  processedAt: string;
}
