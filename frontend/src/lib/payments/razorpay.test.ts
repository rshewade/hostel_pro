import { describe, it, expect, vi } from 'vitest';
import { createHmac } from 'crypto';

vi.stubEnv('RAZORPAY_KEY_ID', 'rzp_test_KEYID');
vi.stubEnv('RAZORPAY_KEY_SECRET', 'TESTSECRET');
vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', 'WEBHOOKSECRET');

import {
  getRazorpayConfig,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from './razorpay';

describe('getRazorpayConfig', () => {
  it('reads keys from env', () => {
    const cfg = getRazorpayConfig();
    expect(cfg.keyId).toBe('rzp_test_KEYID');
    expect(cfg.keySecret).toBe('TESTSECRET');
    expect(cfg.webhookSecret).toBe('WEBHOOKSECRET');
  });
});

describe('verifyPaymentSignature', () => {
  it('returns true for a valid signature', () => {
    const orderId = 'order_ABC';
    const paymentId = 'pay_XYZ';
    const expected = createHmac('sha256', 'TESTSECRET')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    expect(verifyPaymentSignature({ orderId, paymentId, signature: expected })).toBe(true);
  });

  it('returns false for a tampered payment id', () => {
    const orderId = 'order_ABC';
    const paymentId = 'pay_XYZ';
    const expected = createHmac('sha256', 'TESTSECRET')
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    expect(
      verifyPaymentSignature({ orderId, paymentId: 'pay_OTHER', signature: expected }),
    ).toBe(false);
  });

  it('returns false for a tampered signature', () => {
    expect(
      verifyPaymentSignature({
        orderId: 'order_ABC',
        paymentId: 'pay_XYZ',
        signature: 'deadbeef',
      }),
    ).toBe(false);
  });
});

describe('verifyWebhookSignature', () => {
  it('returns true for a valid webhook signature', () => {
    const body = '{"event":"payment.captured"}';
    const sig = createHmac('sha256', 'WEBHOOKSECRET').update(body).digest('hex');
    expect(verifyWebhookSignature(body, sig)).toBe(true);
  });

  it('returns false when the body is mutated', () => {
    const body = '{"event":"payment.captured"}';
    const sig = createHmac('sha256', 'WEBHOOKSECRET').update(body).digest('hex');
    expect(verifyWebhookSignature('{"event":"payment.failed"}', sig)).toBe(false);
  });
});
