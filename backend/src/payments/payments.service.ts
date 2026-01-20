import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Fee,
  Payment,
  PaymentStatus,
  FeeListResult,
  PaymentListResult,
  PaymentSummary,
} from './payments.types';
import {
  CreateFeeDto,
  RecordPaymentDto,
  VerifyPaymentDto,
  UpdateFeeStatusDto,
  ListFeesDto,
  ListPaymentsDto,
} from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
  ) {}

  /**
   * Generate a unique receipt number
   * Format: RCP-YYYY-NNNNN
   */
  private async generateReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `RCP-${year}-`;

    const { data, error } = await this.supabase
      .from('payments')
      .select('receipt_number')
      .like('receipt_number', `${prefix}%`)
      .order('receipt_number', { ascending: false })
      .limit(1);

    if (error) {
      throw new InternalServerErrorException('Failed to generate receipt number');
    }

    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = parseInt(data[0].receipt_number.split('-')[2], 10);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
  }

  /**
   * Create a new fee
   */
  async createFee(dto: CreateFeeDto, createdBy: string): Promise<Fee> {
    const feeRecord = {
      student_user_id: dto.studentUserId,
      application_id: dto.applicationId || null,
      fee_type: dto.feeType,
      amount: dto.amount,
      due_date: dto.dueDate,
      status: 'PENDING' as PaymentStatus,
      paid_amount: 0,
      description: dto.description || null,
    };

    const { data, error } = await this.supabase
      .from('fees')
      .insert(feeRecord)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to create fee: ${error.message}`,
      );
    }

    // Log fee creation
    await this.logAudit('FEE', data.id, 'CREATE', createdBy, { fee_type: dto.feeType, amount: dto.amount });

    return data;
  }

  /**
   * Get fee by ID
   */
  async getFeeById(feeId: string): Promise<Fee> {
    const { data, error } = await this.supabase
      .from('fees')
      .select('*')
      .eq('id', feeId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Fee not found: ${feeId}`);
    }

    return data;
  }

  /**
   * List fees with filters
   */
  async listFees(
    filters: ListFeesDto,
    userId: string,
    userRole: string,
  ): Promise<FeeListResult> {
    let query = this.supabase.from('fees').select('*', { count: 'exact' });

    // Role-based filtering
    if (userRole === 'STUDENT') {
      query = query.eq('student_user_id', userId);
    } else if (filters.studentUserId) {
      query = query.eq('student_user_id', filters.studentUserId);
    }

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.feeType) {
      query = query.eq('fee_type', filters.feeType);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('due_date', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new InternalServerErrorException(
        `Failed to list fees: ${error.message}`,
      );
    }

    return {
      fees: data || [],
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Record a payment against a fee
   */
  async recordPayment(
    dto: RecordPaymentDto,
    recordedBy: string,
  ): Promise<Payment> {
    const fee = await this.getFeeById(dto.feeId);

    // Check if payment amount is valid
    const remainingAmount = fee.amount - fee.paid_amount;
    if (dto.amount > remainingAmount) {
      throw new BadRequestException(
        `Payment amount (${dto.amount}) exceeds remaining amount (${remainingAmount})`,
      );
    }

    const receiptNumber = await this.generateReceiptNumber();

    const paymentRecord = {
      fee_id: dto.feeId,
      student_user_id: fee.student_user_id,
      amount: dto.amount,
      payment_method: dto.paymentMethod,
      payment_reference: dto.paymentReference || null,
      payment_date: dto.paymentDate || new Date().toISOString().split('T')[0],
      receipt_number: receiptNumber,
      notes: dto.notes || null,
    };

    const { data: payment, error: paymentError } = await this.supabase
      .from('payments')
      .insert(paymentRecord)
      .select()
      .single();

    if (paymentError) {
      throw new InternalServerErrorException(
        `Failed to record payment: ${paymentError.message}`,
      );
    }

    // Update fee status and paid amount
    const newPaidAmount = fee.paid_amount + dto.amount;
    const newStatus: PaymentStatus = newPaidAmount >= fee.amount ? 'PAID' : 'PARTIALLY_PAID';

    await this.supabase
      .from('fees')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
      })
      .eq('id', dto.feeId);

    // Log payment
    await this.logAudit('PAYMENT', payment.id, 'CREATE', recordedBy, {
      fee_id: dto.feeId,
      amount: dto.amount,
      receipt_number: receiptNumber,
    });

    return payment;
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Payment not found: ${paymentId}`);
    }

    return data;
  }

  /**
   * Verify a payment (by Accounts)
   */
  async verifyPayment(
    paymentId: string,
    dto: VerifyPaymentDto,
    verifiedBy: string,
  ): Promise<Payment> {
    const payment = await this.getPaymentById(paymentId);

    if (payment.verified_by) {
      throw new BadRequestException('Payment is already verified');
    }

    const { data, error } = await this.supabase
      .from('payments')
      .update({
        verified_by: verifiedBy,
        verified_at: new Date().toISOString(),
        notes: dto.notes ? `${payment.notes || ''}\nVerification: ${dto.notes}` : payment.notes,
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to verify payment: ${error.message}`,
      );
    }

    // Log verification
    await this.logAudit('PAYMENT', paymentId, 'VERIFY', verifiedBy, {
      receipt_number: payment.receipt_number,
    });

    return data;
  }

  /**
   * Update fee status (e.g., waiver)
   */
  async updateFeeStatus(
    feeId: string,
    dto: UpdateFeeStatusDto,
    updatedBy: string,
  ): Promise<Fee> {
    const fee = await this.getFeeById(feeId);

    if (dto.status === 'WAIVED' && !dto.reason) {
      throw new BadRequestException('Reason is required for fee waiver');
    }

    const updateData: Partial<Fee> = {
      status: dto.status,
    };

    if (dto.status === 'WAIVED') {
      updateData.paid_amount = fee.amount; // Mark as fully paid when waived
    }

    const { data, error } = await this.supabase
      .from('fees')
      .update(updateData)
      .eq('id', feeId)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to update fee status: ${error.message}`,
      );
    }

    // Log status change
    await this.logAudit('FEE', feeId, 'STATUS_CHANGE', updatedBy, {
      new_status: dto.status,
      reason: dto.reason,
    });

    return data;
  }

  /**
   * List payments with filters
   */
  async listPayments(
    filters: ListPaymentsDto,
    userId: string,
    userRole: string,
  ): Promise<PaymentListResult> {
    let query = this.supabase.from('payments').select('*', { count: 'exact' });

    // Role-based filtering
    if (userRole === 'STUDENT') {
      query = query.eq('student_user_id', userId);
    } else if (filters.studentUserId) {
      query = query.eq('student_user_id', filters.studentUserId);
    }

    // Apply filters
    if (filters.feeId) {
      query = query.eq('fee_id', filters.feeId);
    }
    if (filters.startDate) {
      query = query.gte('payment_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('payment_date', filters.endDate);
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    query = query
      .order('payment_date', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new InternalServerErrorException(
        `Failed to list payments: ${error.message}`,
      );
    }

    return {
      payments: data || [],
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Get payment summary for a student
   */
  async getPaymentSummary(
    studentUserId: string,
    userId: string,
    userRole: string,
  ): Promise<PaymentSummary> {
    // Students can only view their own summary
    if (userRole === 'STUDENT' && studentUserId !== userId) {
      throw new ForbiddenException('You can only view your own payment summary');
    }

    const { data: fees, error } = await this.supabase
      .from('fees')
      .select('amount, paid_amount, status, due_date')
      .eq('student_user_id', studentUserId);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to get payment summary: ${error.message}`,
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const summary: PaymentSummary = {
      totalDue: 0,
      totalPaid: 0,
      totalPending: 0,
      overdueFees: 0,
    };

    if (fees) {
      fees.forEach((fee) => {
        summary.totalDue += fee.amount;
        summary.totalPaid += fee.paid_amount;

        if (fee.status !== 'PAID' && fee.status !== 'WAIVED') {
          summary.totalPending += (fee.amount - fee.paid_amount);

          if (fee.due_date < today) {
            summary.overdueFees++;
          }
        }
      });
    }

    return summary;
  }

  /**
   * Get student's fees (for student dashboard)
   */
  async getStudentFees(userId: string): Promise<Fee[]> {
    const { data, error } = await this.supabase
      .from('fees')
      .select('*')
      .eq('student_user_id', userId)
      .order('due_date', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to get student fees: ${error.message}`,
      );
    }

    return data || [];
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
      console.error('Failed to log audit:', error);
    }
  }
}
