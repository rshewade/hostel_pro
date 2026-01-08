import { NextRequest, NextResponse } from 'next/server';
import { findOne, find } from '@/lib/api/db';

/**
 * GET /api/parent/leave
 *
 * Read-only endpoint for parent to view their ward's leave requests.
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

    let tokenData;
    try {
      const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
      tokenData = JSON.parse(decoded);
    } catch {
      return NextResponse.json(
        { message: 'Invalid session token' },
        { status: 401 }
      );
    }

    if (tokenData.vertical !== 'parent' && tokenData.role !== 'parent') {
      return NextResponse.json(
        { message: 'Access denied. Parent access required.' },
        { status: 403 }
      );
    }

    const tokenAge = Date.now() - tokenData.timestamp;
    const maxAge = 86400000;

    if (tokenAge > maxAge) {
      return NextResponse.json(
        { message: 'Session expired. Please login again.' },
        { status: 401 }
      );
    }

    // Get parent user to find linked student
    const normalizePhone = (phone: string) => phone?.replace(/[\s+\-]/g, '').slice(-10);
    const normalizedParentMobile = normalizePhone(tokenData.contact);

    const parentUser = await findOne('users', (u: any) => 
      u.role === 'parent' && normalizePhone(u.mobile_no) === normalizedParentMobile
    );

    // Get student's user_id
    let studentUserId = null;
    if (parentUser?.linked_student_id) {
      const student = await findOne('students', (s: any) => s.id === parentUser.linked_student_id);
      studentUserId = student?.user_id;
    }

    // Fetch leave requests for the student
    let leaves = [];
    if (studentUserId) {
      leaves = await find('leaves', (l: any) => l.student_id === studentUserId);
    }

    const typeMap: Record<string, string> = {
      'HOME_VISIT': 'Multi-Day',
      'SHORT_LEAVE': 'Short Leave',
      'NIGHT_OUT': 'Night Out',
    };

    const leaveRequests = leaves.map((leave: any) => ({
      id: leave.id,
      type: typeMap[leave.type] || leave.type || 'Leave',
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
    console.error('Error in /api/parent/leave:', error);
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
