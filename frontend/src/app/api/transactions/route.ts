import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
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
