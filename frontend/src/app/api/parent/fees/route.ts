import { NextRequest, NextResponse } from 'next/server';
import { findOne, find } from '@/lib/api/db';

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

    const normalizePhone = (phone: string) => phone?.replace(/[\s+\-]/g, '').slice(-10);
    const normalizedParentMobile = normalizePhone(tokenData.contact);

    const parentUser = await findOne('users', (u: any) => 
      u.role === 'parent' && normalizePhone(u.mobile_no) === normalizedParentMobile
    );

    let studentUserId = null;
    if (parentUser?.linked_student_id) {
      const student = await findOne('students', (s: any) => s.id === parentUser.linked_student_id);
      studentUserId = student?.user_id;
    }

    let fees = [];
    if (studentUserId) {
      fees = await find('fees', (f: any) => f.student_id === studentUserId);
    }

    const totalFees = fees.reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
    const totalPaid = fees
      .filter((f: any) => f.status === 'PAID')
      .reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
    const outstanding = totalFees - totalPaid;

    const pendingFees = fees.filter((f: any) => f.status === 'PENDING');
    const nextDueDate = pendingFees.length > 0 
      ? pendingFees.sort((a: any, b: any) => new Date(a.due_date || '9999-12-31').getTime() - new Date(b.due_date || '9999-12-31').getTime())[0]?.due_date 
      : null;

    const feeItems = fees.map((fee: any) => ({
      id: fee.id,
      name: fee.head?.replace(/_/g, ' ') || 'Fee',
      amount: fee.amount,
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
    console.error('Error in /api/parent/fees:', error);
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
