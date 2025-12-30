import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/parent/leave
 *
 * Read-only endpoint for parent to view their ward's leave requests.
 * In production, this would verify parent session and return associated student's leave data.
 *
 * Query Parameters:
 * - sessionToken: string - Parent session token from OTP login
 *
 * Response:
 * - Success: 200 with { success: true, data: LeaveData }
 * - Error: 400/401/405 with { message: string }
 *
 * Permissions: READ-ONLY - No mutation allowed
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionToken = searchParams.get('sessionToken');

    // Validate session token
    if (!sessionToken) {
      return NextResponse.json(
        { message: 'Authentication required. Please login again.' },
        { status: 401 }
      );
    }

    // Decode and verify session token (mock implementation)
    let tokenData;
    try {
      const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
      tokenData = JSON.parse(decoded);
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid session token' },
        { status: 401 }
      );
    }

    // Verify role is PARENT
    if (tokenData.vertical !== 'parent' && tokenData.role !== 'parent') {
      return NextResponse.json(
        { message: 'Access denied. Parent access required.' },
        { status: 403 }
      );
    }

    // Check token expiration (24 hours)
    const tokenAge = Date.now() - tokenData.timestamp;
    const maxAge = 86400000; // 24 hours in milliseconds

    if (tokenAge > maxAge) {
      return NextResponse.json(
        { message: 'Session expired. Please login again.' },
        { status: 401 }
      );
    }

    // Mock leave data - in production, query database for parent's associated student
    const leaveRequests = [
      {
        id: '1',
        type: 'Weekend',
        startDate: '2025-12-28',
        endDate: '2025-12-29',
        reason: 'Family function',
        status: 'PENDING',
        appliedDate: '2025-12-20',
      },
      {
        id: '2',
        type: 'Holiday',
        startDate: '2025-12-20',
        endDate: '2025-12-25',
        reason: 'Winter vacation',
        status: 'APPROVED',
        approvedBy: 'Superintendent',
        approvalDate: '2025-12-18',
      },
      {
        id: '3',
        type: 'Emergency',
        startDate: '2025-12-10',
        endDate: '2025-12-11',
        reason: 'Medical emergency',
        status: 'APPROVED',
        approvedBy: 'Superintendent',
        approvalDate: '2025-12-09',
      },
      {
        id: '4',
        type: 'Weekend',
        startDate: '2025-12-05',
        endDate: '2025-12-07',
        reason: 'Personal work',
        status: 'REJECTED',
        rejectedBy: 'Superintendent',
        rejectionReason: 'Exceeds allowed leave duration',
        rejectionDate: '2025-12-04',
      },
    ];

    const leaveSummary = {
      total: leaveRequests.length,
      upcoming: leaveRequests.filter(l => l.status === 'PENDING').length,
      approved: leaveRequests.filter(l => l.status === 'APPROVED').length,
      rejected: leaveRequests.filter(l => l.status === 'REJECTED').length,
    };

    const leaveData = {
      summary: leaveSummary,
      items: leaveRequests,
    };

    // Mock logging
    console.log('\n========================================');
    console.log('🏖️ PARENT LEAVE DATA ACCESS');
    console.log('========================================');
    console.log('Endpoint: /api/parent/leave');
    console.log('Session ID:', tokenData.sessionId || 'unknown');
    console.log('Total Leave Requests:', leaveSummary.total);
    console.log('Pending:', leaveSummary.upcoming);
    console.log('Approved:', leaveSummary.approved);
    console.log('Rejected:', leaveSummary.rejected);
    console.log('Access Type: READ-ONLY');
    console.log('========================================\n');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

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

/**
 * POST, PUT, DELETE, PATCH - Disallowed mutations
 * This endpoint is READ-ONLY
 * Leave requests must be submitted by student through their dashboard.
 */
export async function POST() {
  return NextResponse.json(
    { message: 'Method not allowed. This endpoint is read-only. Leave requests must be submitted by the student through their dashboard.' },
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
