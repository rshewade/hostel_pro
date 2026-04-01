import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
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
