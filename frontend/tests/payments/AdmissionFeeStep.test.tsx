import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('@/lib/payments/razorpayClient', () => ({
  loadCheckoutScript: vi.fn().mockResolvedValue(undefined),
  openCheckout: vi.fn(),
}));

import { AdmissionFeeStep } from '@/components/forms/AdmissionFeeStep';
import * as rzpClient from '@/lib/payments/razorpayClient';

describe('AdmissionFeeStep', () => {
  const onSuccess = vi.fn();
  const onFailure = vi.fn();

  beforeEach(() => {
    onSuccess.mockReset();
    onFailure.mockReset();
    vi.mocked(rzpClient.openCheckout).mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('renders the AdmissionFeeNotice and a submit button', () => {
      render(
        <AdmissionFeeStep
          applicationId="app-1"
          onSuccess={onSuccess}
          onFailure={onFailure}
        />,
      );
      expect(screen.getByText(/Admission Fee — ₹500 \(Non-Refundable\)/i)).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('shows the production button label when bypass is off', () => {
      vi.stubEnv('NEXT_PUBLIC_PAYMENT_BYPASS', 'false');
      render(
        <AdmissionFeeStep applicationId="app-1" onSuccess={onSuccess} onFailure={onFailure} />,
      );
      expect(
        screen.getByRole('button', { name: /Pay ₹500 & Submit Application/i }),
      ).toBeInTheDocument();
    });

    it('shows the dev-bypass button label when bypass is on', () => {
      vi.stubEnv('NEXT_PUBLIC_PAYMENT_BYPASS', 'true');
      render(
        <AdmissionFeeStep applicationId="app-1" onSuccess={onSuccess} onFailure={onFailure} />,
      );
      expect(
        screen.getByRole('button', { name: /Submit Application \(Dev: skip ₹500\)/i }),
      ).toBeInTheDocument();
    });
  });

  describe('dev bypass flow', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_PAYMENT_BYPASS', 'true');
    });

    it('calls onSuccess and posts to the Razorpay dev-bypass endpoint', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as Response);

      render(
        <AdmissionFeeStep applicationId="app-42" onSuccess={onSuccess} onFailure={onFailure} />,
      );
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toBe('/api/payments/razorpay/dev-bypass');
      expect(init?.method).toBe('POST');
      expect(JSON.parse(init?.body as string)).toEqual({ applicationId: 'app-42' });
    });

    it('shows an error when bypass endpoint fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Bypass not allowed' }),
      } as Response);

      render(
        <AdmissionFeeStep applicationId="app-1" onSuccess={onSuccess} onFailure={onFailure} />,
      );
      fireEvent.click(screen.getByRole('button'));
      await waitFor(() =>
        expect(screen.getByText(/Bypass not allowed/i)).toBeInTheDocument(),
      );
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('razorpay flow', () => {
    beforeEach(() => {
      vi.stubEnv('NEXT_PUBLIC_PAYMENT_BYPASS', 'false');
    });

    it('calls initiate, opens checkout, posts to verify on success, then onSuccess', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            data: {
              orderId: 'order_TEST',
              keyId: 'rzp_test_K',
              amount: 500,
              currency: 'INR',
              internalTxnId: 'txn-1',
              name: 'Hostel Admission Fee',
              description: 'Non-refundable admission fee',
              prefill: { name: 'A', email: 'a@b.c', contact: '9999999999' },
            },
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ data: { status: 'SUCCESS' } }),
        } as Response);

      vi.mocked(rzpClient.openCheckout).mockResolvedValueOnce({
        status: 'SUCCESS',
        razorpay_order_id: 'order_TEST',
        razorpay_payment_id: 'pay_TEST',
        razorpay_signature: 'sigTEST',
      });

      render(
        <AdmissionFeeStep applicationId="app-1" onSuccess={onSuccess} onFailure={onFailure} />,
      );
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
      expect(fetchSpy.mock.calls[0][0]).toBe('/api/payments/razorpay/initiate');
      expect(fetchSpy.mock.calls[1][0]).toBe('/api/payments/razorpay/verify');
      const verifyBody = JSON.parse(fetchSpy.mock.calls[1][1]?.body as string);
      expect(verifyBody).toMatchObject({
        razorpay_order_id: 'order_TEST',
        razorpay_payment_id: 'pay_TEST',
        razorpay_signature: 'sigTEST',
      });
    });

    it('calls onFailure when the user cancels the modal', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            orderId: 'order_TEST',
            keyId: 'rzp_test_K',
            amount: 500,
            currency: 'INR',
            internalTxnId: 'txn-1',
            name: 'X', description: 'X', prefill: {},
          },
        }),
      } as Response);
      vi.mocked(rzpClient.openCheckout).mockResolvedValueOnce({ status: 'CANCELLED' });

      render(
        <AdmissionFeeStep applicationId="app-1" onSuccess={onSuccess} onFailure={onFailure} />,
      );
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => expect(onFailure).toHaveBeenCalled());
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('shows an error when the initiate endpoint fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Application not in DRAFT' }),
      } as Response);

      render(
        <AdmissionFeeStep applicationId="app-1" onSuccess={onSuccess} onFailure={onFailure} />,
      );
      fireEvent.click(screen.getByRole('button'));
      await waitFor(() =>
        expect(screen.getByText(/Application not in DRAFT/i)).toBeInTheDocument(),
      );
    });
  });
});
