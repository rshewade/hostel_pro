import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/parent/student
 *
 * Read-only endpoint for parent to view their ward's student information.
 * In production, this would verify parent session and return associated student data.
 *
 * Query Parameters:
 * - sessionToken: string - Parent session token from OTP login
 *
 * Response:
 * - Success: 200 with { success: true, data: StudentData }
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
    // In production, this would validate against database
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

    // Mock student data - in production, query database for parent's associated student
    const studentData = {
      id: 'STU001',
      name: 'Rahul Jain',
      photo: null, // Optional photo URL
      vertical: 'Boys Hostel',
      room: 'Room 201, Block A',
      joiningDate: '2024-06-15',
      status: 'CHECKED_IN',
      academicYear: '2024-25',
      currentPeriod: 'SEMESTER_2',
    };

    // Mock logging
    console.log('\n========================================');
    console.log('👨‍👩‍👧 PARENT DATA ACCESS');
    console.log('========================================');
    console.log('Endpoint: /api/parent/student');
    console.log('Session ID:', tokenData.sessionId || 'unknown');
    console.log('Student ID:', studentData.id);
    console.log('Access Type: READ-ONLY');
    console.log('========================================\n');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: studentData,
    });

  } catch (error) {
    console.error('Error in /api/parent/student:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST, PUT, DELETE - Disallowed mutations
 * This endpoint is READ-ONLY
 */
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
