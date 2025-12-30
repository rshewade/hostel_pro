import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/parent/fees
 *
 * Read-only endpoint for parent to view their ward's fee information.
 * In production, this would verify parent session and return associated student's fee data.
 *
 * Query Parameters:
 * - sessionToken: string - Parent session token from OTP login
 *
 * Response:
 * - Success: 200 with { success: true, data: FeeData }
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

    // Mock fee data - in production, query database for parent's associated student
    const feeSummary = {
      totalFees: 75000,
      totalPaid: 50000,
      outstanding: 25000,
      nextDueDate: '2025-12-31',
      status: 'PENDING',
    };

    const feeItems = [
      {
        id: '1',
        name: 'Processing Fee',
        description: 'One-time application processing charge',
        amount: 5000,
        status: 'PAID',
        paidDate: '2024-06-15',
        dueDate: '2024-01-15',
        receiptUrl: '/api/parent/fees/receipt/1', // Read-only download
      },
      {
        id: '2',
        name: 'Hostel Fees (Semester 1)',
        description: 'Accommodation charges for semester 1',
        amount: 30000,
        status: 'PAID',
        paidDate: '2024-06-15',
        dueDate: '2024-01-30',
        receiptUrl: '/api/parent/fees/receipt/2',
      },
      {
        id: '3',
        name: 'Security Deposit',
        description: 'Refundable security deposit',
        amount: 10000,
        status: 'PAID',
        paidDate: '2024-06-15',
        dueDate: '2024-01-30',
        receiptUrl: '/api/parent/fees/receipt/3',
      },
      {
        id: '4',
        name: 'Hostel Fees (Semester 2)',
        description: 'Accommodation charges for semester 2',
        amount: 30000,
        status: 'PENDING',
        paidDate: null,
        dueDate: '2025-12-31',
        receiptUrl: null,
      },
    ];

    const feeData = {
      summary: feeSummary,
      items: feeItems,
    };

    // Mock logging
    console.log('\n========================================');
    console.log('💰 PARENT FEE DATA ACCESS');
    console.log('========================================');
    console.log('Endpoint: /api/parent/fees');
    console.log('Session ID:', tokenData.sessionId || 'unknown');
    console.log('Total Fees: ₹', feeSummary.totalFees.toLocaleString());
    console.log('Paid: ₹', feeSummary.totalPaid.toLocaleString());
    console.log('Outstanding: ₹', feeSummary.outstanding.toLocaleString());
    console.log('Access Type: READ-ONLY');
    console.log('========================================\n');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: feeData,
    });

  } catch (error) {
    console.error('Error in /api/parent/fees:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST, PUT, DELETE, PATCH - Disallowed mutations
 * This endpoint is READ-ONLY
 */
export async function POST() {
  return NextResponse.json(
    { message: 'Method not allowed. This endpoint is read-only. Fee payments must be made by the student or through official channels.' },
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
