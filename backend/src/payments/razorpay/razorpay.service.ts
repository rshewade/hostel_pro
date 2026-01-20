import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { RAZORPAY_CLIENT } from './razorpay.provider';

export interface CreateOrderParams {
  amount: number; // in INR (will be converted to paise)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  notes: Record<string, string>;
  created_at: number;
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RefundParams {
  paymentId: string;
  amount?: number; // in INR (will be converted to paise)
  notes?: Record<string, string>;
}

export interface RazorpayRefund {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  status: string;
  created_at: number;
}

export interface PaymentDetails {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string;
  description: string;
  email: string;
  contact: string;
  fee: number;
  tax: number;
  captured: boolean;
  created_at: number;
}

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private readonly webhookSecret: string;

  constructor(
    @Inject(RAZORPAY_CLIENT) private razorpay: Razorpay | null,
    private configService: ConfigService,
  ) {
    this.webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') || '';
  }

  /**
   * Check if Razorpay is configured
   */
  isConfigured(): boolean {
    return this.razorpay !== null;
  }

  /**
   * Create a Razorpay order
   */
  async createOrder(params: CreateOrderParams): Promise<RazorpayOrder> {
    if (!this.razorpay) {
      throw new InternalServerErrorException('Razorpay is not configured');
    }

    try {
      const order = await this.razorpay.orders.create({
        amount: params.amount * 100, // Convert INR to paise
        currency: params.currency || 'INR',
        receipt: params.receipt,
        notes: params.notes || {},
      });

      this.logger.log(`Created Razorpay order: ${order.id}`);
      return order as RazorpayOrder;
    } catch (error) {
      this.logger.error(`Failed to create Razorpay order: ${error.message}`);
      throw new InternalServerErrorException('Failed to create payment order');
    }
  }

  /**
   * Verify payment signature (client-side callback verification)
   */
  verifyPaymentSignature(params: VerifyPaymentParams): boolean {
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
    if (!keySecret) {
      throw new InternalServerErrorException('Razorpay key secret not configured');
    }

    const body = params.razorpay_order_id + '|' + params.razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    return expectedSignature === params.razorpay_signature;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('Webhook secret not configured, skipping verification');
      return true; // Allow in development, but log warning
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string): Promise<PaymentDetails> {
    if (!this.razorpay) {
      throw new InternalServerErrorException('Razorpay is not configured');
    }

    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment as PaymentDetails;
    } catch (error) {
      this.logger.error(`Failed to fetch payment: ${error.message}`);
      throw new BadRequestException('Failed to fetch payment details');
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string): Promise<RazorpayOrder> {
    if (!this.razorpay) {
      throw new InternalServerErrorException('Razorpay is not configured');
    }

    try {
      const order = await this.razorpay.orders.fetch(orderId);
      return order as RazorpayOrder;
    } catch (error) {
      this.logger.error(`Failed to fetch order: ${error.message}`);
      throw new BadRequestException('Failed to fetch order details');
    }
  }

  /**
   * Capture a payment (for authorized payments)
   */
  async capturePayment(paymentId: string, amount: number): Promise<PaymentDetails> {
    if (!this.razorpay) {
      throw new InternalServerErrorException('Razorpay is not configured');
    }

    try {
      const payment = await this.razorpay.payments.capture(
        paymentId,
        amount * 100, // Convert to paise
        'INR',
      );
      this.logger.log(`Captured payment: ${paymentId}`);
      return payment as PaymentDetails;
    } catch (error) {
      this.logger.error(`Failed to capture payment: ${error.message}`);
      throw new InternalServerErrorException('Failed to capture payment');
    }
  }

  /**
   * Initiate a refund
   */
  async refund(params: RefundParams): Promise<RazorpayRefund> {
    if (!this.razorpay) {
      throw new InternalServerErrorException('Razorpay is not configured');
    }

    try {
      const refundOptions: Record<string, unknown> = {};

      if (params.amount) {
        refundOptions.amount = params.amount * 100; // Convert to paise
      }
      if (params.notes) {
        refundOptions.notes = params.notes;
      }

      const refund = await this.razorpay.payments.refund(
        params.paymentId,
        refundOptions,
      );

      this.logger.log(`Created refund: ${refund.id} for payment: ${params.paymentId}`);
      return refund as RazorpayRefund;
    } catch (error) {
      this.logger.error(`Failed to create refund: ${error.message}`);
      throw new InternalServerErrorException('Failed to process refund');
    }
  }

  /**
   * Get refund details
   */
  async getRefund(paymentId: string, refundId: string): Promise<RazorpayRefund> {
    if (!this.razorpay) {
      throw new InternalServerErrorException('Razorpay is not configured');
    }

    try {
      const refund = await this.razorpay.payments.fetchRefund(paymentId, refundId);
      return refund as RazorpayRefund;
    } catch (error) {
      this.logger.error(`Failed to fetch refund: ${error.message}`);
      throw new BadRequestException('Failed to fetch refund details');
    }
  }

  /**
   * Fetch settlements for reconciliation
   */
  async fetchSettlements(from: Date, to: Date): Promise<unknown[]> {
    if (!this.razorpay) {
      throw new InternalServerErrorException('Razorpay is not configured');
    }

    try {
      const settlements = await this.razorpay.settlements.all({
        from: Math.floor(from.getTime() / 1000),
        to: Math.floor(to.getTime() / 1000),
      });
      return settlements.items || [];
    } catch (error) {
      this.logger.error(`Failed to fetch settlements: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch settlements');
    }
  }

  /**
   * Get Razorpay key ID for frontend
   */
  getKeyId(): string {
    return this.configService.get<string>('RAZORPAY_KEY_ID') || '';
  }
}
