import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/payments/razorpay';

const ADMISSION_AMOUNT = 500;

async function logAudit(applicationId: string | null, event: string, payload: any) {
  if (!applicationId) return;
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
    const rawBody = await request.text();
    const sig = request.headers.get('x-razorpay-signature') || '';
    if (!verifyWebhookSignature(rawBody, sig)) {
      return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType: string = event?.event;
    const payment = event?.payload?.payment?.entity;
    if (!payment) return NextResponse.json({ ok: true, ignored: true });

    const orderId: string = payment.order_id;
    const paymentId: string = payment.id;
    const amountPaise: number = payment.amount;

    const { rows } = await query(
      `SELECT t.id, t.status, t.fee_id, f.application_id, f.amount AS fee_amount
       FROM transactions t JOIN fees f ON f.id = t.fee_id
       WHERE t.transaction_ref = $1`,
      [orderId],
    );
    const txn = rows[0];
    if (!txn) {
      // Webhook for an unknown order — ack to stop retries.
      return NextResponse.json({ ok: true, unknown: true });
    }
    const applicationId: string = txn.application_id;

    if (txn.status === 'SUCCESS' || txn.status === 'FAILED') {
      await logAudit(applicationId, 'RAZORPAY_WEBHOOK_DUPLICATE', {
        orderId, paymentId, eventType, currentStatus: txn.status,
      });
      return NextResponse.json({ ok: true, idempotent: true });
    }

    if (eventType === 'payment.captured') {
      if (Number(amountPaise) !== ADMISSION_AMOUNT * 100 || Number(txn.fee_amount) !== ADMISSION_AMOUNT) {
        await logAudit(applicationId, 'RAZORPAY_WEBHOOK_AMOUNT_MISMATCH', {
          orderId, paymentId, amountPaise, expected: txn.fee_amount,
        });
        return NextResponse.json({ ok: false, error: 'Amount mismatch' }, { status: 400 });
      }
      await query('BEGIN');
      try {
        await query(
          `UPDATE transactions SET status='SUCCESS', gateway_response=$2, payment_notes=$3 WHERE id=$1`,
          [txn.id, JSON.stringify(event), `Razorpay webhook ${paymentId}`],
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
      await logAudit(applicationId, 'RAZORPAY_WEBHOOK_SUCCESS', { orderId, paymentId });
    } else if (eventType === 'payment.failed') {
      await query(
        `UPDATE transactions SET status='FAILED', gateway_response=$2 WHERE id=$1`,
        [txn.id, JSON.stringify(event)],
      );
      await logAudit(applicationId, 'RAZORPAY_WEBHOOK_FAILED', { orderId, paymentId });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error in /api/payments/razorpay/webhook:', error);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
