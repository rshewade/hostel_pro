import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/superintendent/exit-clearance
 * List exit requests with clearance progress for the superintendent's vertical
 * Auth: SUPERINTENDENT, TRUSTEE
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT', 'TRUSTEE']);

    // Get exit requests with student and room info
    let sql = `
      SELECT
        er.id,
        er.student_id,
        er.reason,
        er.reason_details,
        er.requested_date,
        er.actual_exit_date,
        er.status,
        er.clearance_status,
        er.created_at,
        u.full_name AS student_name,
        u.vertical,
        ra.room_id,
        r.room_number
      FROM exit_requests er
      LEFT JOIN users u ON u.id = er.student_id
      LEFT JOIN room_allocations ra ON ra.student_id = er.student_id AND ra.status = 'ACTIVE'
      LEFT JOIN rooms r ON r.id = ra.room_id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Superintendents only see their vertical
    if (user.role === 'SUPERINTENDENT' && user.vertical) {
      params.push(user.vertical);
      sql += ` AND u.vertical = $${params.length}`;
    }

    sql += ` ORDER BY er.created_at DESC`;

    const { rows: exitRequests } = await query(sql, params);

    // For each exit request, get clearance items
    const requests = await Promise.all(
      exitRequests.map(async (er: any) => {
        const { rows: items } = await query(
          `SELECT * FROM exit_clearance_items WHERE exit_request_id = $1`,
          [er.id]
        );

        const total = items.length;
        const completed = items.filter((i: any) => i.status === 'COMPLETED').length;
        const pending = items.filter((i: any) => i.status === 'PENDING').length;

        const daysSinceSubmission = Math.floor(
          (Date.now() - new Date(er.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: er.id,
          studentName: er.student_name || 'Unknown',
          studentId: er.student_id,
          roomNumber: er.room_number || 'N/A',
          vertical: er.vertical || 'BOYS',
          requestedExitDate: er.requested_date,
          submittedDate: er.created_at,
          currentStatus: er.status === 'PENDING' ? 'SUBMITTED' : er.status,
          clearanceProgress: {
            total,
            completed,
            pending,
            overdue: 0,
          },
          ownedItems: {
            total,
            completed,
            pending,
          },
          agingDays: daysSinceSubmission,
          isHighRisk: daysSinceSubmission > 14 || pending > 3,
        };
      })
    );

    return successResponse({ requests });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/superintendent/exit-clearance:', error);
    return serverErrorResponse('Failed to fetch exit clearance requests', error);
  }
}
