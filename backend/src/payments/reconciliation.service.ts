import {
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';
import { RazorpayService } from './razorpay/razorpay.service';
import { ConfigService } from '@nestjs/config';

export interface ReconciliationResult {
  date: string;
  totalPayments: number;
  totalAmount: number;
  settlementsMatched: number;
  discrepancies: ReconciliationDiscrepancy[];
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
}

export interface ReconciliationDiscrepancy {
  type: 'MISSING_IN_DB' | 'MISSING_IN_GATEWAY' | 'AMOUNT_MISMATCH' | 'STATUS_MISMATCH';
  paymentId?: string;
  razorpayPaymentId?: string;
  dbAmount?: number;
  gatewayAmount?: number;
  details: string;
}

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);
  private readonly isEnabled: boolean;

  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
    private razorpayService: RazorpayService,
    private configService: ConfigService,
  ) {
    // Only enable reconciliation if Razorpay is configured
    this.isEnabled = this.razorpayService.isConfigured() &&
      this.configService.get<string>('ENABLE_RECONCILIATION') === 'true';
  }

  /**
   * Daily reconciliation job - runs at 2 AM IST
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async runDailyReconciliation(): Promise<void> {
    if (!this.isEnabled) {
      this.logger.log('Reconciliation is disabled');
      return;
    }

    this.logger.log('Starting daily reconciliation job');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const result = await this.reconcile(yesterday, today);
      await this.logReconciliationResult(result);

      if (result.discrepancies.length > 0) {
        this.logger.warn(`Reconciliation found ${result.discrepancies.length} discrepancies`);
        // TODO: Send notification to accounts team
      } else {
        this.logger.log('Reconciliation completed successfully with no discrepancies');
      }
    } catch (error) {
      this.logger.error(`Reconciliation failed: ${error.message}`);
      await this.logReconciliationResult({
        date: yesterday.toISOString().split('T')[0],
        totalPayments: 0,
        totalAmount: 0,
        settlementsMatched: 0,
        discrepancies: [{
          type: 'MISSING_IN_GATEWAY',
          details: `Reconciliation job failed: ${error.message}`,
        }],
        status: 'FAILED',
      });
    }
  }

  /**
   * Manual reconciliation for a date range
   */
  async reconcile(from: Date, to: Date): Promise<ReconciliationResult> {
    const dateStr = from.toISOString().split('T')[0];

    // Fetch payments from database
    const { data: dbPayments, error: dbError } = await this.supabase
      .from('gateway_payments')
      .select('*')
      .eq('status', 'SUCCESS')
      .gte('paid_at', from.toISOString())
      .lt('paid_at', to.toISOString());

    if (dbError) {
      throw new Error(`Failed to fetch DB payments: ${dbError.message}`);
    }

    // Create map of DB payments by Razorpay payment ID
    const dbPaymentMap = new Map<string, typeof dbPayments[0]>();
    let totalDbAmount = 0;

    (dbPayments || []).forEach((payment) => {
      if (payment.razorpay_payment_id) {
        dbPaymentMap.set(payment.razorpay_payment_id, payment);
        totalDbAmount += payment.amount;
      }
    });

    const discrepancies: ReconciliationDiscrepancy[] = [];
    let settlementsMatched = 0;

    // Fetch settlements from Razorpay
    try {
      const settlements = await this.razorpayService.fetchSettlements(from, to);

      // Process each settlement
      for (const settlement of settlements as Record<string, unknown>[]) {
        const paymentId = settlement.payment_id as string;
        const gatewayAmount = ((settlement.amount as number) || 0) / 100; // Convert paise to INR

        if (paymentId && dbPaymentMap.has(paymentId)) {
          const dbPayment = dbPaymentMap.get(paymentId)!;

          // Check amount match
          if (Math.abs(dbPayment.amount - gatewayAmount) > 0.01) {
            discrepancies.push({
              type: 'AMOUNT_MISMATCH',
              paymentId: dbPayment.id,
              razorpayPaymentId: paymentId,
              dbAmount: dbPayment.amount,
              gatewayAmount,
              details: `Amount mismatch: DB=${dbPayment.amount}, Gateway=${gatewayAmount}`,
            });
          } else {
            settlementsMatched++;
          }

          dbPaymentMap.delete(paymentId);
        } else if (paymentId) {
          // Payment in gateway but not in DB
          discrepancies.push({
            type: 'MISSING_IN_DB',
            razorpayPaymentId: paymentId,
            gatewayAmount,
            details: `Payment found in Razorpay but missing in database`,
          });
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch Razorpay settlements: ${error.message}`);
      // Continue with DB-only reconciliation
    }

    // Check for payments in DB but not in settlements
    dbPaymentMap.forEach((payment, razorpayPaymentId) => {
      discrepancies.push({
        type: 'MISSING_IN_GATEWAY',
        paymentId: payment.id,
        razorpayPaymentId,
        dbAmount: payment.amount,
        details: `Payment found in database but not in Razorpay settlements`,
      });
    });

    const status: ReconciliationResult['status'] =
      discrepancies.length === 0 ? 'SUCCESS' :
        discrepancies.length < (dbPayments?.length || 1) / 2 ? 'PARTIAL' : 'FAILED';

    return {
      date: dateStr,
      totalPayments: dbPayments?.length || 0,
      totalAmount: totalDbAmount,
      settlementsMatched,
      discrepancies,
      status,
    };
  }

  /**
   * Log reconciliation result to database
   */
  private async logReconciliationResult(result: ReconciliationResult): Promise<void> {
    const { error } = await this.supabase
      .from('reconciliation_logs')
      .insert({
        reconciliation_date: result.date,
        total_payments: result.totalPayments,
        total_amount: result.totalAmount,
        settlements_matched: result.settlementsMatched,
        discrepancies_count: result.discrepancies.length,
        discrepancies: result.discrepancies,
        status: result.status,
        created_at: new Date().toISOString(),
      });

    if (error) {
      this.logger.error(`Failed to log reconciliation result: ${error.message}`);
    }
  }

  /**
   * Get reconciliation logs
   */
  async getReconciliationLogs(
    startDate?: string,
    endDate?: string,
    limit: number = 30,
  ): Promise<unknown[]> {
    let query = this.supabase
      .from('reconciliation_logs')
      .select('*')
      .order('reconciliation_date', { ascending: false })
      .limit(limit);

    if (startDate) {
      query = query.gte('reconciliation_date', startDate);
    }
    if (endDate) {
      query = query.lte('reconciliation_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error(`Failed to fetch reconciliation logs: ${error.message}`);
      return [];
    }

    return data || [];
  }

  /**
   * Get discrepancies summary
   */
  async getDiscrepanciesSummary(): Promise<{
    totalDiscrepancies: number;
    byType: Record<string, number>;
    unresolvedAmount: number;
  }> {
    const { data: logs } = await this.supabase
      .from('reconciliation_logs')
      .select('discrepancies, discrepancies_count')
      .neq('status', 'SUCCESS')
      .gte('reconciliation_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    const byType: Record<string, number> = {};
    let totalDiscrepancies = 0;
    let unresolvedAmount = 0;

    (logs || []).forEach((log) => {
      totalDiscrepancies += log.discrepancies_count || 0;

      const discrepancies = (log.discrepancies || []) as ReconciliationDiscrepancy[];
      discrepancies.forEach((d) => {
        byType[d.type] = (byType[d.type] || 0) + 1;
        if (d.dbAmount) {
          unresolvedAmount += d.dbAmount;
        } else if (d.gatewayAmount) {
          unresolvedAmount += d.gatewayAmount;
        }
      });
    });

    return {
      totalDiscrepancies,
      byType,
      unresolvedAmount,
    };
  }
}
