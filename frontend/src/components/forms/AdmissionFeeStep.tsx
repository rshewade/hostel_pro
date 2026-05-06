'use client';
import { useState } from 'react';
import { AdmissionFeeNotice } from './AdmissionFeeNotice';
import { Button } from '@/components/shadcn/button-extended';
import { openCheckout } from '@/lib/payments/razorpayClient';

interface Props {
  applicationId: string;
  onSuccess: () => void;
  onFailure: (reason: string) => void;
}

export function AdmissionFeeStep({ applicationId, onSuccess, onFailure }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setBusy(true);
    setError(null);
    try {
      const sessionToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('applicant_session_token')
          : null;
      if (!sessionToken) {
        throw new Error('Session expired. Please re-verify your mobile number.');
      }
      const initRes = await fetch('/api/payments/razorpay/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, sessionToken }),
      });
      const initJson = await initRes.json();
      if (!initRes.ok || !initJson?.data?.orderId) {
        throw new Error(initJson?.error || 'Failed to start payment');
      }
      const d = initJson.data;

      const result = await openCheckout({
        keyId: d.keyId,
        orderId: d.orderId,
        amount: d.amount,
        currency: d.currency,
        name: d.name,
        description: d.description,
        prefill: d.prefill,
      });

      if (result.status === 'CANCELLED') {
        onFailure('Payment cancelled');
        setBusy(false);
        return;
      }
      if (result.status === 'FAILED') {
        onFailure(result.error || 'Payment failed');
        setBusy(false);
        return;
      }

      const verifyRes = await fetch('/api/payments/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: result.razorpay_order_id,
          razorpay_payment_id: result.razorpay_payment_id,
          razorpay_signature: result.razorpay_signature,
        }),
      });
      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok || verifyJson?.data?.status !== 'SUCCESS') {
        throw new Error(verifyJson?.error || 'Payment verification failed');
      }
      onSuccess();
      setBusy(false);
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
      <Button
        type="button"
        variant="primary"
        onClick={handlePay}
        disabled={busy}
        loading={busy}
        className="w-full"
      >
        Pay ₹500 & Submit Application
      </Button>
    </div>
  );
}
