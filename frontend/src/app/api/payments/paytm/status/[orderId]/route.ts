import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { queryTransactionStatus } from '@/lib/payments/paytm';

const ADMISSION_AMOUNT = 500;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const { rows } = await query(
      `SELECT t.id, t.status, t.fee_id, f.application_id, a.current_status AS app_status
       FROM transactions t
       JOIN fees f ON f.id = t.fee_id
       JOIN applications a ON a.id = f.application_id
       WHERE t.transaction_ref = $1`,
      [orderId],
    );
    if (!rows[0]) return notFoundResponse('Order not found');
    let txn = rows[0];

    if (txn.status === 'PENDING') {
      const result = await queryTransactionStatus(orderId);
      const remoteStatus = result?.body?.resultInfo?.resultStatus;
      const txnAmount = result?.body?.txnAmount;
      const txnId = result?.body?.txnId;
      if (remoteStatus === 'TXN_SUCCESS' && Number(txnAmount) === ADMISSION_AMOUNT) {
        await query('BEGIN');
        try {
          await query(
            `UPDATE transactions SET status='SUCCESS', gateway_response=$2, payment_notes=$3 WHERE id=$1`,
            [txn.id, JSON.stringify(result.body), `Reconciled TXNID ${txnId}`],
          );
          await query(
            `UPDATE fees SET status='PAID', paid_amount=amount, paid_at=NOW(), payment_method='ONLINE' WHERE id=$1`,
            [txn.fee_id],
          );
          await query(
            `UPDATE applications SET current_status='SUBMITTED', submitted_at=NOW() WHERE id=$1 AND current_status='DRAFT'`,
            [txn.application_id],
          );
          await query('COMMIT');
          txn = { ...txn, status: 'SUCCESS', app_status: 'SUBMITTED' };
        } catch (e) {
          await query('ROLLBACK');
          throw e;
        }
      } else if (remoteStatus === 'TXN_FAILURE') {
        await query(
          `UPDATE transactions SET status='FAILED', gateway_response=$2 WHERE id=$1`,
          [txn.id, JSON.stringify(result.body)],
        );
        txn = { ...txn, status: 'FAILED' };
      }
    }

    return successResponse({
      orderId,
      txnStatus: txn.status,
      applicationStatus: txn.app_status,
      applicationId: txn.application_id,
    });
  } catch (error: any) {
    console.error('Error in GET status:', error);
    return serverErrorResponse('Failed to query payment status', error);
  }
}
