import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/superintendent/exit-clearance/export
 * Export exit clearance data as CSV
 * Auth: SUPERINTENDENT, TRUSTEE
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT', 'TRUSTEE']);

    let sql = `
      SELECT
        er.id,
        u.full_name AS student_name,
        u.vertical,
        r.room_number,
        er.reason,
        er.requested_date,
        er.status,
        er.clearance_status,
        er.created_at
      FROM exit_requests er
      LEFT JOIN users u ON u.id = er.student_id
      LEFT JOIN room_allocations ra ON ra.student_id = er.student_id AND ra.status = 'ACTIVE'
      LEFT JOIN rooms r ON r.id = ra.room_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (user.role === 'SUPERINTENDENT' && user.vertical) {
      params.push(user.vertical);
      sql += ` AND u.vertical = $${params.length}`;
    }

    sql += ` ORDER BY er.created_at DESC`;

    const { rows } = await query(sql, params);

    // Build CSV
    const headers = ['ID', 'Student Name', 'Vertical', 'Room', 'Reason', 'Requested Date', 'Status', 'Clearance Status', 'Submitted Date'];
    const csvRows = [
      headers.join(','),
      ...rows.map((r: any) =>
        [
          r.id,
          `"${(r.student_name || '').replace(/"/g, '""')}"`,
          r.vertical || '',
          r.room_number || '',
          r.reason || '',
          r.requested_date || '',
          r.status || '',
          r.clearance_status || '',
          r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '',
        ].join(',')
      ),
    ];

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="exit-clearance-report-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/superintendent/exit-clearance/export:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export report' },
      { status: 500 }
    );
  }
}
