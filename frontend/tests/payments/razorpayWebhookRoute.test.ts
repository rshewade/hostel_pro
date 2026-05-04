/**
 * Tests for POST /api/payments/razorpay/webhook — proves the async safety
 * net flips state on payment.captured and is idempotent against duplicate
 * deliveries.
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
    if (/SELECT t\.id, t\.status, t\.fee_id, f\.application_id, f\.amount AS fee_amount/.test(sql)) {
      return {
        rows: [
          {
            id: 'txn-1',
            status: 'PENDING',
            fee_id: 'fee-1',
            application_id: 'app-1',
            fee_amount: '500',
          },
        ],
      };
    }
    return { rows: [] };
  }),
}));

import { POST } from '@/app/api/payments/razorpay/webhook/route';

function makeWebhookRequest(payload: any, signWith = 'WEBHOOKSECRET') {
  const body = JSON.stringify(payload);
  const sig = createHmac('sha256', signWith).update(body).digest('hex');
  return new Request('http://localhost/api/payments/razorpay/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': sig },
    body,
  }) as any;
}

function payload(eventType: string, orderId: string, paymentId: string, amountPaise = 50000) {
  return {
    event: eventType,
    payload: {
      payment: { entity: { id: paymentId, order_id: orderId, amount: amountPaise } },
    },
  };
}

beforeEach(() => {
  dbCalls.length = 0;
});

describe('POST /api/payments/razorpay/webhook', () => {
  it('on payment.captured: marks txn SUCCESS, fee PAID, app SUBMITTED + payment_status=PAID', async () => {
    const res = await POST(makeWebhookRequest(payload('payment.captured', 'order_OK', 'pay_OK')));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);

    expect(dbCalls.some((c) => /UPDATE transactions[\s\S]*status='SUCCESS'/.test(c.sql))).toBe(true);
    expect(dbCalls.some((c) => /UPDATE fees[\s\S]*status='PAID'/.test(c.sql))).toBe(true);
    const appUpdate = dbCalls.find((c) => /UPDATE applications[\s\S]*payment_status\s*=\s*'PAID'/.test(c.sql));
    expect(appUpdate, "applications.payment_status set to 'PAID'").toBeTruthy();
    expect(appUpdate?.params).toEqual(['app-1']);
  });

  it('rejects when the webhook signature is invalid', async () => {
    const res = await POST(makeWebhookRequest(payload('payment.captured', 'order_X', 'pay_X'), 'WRONGSECRET'));
    expect(res.status).toBe(400);
    expect(dbCalls.some((c) => /UPDATE/.test(c.sql))).toBe(false);
  });

  it('idempotent on duplicate webhook (txn already SUCCESS): no further mutations', async () => {
    const { query } = await import('@/lib/db');
    vi.mocked(query).mockImplementationOnce(async (sql: string, params?: any[]) => {
      dbCalls.push({ sql, params });
      return {
        rows: [
          {
            id: 'txn-1',
            status: 'SUCCESS',
            fee_id: 'fee-1',
            application_id: 'app-1',
            fee_amount: '500',
          },
        ],
      };
    });

    const res = await POST(makeWebhookRequest(payload('payment.captured', 'order_DUP', 'pay_DUP')));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.idempotent).toBe(true);
    expect(dbCalls.some((c) => /UPDATE/.test(c.sql))).toBe(false);
  });

  it('on payment.failed: marks txn FAILED, leaves fees and applications untouched', async () => {
    const res = await POST(makeWebhookRequest(payload('payment.failed', 'order_F', 'pay_F')));
    expect(res.status).toBe(200);

    expect(dbCalls.some((c) => /UPDATE transactions[\s\S]*status='FAILED'/.test(c.sql))).toBe(true);
    expect(dbCalls.some((c) => /UPDATE fees/.test(c.sql))).toBe(false);
    expect(dbCalls.some((c) => /UPDATE applications/.test(c.sql))).toBe(false);
  });

  it('rejects when payment.captured amount does not match fee_amount', async () => {
    const res = await POST(makeWebhookRequest(payload('payment.captured', 'order_AMT', 'pay_AMT', 1)));
    expect(res.status).toBe(400);
    expect(dbCalls.some((c) => /UPDATE transactions[\s\S]*status='SUCCESS'/.test(c.sql))).toBe(false);
  });
});
