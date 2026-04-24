import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifySignedSessionToken } from '@/lib/auth';

/**
 * GET /api/parent/fees
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

    let fees: any[] = [];
    if (studentUserId) {
      const { rows: feeData } = await query(
        'SELECT * FROM fees WHERE student_id = $1',
        [studentUserId]
      );

      fees = feeData || [];
    }

    const totalFees = fees.reduce((sum: number, f: any) => sum + parseFloat(f.amount || '0'), 0);
    const totalPaid = fees
      .filter((f: any) => f.status === 'PAID')
      .reduce((sum: number, f: any) => sum + parseFloat(f.amount || '0'), 0);
    const outstanding = totalFees - totalPaid;

    const pendingFees = fees.filter((f: any) => f.status === 'PENDING');
    const nextDueDate = pendingFees.length > 0
      ? pendingFees.sort((a: any, b: any) => new Date(a.due_date || '9999-12-31').getTime() - new Date(b.due_date || '9999-12-31').getTime())[0]?.due_date
      : null;

    const feeItems = fees.map((fee: any) => ({
      id: fee.id,
      name: fee.fee_head?.replace(/_/g, ' ') || fee.head?.replace(/_/g, ' ') || 'Fee',
      amount: parseFloat(fee.amount || '0'),
      status: fee.status,
      paidDate: fee.paid_at ? new Date(fee.paid_at).toLocaleDateString('en-IN') : null,
      dueDate: fee.due_date ? new Date(fee.due_date).toLocaleDateString('en-IN') : null,
    }));

    const feeData = {
      summary: {
        totalFees,
        totalPaid,
        outstanding,
        nextDueDate: nextDueDate ? new Date(nextDueDate).toLocaleDateString('en-IN') : 'N/A',
        status: outstanding > 0 ? 'PENDING' : 'PAID',
      },
      items: feeItems,
    };

    return NextResponse.json({
      success: true,
      data: feeData,
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
    { message: 'Method not allowed. Fee payments must be made by the student or through official channels.' },
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
