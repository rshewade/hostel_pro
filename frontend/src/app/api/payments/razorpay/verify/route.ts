import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { verifyPaymentSignature } from '@/lib/payments/razorpay';
import { sendEmail } from '@/lib/mailer';
import { renderPaymentReceipt } from '@/lib/email-templates/payment-receipt';
import { logger } from '@/lib/logger';

const ADMISSION_AMOUNT = 500;

async function logAudit(applicationId: string | null, event: string, payload: any) {
  if (!applicationId) {
    console.error('razorpay verify audit (no application uuid):', event, payload);
    return;
  }
  try {
    await query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, metadata)
       VALUES ('APPLICATION', $1, 'STATUS_CHANGE', $2)`,
      [applicationId, JSON.stringify({ event, payload })],
    );
  } catch (e) {
    console.error('audit log failed', e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = body.razorpay_order_id;
    const paymentId = body.razorpay_payment_id;
    const signature = body.razorpay_signature;

    if (!orderId || !paymentId || !signature) {
      return badRequestResponse('razorpay_order_id, razorpay_payment_id, and razorpay_signature are required');
    }

    const { rows: txnRows } = await query(
      `SELECT t.id, t.fee_id, t.status, f.application_id, f.amount AS fee_amount
       FROM transactions t JOIN fees f ON f.id = t.fee_id
       WHERE t.transaction_ref = $1`,
      [orderId],
    );
    if (!txnRows[0]) return notFoundResponse('Order not found');
    const txn = txnRows[0];
    const applicationId: string = txn.application_id;

    // Idempotency
    if (txn.status === 'SUCCESS') {
      return successResponse({ status: 'SUCCESS', idempotent: true });
    }
    if (txn.status === 'FAILED' || txn.status === 'EXPIRED') {
      return badRequestResponse(`Transaction is ${txn.status}`);
    }

    const sigOk = verifyPaymentSignature({ orderId, paymentId, signature });
    if (!sigOk) {
      await query(
        `UPDATE transactions SET status='FAILED', gateway_response=$2, payment_notes='Signature mismatch' WHERE id=$1`,
        [txn.id, JSON.stringify({ orderId, paymentId, reason: 'signature_mismatch' })],
      );
      await logAudit(applicationId, 'RAZORPAY_VERIFY_SIGNATURE_FAIL', { orderId, paymentId });
      return badRequestResponse('Invalid signature');
    }

    if (Number(txn.fee_amount) !== ADMISSION_AMOUNT) {
      await logAudit(applicationId, 'RAZORPAY_VERIFY_AMOUNT_MISMATCH', { orderId, expected: txn.fee_amount });
      return badRequestResponse('Amount mismatch');
    }

    await query('BEGIN');
    try {
      await query(
        `UPDATE transactions
         SET status='SUCCESS', gateway_response=$2, payment_notes=$3
         WHERE id=$1`,
        [txn.id, JSON.stringify({ orderId, paymentId, signature }), `Razorpay payment ${paymentId}`],
      );
      await query(
        `UPDATE fees SET status='PAID', paid_amount=amount, paid_at=NOW(), payment_method='ONLINE' WHERE id=$1`,
        [txn.fee_id],
      );
      await query(
        `UPDATE applications SET current_status='SUBMITTED', submitted_at=NOW() WHERE id=$1 AND current_status='DRAFT'`,
        [applicationId],
      );
      await query('COMMIT');
    } catch (e) {
      await query('ROLLBACK');
      throw e;
    }

    await logAudit(applicationId, 'RAZORPAY_VERIFY_SUCCESS', { orderId, paymentId });

    // Receipt email (non-blocking)
    try {
      const { rows: rcptRows } = await query(
        `SELECT a.applicant_email, a.applicant_name, f.fee_head
         FROM applications a JOIN fees f ON f.application_id = a.id
         WHERE a.id = $1 AND f.id = $2`,
        [applicationId, txn.fee_id],
      );
      const r = rcptRows[0];
      if (r?.applicant_email) {
        const rendered = renderPaymentReceipt({
          name: r.applicant_name || 'Applicant',
          amount: ADMISSION_AMOUNT,
          orderId,
          transactionId: paymentId,
          feeHead: r.fee_head || null,
        });
        sendEmail({
          to: r.applicant_email,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
        }).catch((err) => {
          logger.error('Payment-receipt email dispatch failed', {
            orderId,
            error: err instanceof Error ? err.message : String(err),
          });
        });
      }
    } catch (err) {
      logger.error('Payment-receipt email lookup failed', {
        orderId,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    return successResponse({ status: 'SUCCESS' });
  } catch (error: any) {
    console.error('Error in POST /api/payments/razorpay/verify:', error);
    return serverErrorResponse('Failed to verify payment', error);
  }
}
