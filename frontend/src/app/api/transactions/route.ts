import { NextRequest, NextResponse } from 'next/server';
import { query, withTransaction } from '@/lib/db';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/transactions
 * List payment transactions with student and fee info
 * Auth: ACCOUNTS, TRUSTEE
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['ACCOUNTS', 'TRUSTEE']);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vertical = searchParams.get('vertical');

    let sql = `
      SELECT
        t.id,
        t.transaction_ref AS transaction_id,
        t.amount,
        t.payment_method AS method,
        t.status,
        t.receipt_number,
        t.created_at AS payment_date,
        f.fee_head,
        f.student_id,
        u.full_name AS student_name,
        u.vertical
      FROM transactions t
      LEFT JOIN fees f ON f.id = t.fee_id
      LEFT JOIN users u ON u.id = f.student_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      params.push(status);
      sql += ` AND t.status = $${params.length}`;
    }

    if (vertical && vertical !== 'ALL') {
      params.push(vertical);
      sql += ` AND u.vertical = $${params.length}`;
    }

    sql += ` ORDER BY t.created_at DESC`;

    const { rows } = await query(sql, params);
    return successResponse(rows);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/transactions:', error);
    return serverErrorResponse('Failed to fetch transactions', error);
  }
}

/**
 * POST /api/transactions
 * Record a manual payment. Creates a transaction and updates the fee to PAID.
 * Auth: ACCOUNTS, TRUSTEE
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['ACCOUNTS', 'TRUSTEE']);
    const body = await request.json();
    const { fee_id, amount, payment_method, transaction_ref, payment_notes, receipt_number } = body;

    if (!fee_id) return badRequestResponse('Fee ID is required');
    if (!amount || Number(amount) <= 0) return badRequestResponse('Amount must be greater than 0');
    if (!payment_method) return badRequestResponse('Payment method is required');

    const { rows: feeRows } = await query('SELECT * FROM fees WHERE id = $1', [fee_id]);
    if (feeRows.length === 0) return notFoundResponse('Fee not found');
    const fee = feeRows[0];

    if (fee.status === 'PAID') return badRequestResponse('Fee has already been paid');

    // Auto-generate receipt + transaction refs if not provided
    const receiptNum = receipt_number || `RCPT-${Date.now()}`;
    const txnRef = transaction_ref || `TXN-${Date.now()}`;

    const result = await withTransaction(async (client) => {
      const { rows: inserted } = await client.query(
        `INSERT INTO transactions
          (fee_id, amount, payment_method, transaction_ref, status, payment_notes, processed_by, receipt_number)
         VALUES ($1, $2, $3, $4, 'SUCCESS', $5, $6, $7)
         RETURNING *`,
        [fee_id, amount, payment_method, txnRef, payment_notes || null, user.id, receiptNum]
      );
      if (inserted.length === 0) throw new Error('Failed to insert transaction');

      // Update fee: accumulate paid amount, set status PAID if fully paid
      const newPaidAmount = Number(fee.paid_amount || 0) + Number(amount);
      const newStatus = newPaidAmount >= Number(fee.amount) ? 'PAID' : 'PENDING';
      await client.query(
        `UPDATE fees
         SET paid_amount = $1, status = $2, payment_method = $3, paid_at = NOW(), updated_at = NOW()
         WHERE id = $4`,
        [newPaidAmount, newStatus, payment_method, fee_id]
      );

      await client.query(
        `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          'FEE',
          fee_id,
          'STATUS_CHANGE',
          user.id,
          JSON.stringify({
            event: 'MANUAL_PAYMENT',
            transaction_id: inserted[0].id,
            amount,
            payment_method,
            receipt_number: receiptNum,
            old_status: fee.status,
            new_status: newStatus,
          }),
        ]
      );

      return inserted[0];
    });

    return createdResponse(result, 'Payment recorded successfully');
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in POST /api/transactions:', error);
    return serverErrorResponse('Failed to record payment', error);
  }
}
