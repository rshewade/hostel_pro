import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { FeeAPI, FeeStatus } from '@/types/api';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/fees
 * List fees with optional filtering by student and status
 * Auth: STUDENT (own fees only) or SUPERINTENDENT, TRUSTEE, ACCOUNTS (any)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    // If student, force own ID; staff can query any
    const studentId = user.role === 'STUDENT' ? user.id : searchParams.get('student_id');
    const status = searchParams.get('status') as FeeStatus | null;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (studentId) {
      conditions.push(`student_id = $${paramIndex++}`);
      params.push(studentId);
    }
    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM fees ${whereClause} ORDER BY due_date DESC`;

    const { rows: fees } = await query(sql, params);

    // Calculate summary
    const summary = {
      total_pending: 0,
      total_paid: 0,
      total_overdue: 0,
    };

    const now = new Date();
    (fees || []).forEach((fee: any) => {
      const amount = parseFloat(fee.amount) || 0;
      if (fee.status === 'PENDING') {
        const dueDate = new Date(fee.due_date);
        const isOverdue = dueDate < now;

        if (isOverdue) {
          summary.total_overdue += amount;
        } else {
          summary.total_pending += amount;
        }
      } else if (fee.status === 'PAID') {
        summary.total_paid += amount;
      } else if (fee.status === 'OVERDUE') {
        summary.total_overdue += amount;
      }
    });

    return successResponse({
      data: fees,
      summary,
    } as FeeAPI.ListResponse);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/fees:', error);
    return serverErrorResponse('Failed to fetch fees', error);
  }
}

/**
 * PUT /api/fees
 * Update a fee record (payment, status change)
 * Auth: STUDENT (own fees) or ACCOUNTS, SUPERINTENDENT, TRUSTEE
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['STUDENT', 'ACCOUNTS', 'SUPERINTENDENT', 'TRUSTEE']);
    const body = await request.json();
    const { id, status, paid_amount, payment_method, paid_at } = body;

    if (!id) {
      return badRequestResponse('Fee ID is required');
    }

    // Verify fee exists
    const { rows: feeRows } = await query('SELECT * FROM fees WHERE id = $1', [id]);
    if (feeRows.length === 0) {
      return notFoundResponse('Fee not found');
    }

    const fee = feeRows[0];

    // Students can only pay their own fees
    if (user.role === 'STUDENT' && fee.student_id !== user.id) {
      return badRequestResponse('Cannot update another student\'s fee');
    }

    // Build update
    const setClauses: string[] = ['updated_at = NOW()'];
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      setClauses.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (paid_amount !== undefined) {
      setClauses.push(`paid_amount = $${paramIndex++}`);
      params.push(paid_amount);
    }
    if (payment_method) {
      setClauses.push(`payment_method = $${paramIndex++}`);
      params.push(payment_method);
    }
    if (paid_at) {
      setClauses.push(`paid_at = $${paramIndex++}`);
      params.push(paid_at);
    }

    params.push(id);
    const sql = `UPDATE fees SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const { rows: updatedRows } = await query(sql, params);

    // Audit log
    await query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'FEE',
        id,
        'STATUS_CHANGE',
        user.id,
        JSON.stringify({
          old_status: fee.status,
          new_status: status,
          amount: paid_amount,
          payment_method,
        }),
      ]
    );

    return successResponse(updatedRows[0]);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in PUT /api/fees:', error);
    return serverErrorResponse('Failed to update fee', error);
  }
}
