import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

export function getRazorpayConfig(): RazorpayConfig {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!keyId || !keySecret) {
    throw new Error(
      'Razorpay env vars not configured: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET required',
    );
  }
  return { keyId, keySecret, webhookSecret };
}

function constantTimeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

export function verifyPaymentSignature(opts: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getRazorpayConfig();
  const expected = createHmac('sha256', keySecret)
    .update(`${opts.orderId}|${opts.paymentId}`)
    .digest('hex');
  return constantTimeEqualHex(expected, opts.signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const { webhookSecret } = getRazorpayConfig();
  if (!webhookSecret) return false;
  const expected = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  return constantTimeEqualHex(expected, signature);
}

export function generateReceipt(applicationId: string): string {
  const short = applicationId.replace(/-/g, '').slice(0, 12);
  const ts = Date.now().toString(36);
  const rand = randomBytes(2).toString('hex');
  return `ADM_${short}_${ts}_${rand}`.slice(0, 40);
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
}

export async function createOrder(opts: {
  amount: number; // rupees
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const cfg = getRazorpayConfig();
  const auth = Buffer.from(`${cfg.keyId}:${cfg.keySecret}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(opts.amount * 100), // paise
      currency: opts.currency || 'INR',
      receipt: opts.receipt,
      notes: opts.notes || {},
    }),
  });
  const json = await res.json();
  if (!res.ok || !json?.id) {
    throw new Error(`Razorpay createOrder failed: ${json?.error?.description || res.status}`);
  }
  return {
    id: json.id,
    amount: json.amount,
    currency: json.currency,
    status: json.status,
    receipt: json.receipt,
  };
}

export async function fetchPayment(paymentId: string): Promise<any> {
  const cfg = getRazorpayConfig();
  const auth = Buffer.from(`${cfg.keyId}:${cfg.keySecret}`).toString('base64');
  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return res.json();
}
