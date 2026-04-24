import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifySignedSessionToken } from '@/lib/auth';

/**
 * GET /api/parent/leave
 *
 * Read-only endpoint for parent to view their ward's leave requests.
 * Auth: PARENT only
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionToken = searchParams.get('sessionToken');

    if (!sessionToken) {
      return NextResponse.json(
        { message: 'Authentication required. Please login again.' },
        { status: 401 }
      );
    }

    const tokenData = verifySignedSessionToken(sessionToken);
    if (!tokenData) {
      return NextResponse.json(
        { message: 'Invalid or expired session token. Please login again.' },
        { status: 401 }
      );
    }

    if (tokenData.vertical !== 'parent') {
      return NextResponse.json(
        { message: 'Access denied. Parent access required.' },
        { status: 403 }
      );
    }

    // Get parent user to find linked student
    const normalizePhone = (phone: string) => phone?.replace(/[\s+\-]/g, '').slice(-10);
    const normalizedParentMobile = normalizePhone(tokenData.contact as string);

    // The studentId from the dashboard is already the user ID
    const selectedStudentId = searchParams.get('studentId');

    let studentUserId: string | null = selectedStudentId;

    // If no student selected, find first linked student via applications
    if (!studentUserId) {
      const { rows: linkedApps } = await query(
        `SELECT DISTINCT student_user_id FROM applications
         WHERE student_user_id IS NOT NULL
         AND (data->'guardian_info'->>'father_mobile' LIKE $1
              OR data->'guardian_info'->>'mother_mobile' LIKE $1)
         LIMIT 1`,
        [`%${normalizedParentMobile}`]
      );
      if (linkedApps.length > 0) {
        studentUserId = linkedApps[0].student_user_id;
      }
    }

    // Fetch leave requests for the student
    let leaves: any[] = [];
    if (studentUserId) {
      const { rows: leaveData } = await query(
        'SELECT * FROM leave_requests WHERE student_id = $1',
        [studentUserId]
      );

      leaves = leaveData || [];
    }

    const typeMap: Record<string, string> = {
      'HOME_VISIT': 'Multi-Day',
      'SHORT_LEAVE': 'Short Leave',
      'NIGHT_OUT': 'Night Out',
    };

    const leaveRequests = leaves.map((leave: any) => ({
      id: leave.id,
      type: typeMap[leave.leave_type] || leave.leave_type || 'Leave',
      startDate: leave.start_time ? new Date(leave.start_time).toLocaleDateString('en-IN') : 'N/A',
      endDate: leave.end_time ? new Date(leave.end_time).toLocaleDateString('en-IN') : 'N/A',
      reason: leave.reason || '',
      status: leave.status,
      appliedDate: leave.created_at ? new Date(leave.created_at).toLocaleDateString('en-IN') : 'N/A',
    }));

    const leaveSummary = {
      total: leaveRequests.length,
      upcoming: leaveRequests.filter((l: any) => l.status === 'PENDING').length,
      approved: leaveRequests.filter((l: any) => l.status === 'APPROVED').length,
      rejected: leaveRequests.filter((l: any) => l.status === 'REJECTED').length,
    };

    const leaveData = {
      summary: leaveSummary,
      items: leaveRequests,
    };

    return NextResponse.json({
      success: true,
      data: leaveData,
    });

  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { message: 'Method not allowed. This endpoint is read-only.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: 'Method not allowed. This endpoint is read-only.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Method not allowed. This endpoint is read-only.' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { message: 'Method not allowed. This endpoint is read-only.' },
    { status: 405 }
  );
}
