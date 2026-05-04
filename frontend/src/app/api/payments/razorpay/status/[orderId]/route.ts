import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/responses';

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
    const txn = rows[0];

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
