import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { getPaytmConfig, generateOrderId, initiateTransaction } from '@/lib/payments/paytm';

const ADMISSION_AMOUNT = 500;
const REUSE_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const applicationId = body.applicationId || body.application_id;
    if (!applicationId) {
      return badRequestResponse('applicationId is required');
    }

    const { rows: appRows } = await query(
      `SELECT id, vertical, current_status, applicant_mobile FROM applications WHERE id = $1`,
      [applicationId],
    );
    if (!appRows[0]) return notFoundResponse('Application not found');
    const app = appRows[0];

    if (app.vertical !== 'BOYS_HOSTEL' && app.vertical !== 'GIRLS_ASHRAM') {
      return badRequestResponse('Admission fee only applies to hostel verticals');
    }
    if (app.current_status !== 'DRAFT') {
      return badRequestResponse(`Application is already ${app.current_status}`);
    }

    const { rows: feeRows } = await query(
      `SELECT id, status FROM fees WHERE application_id = $1 AND fee_head = 'ADMISSION_FEE' ORDER BY created_at DESC LIMIT 1`,
      [applicationId],
    );
    if (!feeRows[0]) return badRequestResponse('No pending admission fee found for this application');
    const fee = feeRows[0];
    if (fee.status === 'PAID') return badRequestResponse('Admission fee already paid');

    // Reuse a recent PENDING transaction if within 15 minutes
    const { rows: pendingTxn } = await query(
      `SELECT id, transaction_ref, gateway_response, created_at
       FROM transactions
       WHERE fee_id = $1 AND status = 'PENDING'
       ORDER BY created_at DESC LIMIT 1`,
      [fee.id],
    );

    let orderId: string = '';
    let txnToken: string | null = null;
    if (pendingTxn[0] && Date.now() - new Date(pendingTxn[0].created_at).getTime() < REUSE_WINDOW_MS) {
      orderId = pendingTxn[0].transaction_ref;
      txnToken = pendingTxn[0].gateway_response?.txnToken || null;
    }

    if (!txnToken) {
      // Mark older PENDING as EXPIRED
      if (pendingTxn[0]) {
        await query(`UPDATE transactions SET status='EXPIRED' WHERE id=$1`, [pendingTxn[0].id]);
      }
      orderId = generateOrderId(applicationId);
      const result = await initiateTransaction({
        orderId,
        amount: ADMISSION_AMOUNT,
        customerId: app.applicant_mobile || applicationId,
      });
      txnToken = result.txnToken;

      await query(
        `INSERT INTO transactions (fee_id, amount, payment_method, transaction_ref, gateway_response, status)
         VALUES ($1, $2, 'ONLINE', $3, $4, 'PENDING')`,
        [fee.id, ADMISSION_AMOUNT, orderId, JSON.stringify({ txnToken, initiatedAt: new Date().toISOString() })],
      );
    }

    const cfg = getPaytmConfig();
    return successResponse({
      orderId,
      txnToken,
      amount: ADMISSION_AMOUNT,
      mid: cfg.mid,
      env: cfg.env,
    });
  } catch (error: any) {
    console.error('Error in POST /api/payments/paytm/initiate:', error);
    return serverErrorResponse('Failed to initiate payment', error);
  }
}
