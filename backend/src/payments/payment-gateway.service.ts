import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import { RazorpayService } from './razorpay/razorpay.service';
import {
  InitiatePaymentDto,
  VerifyPaymentDto,
  RefundPaymentDto,
  InitiatePaymentResponseDto,
  PaymentStatusResponseDto,
  RefundResponseDto,
} from './dto/gateway.dto';
import * as crypto from 'crypto';

export type GatewayPaymentStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export interface GatewayPayment {
  id: string;
  student_user_id: string;
  application_id?: string;
  fee_id?: string;
  amount: number;
  fee_breakdown?: Record<string, unknown>[];
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  payment_method?: string;
  status: GatewayPaymentStatus;
  gateway_response?: Record<string, unknown>;
  idempotency_key?: string;
  receipt_url?: string;
  paid_at?: string;
  refunded_at?: string;
  refund_amount?: number;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);

  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
    private razorpayService: RazorpayService,
  ) {}

  /**
   * Generate idempotency key from payment details
   */
  private generateIdempotencyKey(
    studentUserId: string,
    amount: number,
    applicationId?: string,
    feeId?: string,
  ): string {
    const data = `${studentUserId}-${amount}-${applicationId || ''}-${feeId || ''}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
  }

  /**
   * Initiate a payment
   */
  async initiatePayment(
    dto: InitiatePaymentDto,
    studentUserId: string,
  ): Promise<InitiatePaymentResponseDto> {
    // Check for existing pending payment with same idempotency key
    if (dto.idempotencyKey) {
      const { data: existingPayment } = await this.supabase
        .from('gateway_payments')
        .select('*')
        .eq('idempotency_key', dto.idempotencyKey)
        .eq('student_user_id', studentUserId)
        .single();

      if (existingPayment && existingPayment.status === 'INITIATED') {
        // Return existing order
        return {
          paymentId: existingPayment.id,
          orderId: existingPayment.razorpay_order_id,
          keyId: this.razorpayService.getKeyId(),
          amount: existingPayment.amount * 100,
          currency: 'INR',
          notes: {},
        };
      }
    }

    // Create Razorpay order
    const idempotencyKey = dto.idempotencyKey || this.generateIdempotencyKey(
      studentUserId,
      dto.amount,
      dto.applicationId,
      dto.feeId,
    );

    const receiptId = `rcpt_${Date.now()}_${studentUserId.substring(0, 8)}`;
    const notes: Record<string, string> = {
      studentUserId,
    };

    if (dto.applicationId) {
      notes.applicationId = dto.applicationId;
    }
    if (dto.feeId) {
      notes.feeId = dto.feeId;
    }

    const order = await this.razorpayService.createOrder({
      amount: dto.amount,
      receipt: receiptId,
      notes,
    });

    // Create payment record in database
    const paymentRecord = {
      student_user_id: studentUserId,
      application_id: dto.applicationId || null,
      fee_id: dto.feeId || null,
      amount: dto.amount,
      fee_breakdown: dto.feeBreakdown || null,
      razorpay_order_id: order.id,
      status: 'INITIATED' as GatewayPaymentStatus,
      idempotency_key: idempotencyKey,
    };

    const { data: payment, error } = await this.supabase
      .from('gateway_payments')
      .insert(paymentRecord)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to create payment record: ${error.message}`);
      throw new InternalServerErrorException('Failed to initiate payment');
    }

    // Log payment initiation
    await this.logAudit('GATEWAY_PAYMENT', payment.id, 'INITIATE', studentUserId, {
      amount: dto.amount,
      razorpay_order_id: order.id,
    });

    return {
      paymentId: payment.id,
      orderId: order.id,
      keyId: this.razorpayService.getKeyId(),
      amount: order.amount,
      currency: order.currency,
      email: dto.email,
      mobile: dto.mobile,
      notes,
    };
  }

  /**
   * Verify and complete payment after Razorpay checkout
   */
  async verifyPayment(
    dto: VerifyPaymentDto,
    studentUserId: string,
  ): Promise<PaymentStatusResponseDto> {
    // Verify signature
    const isValid = this.razorpayService.verifyPaymentSignature({
      razorpay_order_id: dto.razorpay_order_id,
      razorpay_payment_id: dto.razorpay_payment_id,
      razorpay_signature: dto.razorpay_signature,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    // Find the payment record
    const { data: payment, error: fetchError } = await this.supabase
      .from('gateway_payments')
      .select('*')
      .eq('razorpay_order_id', dto.razorpay_order_id)
      .eq('student_user_id', studentUserId)
      .single();

    if (fetchError || !payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === 'SUCCESS') {
      // Already processed, return current status
      return this.buildPaymentStatusResponse(payment);
    }

    // Get payment details from Razorpay
    const razorpayPayment = await this.razorpayService.getPayment(dto.razorpay_payment_id);

    // Update payment record
    const { data: updatedPayment, error: updateError } = await this.supabase
      .from('gateway_payments')
      .update({
        razorpay_payment_id: dto.razorpay_payment_id,
        payment_method: razorpayPayment.method,
        status: 'SUCCESS',
        gateway_response: razorpayPayment,
        paid_at: new Date().toISOString(),
      })
      .eq('id', payment.id)
      .select()
      .single();

    if (updateError) {
      this.logger.error(`Failed to update payment: ${updateError.message}`);
      throw new InternalServerErrorException('Failed to verify payment');
    }

    // Update related fee if exists
    if (payment.fee_id) {
      await this.updateFeeOnPayment(payment.fee_id, payment.amount);
    }

    // Log payment success
    await this.logAudit('GATEWAY_PAYMENT', payment.id, 'SUCCESS', studentUserId, {
      razorpay_payment_id: dto.razorpay_payment_id,
      payment_method: razorpayPayment.method,
    });

    return this.buildPaymentStatusResponse(updatedPayment);
  }

  /**
   * Handle webhook events from Razorpay
   */
  async handleWebhook(
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    this.logger.log(`Processing webhook event: ${event}`);

    switch (event) {
      case 'payment.captured':
        await this.handlePaymentCaptured(payload);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(payload);
        break;
      case 'refund.created':
        await this.handleRefundCreated(payload);
        break;
      case 'refund.processed':
        await this.handleRefundProcessed(payload);
        break;
      default:
        this.logger.log(`Unhandled webhook event: ${event}`);
    }
  }

  /**
   * Handle payment.captured webhook
   */
  private async handlePaymentCaptured(payload: Record<string, unknown>): Promise<void> {
    const paymentData = payload.payment as Record<string, unknown>;
    const entity = paymentData?.entity as Record<string, unknown>;
    if (!entity) return;

    const orderId = entity.order_id as string;
    const paymentId = entity.id as string;

    // Find payment by order ID
    const { data: payment } = await this.supabase
      .from('gateway_payments')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single();

    if (!payment) {
      this.logger.warn(`Payment not found for order: ${orderId}`);
      return;
    }

    // Idempotency check
    if (payment.status === 'SUCCESS') {
      this.logger.log(`Payment ${payment.id} already marked as success`);
      return;
    }

    // Update payment
    await this.supabase
      .from('gateway_payments')
      .update({
        razorpay_payment_id: paymentId,
        payment_method: entity.method as string,
        status: 'SUCCESS',
        gateway_response: entity,
        paid_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    // Update related fee
    if (payment.fee_id) {
      await this.updateFeeOnPayment(payment.fee_id, payment.amount);
    }

    this.logger.log(`Payment ${payment.id} captured via webhook`);
  }

  /**
   * Handle payment.failed webhook
   */
  private async handlePaymentFailed(payload: Record<string, unknown>): Promise<void> {
    const paymentData = payload.payment as Record<string, unknown>;
    const entity = paymentData?.entity as Record<string, unknown>;
    if (!entity) return;

    const orderId = entity.order_id as string;

    const { data: payment } = await this.supabase
      .from('gateway_payments')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single();

    if (!payment) return;

    // Idempotency check
    if (payment.status === 'FAILED' || payment.status === 'SUCCESS') {
      return;
    }

    await this.supabase
      .from('gateway_payments')
      .update({
        status: 'FAILED',
        gateway_response: entity,
      })
      .eq('id', payment.id);

    this.logger.log(`Payment ${payment.id} failed via webhook`);
  }

  /**
   * Handle refund.created webhook
   */
  private async handleRefundCreated(payload: Record<string, unknown>): Promise<void> {
    const refundData = payload.refund as Record<string, unknown>;
    const entity = refundData?.entity as Record<string, unknown>;
    if (!entity) return;

    const paymentId = entity.payment_id as string;

    const { data: payment } = await this.supabase
      .from('gateway_payments')
      .select('*')
      .eq('razorpay_payment_id', paymentId)
      .single();

    if (!payment) return;

    const refundAmount = (entity.amount as number) / 100; // Convert paise to INR

    await this.supabase
      .from('gateway_payments')
      .update({
        status: refundAmount >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refund_amount: (payment.refund_amount || 0) + refundAmount,
      })
      .eq('id', payment.id);

    this.logger.log(`Refund created for payment ${payment.id}`);
  }

  /**
   * Handle refund.processed webhook
   */
  private async handleRefundProcessed(payload: Record<string, unknown>): Promise<void> {
    const refundData = payload.refund as Record<string, unknown>;
    const entity = refundData?.entity as Record<string, unknown>;
    if (!entity) return;

    const paymentId = entity.payment_id as string;

    const { data: payment } = await this.supabase
      .from('gateway_payments')
      .select('*')
      .eq('razorpay_payment_id', paymentId)
      .single();

    if (!payment) return;

    await this.supabase
      .from('gateway_payments')
      .update({
        refunded_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    this.logger.log(`Refund processed for payment ${payment.id}`);
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(
    paymentId: string,
    studentUserId: string,
    userRole: string,
  ): Promise<PaymentStatusResponseDto> {
    let query = this.supabase
      .from('gateway_payments')
      .select('*')
      .eq('id', paymentId);

    // Students can only see their own payments
    if (userRole === 'STUDENT') {
      query = query.eq('student_user_id', studentUserId);
    }

    const { data: payment, error } = await query.single();

    if (error || !payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.buildPaymentStatusResponse(payment);
  }

  /**
   * Process refund
   */
  async processRefund(
    paymentId: string,
    dto: RefundPaymentDto,
    processedBy: string,
  ): Promise<RefundResponseDto> {
    const { data: payment, error } = await this.supabase
      .from('gateway_payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error || !payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'SUCCESS') {
      throw new BadRequestException('Can only refund successful payments');
    }

    if (!payment.razorpay_payment_id) {
      throw new BadRequestException('No Razorpay payment ID found');
    }

    const refundAmount = dto.amount || payment.amount;
    const remainingAmount = payment.amount - (payment.refund_amount || 0);

    if (refundAmount > remainingAmount) {
      throw new BadRequestException(
        `Refund amount (${refundAmount}) exceeds remaining amount (${remainingAmount})`,
      );
    }

    // Process refund via Razorpay
    const refund = await this.razorpayService.refund({
      paymentId: payment.razorpay_payment_id,
      amount: refundAmount,
      notes: {
        reason: dto.reason,
        processedBy,
      },
    });

    // Update payment record
    const newRefundAmount = (payment.refund_amount || 0) + refundAmount;
    const newStatus: GatewayPaymentStatus =
      newRefundAmount >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

    await this.supabase
      .from('gateway_payments')
      .update({
        status: newStatus,
        refund_amount: newRefundAmount,
        refunded_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    // Log refund
    await this.logAudit('GATEWAY_PAYMENT', paymentId, 'REFUND', processedBy, {
      refund_id: refund.id,
      amount: refundAmount,
      reason: dto.reason,
    });

    return {
      refundId: refund.id,
      status: refund.status,
      amount: refundAmount,
      processedAt: new Date().toISOString(),
    };
  }

  /**
   * Update fee when payment is successful
   */
  private async updateFeeOnPayment(feeId: string, amount: number): Promise<void> {
    const { data: fee } = await this.supabase
      .from('fees')
      .select('*')
      .eq('id', feeId)
      .single();

    if (!fee) return;

    const newPaidAmount = fee.paid_amount + amount;
    const newStatus = newPaidAmount >= fee.amount ? 'PAID' : 'PARTIALLY_PAID';

    await this.supabase
      .from('fees')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
      })
      .eq('id', feeId);
  }

  /**
   * Build payment status response
   */
  private buildPaymentStatusResponse(payment: GatewayPayment): PaymentStatusResponseDto {
    return {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      orderId: payment.razorpay_order_id,
      razorpayPaymentId: payment.razorpay_payment_id,
      paymentMethod: payment.payment_method,
      paidAt: payment.paid_at,
      receiptUrl: payment.receipt_url,
    };
  }

  /**
   * Log audit entry
   */
  private async logAudit(
    entityType: string,
    entityId: string,
    action: string,
    actorId: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        entity_type: entityType,
        entity_id: entityId,
        action,
        actor_id: actorId,
        metadata: metadata || {},
      });
    } catch (error) {
      this.logger.error('Failed to log audit:', error);
    }
  }
}
