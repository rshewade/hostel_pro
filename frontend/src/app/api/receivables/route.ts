import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/receivables
 * List fee receivables with student info
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
        f.id,
        f.student_id,
        u.full_name AS student_name,
        u.vertical,
        u.mobile AS contact_phone,
        u.email AS contact_email,
        f.fee_head AS fee_component,
        f.amount,
        f.paid_amount,
        f.due_date,
        f.status,
        f.created_at,
        f.updated_at AS modified_at
      FROM fees f
      LEFT JOIN users u ON u.id = f.student_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      params.push(status);
      sql += ` AND f.status = $${params.length}`;
    }

    if (vertical && vertical !== 'ALL') {
      params.push(vertical);
      sql += ` AND u.vertical = $${params.length}`;
    }

    sql += ` ORDER BY f.due_date ASC`;

    const { rows } = await query(sql, params);
    return successResponse(rows);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/receivables:', error);
    return serverErrorResponse('Failed to fetch receivables', error);
  }
}
