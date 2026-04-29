'use client';
import { useState, useEffect } from 'react';
import { AdmissionFeeNotice } from './AdmissionFeeNotice';

declare global {
  interface Window {
    Paytm?: any;
  }
}

interface Props {
  applicationId: string;
  onSuccess: () => void;
  onFailure: (reason: string) => void;
}

export function AdmissionFeeStep({ applicationId, onSuccess, onFailure }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const env = process.env.NEXT_PUBLIC_PAYTM_ENV || 'staging';
    const mid = process.env.NEXT_PUBLIC_PAYTM_MID;
    if (!mid) return;
    const host = env === 'production' ? 'securegw.paytm.in' : 'securegw-stage.paytm.in';
    const src = `https://${host}/merchantpgpui/checkoutjs/merchants/${mid}.js`;
    if (document.querySelector(`script[src="${src}"]`)) return;
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.crossOrigin = 'anonymous';
    document.body.appendChild(s);
  }, []);

  async function pollStatus(orderId: string, attempts = 20): Promise<'SUCCESS' | 'FAILED' | 'PENDING'> {
    for (let i = 0; i < attempts; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const res = await fetch(`/api/payments/paytm/status/${orderId}`);
      const json = await res.json();
      const s = json?.data?.txnStatus;
      if (s === 'SUCCESS') return 'SUCCESS';
      if (s === 'FAILED') return 'FAILED';
    }
    return 'PENDING';
  }

  async function handlePay() {
    setBusy(true);
    setError(null);
    try {
      const initRes = await fetch('/api/payments/paytm/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId }),
      });
      const initJson = await initRes.json();
      if (!initRes.ok || !initJson?.data?.txnToken) {
        throw new Error(initJson?.error || 'Failed to start payment');
      }
      const { orderId, txnToken, amount, mid } = initJson.data;

      if (!window.Paytm?.CheckoutJS) {
        throw new Error('Payment library still loading. Please retry in a moment.');
      }

      const config = {
        root: '',
        flow: 'DEFAULT',
        data: { orderId, token: txnToken, tokenType: 'TXN_TOKEN', amount: String(amount) },
        merchant: { mid, redirect: false },
        handler: {
          notifyMerchant: async (eventName: string) => {
            if (eventName === 'APP_CLOSED' || eventName === 'SESSION_EXPIRED') {
              const final = await pollStatus(orderId, 3);
              if (final === 'SUCCESS') onSuccess();
              else if (final === 'FAILED') onFailure('Payment was not completed');
              else onFailure('Payment cancelled');
              setBusy(false);
            }
          },
          transactionStatus: async () => {
            const final = await pollStatus(orderId, 20);
            if (final === 'SUCCESS') onSuccess();
            else if (final === 'FAILED') onFailure('Payment failed');
            else onFailure('Payment is still being processed. We will email you once confirmed.');
            setBusy(false);
          },
        },
      };

      window.Paytm.CheckoutJS.init(config).then(() => {
        window.Paytm.CheckoutJS.invoke();
      }).catch((e: any) => {
        throw new Error(e?.message || 'Checkout init failed');
      });
    } catch (e: any) {
      setError(e.message || 'Payment failed');
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <AdmissionFeeNotice />
      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <button
        type="button"
        onClick={handlePay}
        disabled={busy}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? 'Processing…' : 'Pay ₹500 & Submit Application'}
      </button>
    </div>
  );
}
