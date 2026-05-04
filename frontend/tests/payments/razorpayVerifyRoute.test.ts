/**
 * Tests for POST /api/payments/razorpay/verify — proves that on a valid
 * Razorpay signature the route flips fees → PAID, applications →
 * SUBMITTED + payment_status='PAID', and the transaction → SUCCESS.
 *
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHmac } from 'crypto';

vi.stubEnv('RAZORPAY_KEY_ID', 'rzp_test_TESTKEY');
vi.stubEnv('RAZORPAY_KEY_SECRET', 'TESTSECRET');
vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', 'WEBHOOKSECRET');

const dbCalls: Array<{ sql: string; params?: any[] }> = [];

vi.mock('@/lib/db', () => ({
  query: vi.fn(async (sql: string, params?: any[]) => {
    dbCalls.push({ sql, params });
    if (/SELECT t\.id, t\.fee_id, t\.status, f\.application_id, f\.amount AS fee_amount/.test(sql)) {
      return {
        rows: [
          {
            id: 'txn-1',
            fee_id: 'fee-1',
            status: 'PENDING',
            application_id: 'app-1',
            fee_amount: '500',
          },
        ],
      };
    }
    if (/SELECT a\.applicant_email, a\.applicant_name, f\.fee_head/.test(sql)) {
      return {
        rows: [{ applicant_email: 'sonia@example.com', applicant_name: 'Sonia', fee_head: 'ADMISSION_FEE' }],
      };
    }
    return { rows: [] };
  }),
}));

vi.mock('@/lib/mailer', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/email-templates/payment-receipt', () => ({
  renderPaymentReceipt: vi.fn().mockReturnValue({ subject: 's', html: 'h', text: 't' }),
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { POST } from '@/app/api/payments/razorpay/verify/route';

function makeRequest(body: any) {
  return new Request('http://localhost/api/payments/razorpay/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any;
}

function validSignature(orderId: string, paymentId: string): string {
  return createHmac('sha256', 'TESTSECRET').update(`${orderId}|${paymentId}`).digest('hex');
}

beforeEach(() => {
  dbCalls.length = 0;
});

describe('POST /api/payments/razorpay/verify', () => {
  it('marks payment as done: transactions.SUCCESS, fees.PAID, applications.SUBMITTED + payment_status=PAID', async () => {
    const orderId = 'order_OK';
    const paymentId = 'pay_OK';
    const sig = validSignature(orderId, paymentId);

    const res = await POST(
      makeRequest({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: sig,
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ success: true, data: { status: 'SUCCESS' } });

    const txnUpdate = dbCalls.find((c) => /UPDATE transactions[\s\S]*status='SUCCESS'/.test(c.sql));
    expect(txnUpdate, 'transactions table updated to SUCCESS').toBeTruthy();

    const feeUpdate = dbCalls.find((c) => /UPDATE fees[\s\S]*status='PAID'/.test(c.sql));
    expect(feeUpdate, 'fees row marked PAID').toBeTruthy();

    const appUpdate = dbCalls.find((c) => /UPDATE applications[\s\S]*payment_status\s*=\s*'PAID'/.test(c.sql));
    expect(appUpdate, "applications.payment_status set to 'PAID'").toBeTruthy();
    expect(appUpdate?.sql, 'flips DRAFT to SUBMITTED on first verify').toMatch(/'SUBMITTED'::application_status/);
    expect(appUpdate?.params).toEqual(['app-1']);
  });

  it('rejects an invalid signature and marks the transaction FAILED', async () => {
    const res = await POST(
      makeRequest({
        razorpay_order_id: 'order_BAD',
        razorpay_payment_id: 'pay_BAD',
        razorpay_signature: 'deadbeef',
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Invalid signature/i);

    const txnFailed = dbCalls.find((c) => /UPDATE transactions[\s\S]*status='FAILED'/.test(c.sql));
    expect(txnFailed, 'transaction marked FAILED on bad signature').toBeTruthy();

    // No fee or application mutation on failure
    expect(dbCalls.some((c) => /UPDATE fees/.test(c.sql))).toBe(false);
    expect(dbCalls.some((c) => /UPDATE applications/.test(c.sql))).toBe(false);
  });

  it('is idempotent: re-verifying a SUCCESS transaction returns idempotent without re-writing', async () => {
    const { query } = await import('@/lib/db');
    vi.mocked(query).mockImplementationOnce(async (sql: string, params?: any[]) => {
      dbCalls.push({ sql, params });
      return {
        rows: [
          {
            id: 'txn-1',
            fee_id: 'fee-1',
            status: 'SUCCESS',
            application_id: 'app-1',
            fee_amount: '500',
          },
        ],
      };
    });

    const orderId = 'order_DUP';
    const paymentId = 'pay_DUP';
    const res = await POST(
      makeRequest({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature(orderId, paymentId),
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toEqual({ status: 'SUCCESS', idempotent: true });

    expect(dbCalls.some((c) => /UPDATE transactions/.test(c.sql))).toBe(false);
    expect(dbCalls.some((c) => /UPDATE fees/.test(c.sql))).toBe(false);
    expect(dbCalls.some((c) => /UPDATE applications/.test(c.sql))).toBe(false);
  });

  it('rejects when transaction is not found', async () => {
    const { query } = await import('@/lib/db');
    vi.mocked(query).mockImplementationOnce(async (sql: string, params?: any[]) => {
      dbCalls.push({ sql, params });
      return { rows: [] };
    });

    const orderId = 'order_404';
    const paymentId = 'pay_404';
    const res = await POST(
      makeRequest({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSignature(orderId, paymentId),
      }),
    );

    expect(res.status).toBe(404);
  });

  it('rejects when required fields are missing', async () => {
    const res = await POST(makeRequest({ razorpay_order_id: 'x' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/required/i);
  });
});
