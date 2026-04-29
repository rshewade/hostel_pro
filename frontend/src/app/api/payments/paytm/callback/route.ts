import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyChecksum } from '@/lib/payments/paytm';

const ADMISSION_AMOUNT = 500;

async function logAudit(applicationId: string | null, event: string, payload: any) {
  if (!applicationId) {
    console.error('paytm callback audit (no application uuid):', event, payload);
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
  let payload: Record<string, string> = {};
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      payload = await request.json();
    } else {
      const form = await request.formData();
      form.forEach((v, k) => { payload[k] = String(v); });
    }

    const checksumHash = payload.CHECKSUMHASH;
    delete payload.CHECKSUMHASH;
    if (!checksumHash) {
      console.error('paytm callback: missing checksum', payload);
      return NextResponse.json({ success: false, error: 'Missing checksum' }, { status: 400 });
    }

    const ok = await verifyChecksum(payload, checksumHash);
    if (!ok) {
      console.error('paytm callback: checksum mismatch', { orderId: payload.ORDERID });
      return NextResponse.json({ success: false, error: 'Invalid checksum' }, { status: 400 });
    }

    const orderId = payload.ORDERID;
    const status = payload.STATUS; // TXN_SUCCESS | TXN_FAILURE | PENDING
    const txnId = payload.TXNID || null;
    const amount = payload.TXNAMOUNT;

    const { rows: txnRows } = await query(
      `SELECT t.id, t.fee_id, t.status, f.application_id, f.amount AS fee_amount
       FROM transactions t JOIN fees f ON f.id = t.fee_id
       WHERE t.transaction_ref = $1`,
      [orderId],
    );
    if (!txnRows[0]) {
      console.error('paytm callback: unknown order', orderId);
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    const txn = txnRows[0];
    const applicationId: string = txn.application_id;

    // Idempotency: already finalized
    if (txn.status === 'SUCCESS' || txn.status === 'FAILED') {
      await logAudit(applicationId, 'PAYTM_CALLBACK_DUPLICATE', { orderId, currentStatus: txn.status });
      return NextResponse.json({ success: true, idempotent: true });
    }

    // Validate amount
    if (Number(amount) !== Number(txn.fee_amount) || Number(amount) !== ADMISSION_AMOUNT) {
      await logAudit(applicationId, 'PAYTM_CALLBACK_AMOUNT_MISMATCH', { orderId, amount, expected: txn.fee_amount });
      return NextResponse.json({ success: false, error: 'Amount mismatch' }, { status: 400 });
    }

    if (status === 'TXN_SUCCESS') {
      await query('BEGIN');
      try {
        await query(
          `UPDATE transactions
           SET status='SUCCESS', gateway_response=$2, payment_notes=$3
           WHERE id=$1`,
          [txn.id, JSON.stringify(payload), `Paytm TXNID ${txnId}`],
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
        await logAudit(applicationId, 'PAYTM_CALLBACK_SUCCESS', { orderId, txnId });
      } catch (e) {
        await query('ROLLBACK');
        throw e;
      }
    } else {
      await query(
        `UPDATE transactions SET status='FAILED', gateway_response=$2, payment_notes=$3 WHERE id=$1`,
        [txn.id, JSON.stringify(payload), `Paytm status: ${status}`],
      );
      await logAudit(applicationId, 'PAYTM_CALLBACK_FAILED', { orderId, status });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in /api/payments/paytm/callback:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
