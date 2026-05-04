declare global {
  interface Window {
    Razorpay?: any;
  }
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptPromise: Promise<void> | null = null;

export function loadCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Not in browser'));
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout')));
      return;
    }
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
    document.body.appendChild(s);
  });
  return scriptPromise;
}

export interface OpenCheckoutOptions {
  keyId: string;
  orderId: string;
  amount: number; // rupees
  currency: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

export interface CheckoutResult {
  status: 'SUCCESS' | 'CANCELLED' | 'FAILED';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  error?: string;
}

export async function openCheckout(opts: OpenCheckoutOptions): Promise<CheckoutResult> {
  await loadCheckoutScript();
  if (!window.Razorpay) throw new Error('Razorpay checkout not available');

  return new Promise<CheckoutResult>((resolve) => {
    const rzp = new window.Razorpay({
      key: opts.keyId,
      order_id: opts.orderId,
      amount: Math.round(opts.amount * 100),
      currency: opts.currency,
      name: opts.name,
      description: opts.description,
      prefill: opts.prefill,
      handler: (response: any) => {
        resolve({
          status: 'SUCCESS',
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => resolve({ status: 'CANCELLED' }),
      },
    });
    rzp.on('payment.failed', (resp: any) => {
      resolve({ status: 'FAILED', error: resp?.error?.description || 'Payment failed' });
    });
    rzp.open();
  });
}
