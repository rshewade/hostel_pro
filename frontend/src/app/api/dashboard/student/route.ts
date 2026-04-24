import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/authorize';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { DashboardAPI } from '@/types/api';

/**
 * GET /api/dashboard/student
 * Get student dashboard data
 * Auth: STUDENT (own data only), SUPERINTENDENT/TRUSTEE (any student)
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, ['STUDENT', 'SUPERINTENDENT', 'TRUSTEE']);

    // Students can only access their own data
    const { searchParams } = new URL(request.url);
    const studentId = authUser.role === 'STUDENT'
      ? authUser.id
      : searchParams.get('userId') || authUser.id;

    // Get user record
    const { rows: userRows } = await query(
      'SELECT * FROM users WHERE id = $1',
      [studentId]
    );
    const user = userRows.length > 0 ? userRows[0] : null;

    // Get room allocation with room details
    const { rows: allocationRows } = await query(
      `SELECT ra.*, r.room_number, r.vertical, r.capacity, r.occupied_count
       FROM room_allocations ra
       LEFT JOIN rooms r ON ra.room_id = r.id
       WHERE ra.student_id = $1 AND ra.status = 'ACTIVE'`,
      [studentId]
    );
    const allocation = allocationRows.length > 0 ? allocationRows[0] : null;

    let roomNumber = 'Not Allocated';
    let vertical = 'N/A';

    if (allocation) {
      roomNumber = allocation.room_number;
      vertical = allocation.vertical;
    }

    // Get fee summary
    const { rows: fees } = await query(
      'SELECT * FROM fees WHERE student_id = $1',
      [studentId]
    );

    let pendingAmount = 0;
    let overdueAmount = 0;
    let upcomingDueDate: string | null = null;

    const now = new Date();
    (fees || []).forEach((fee: any) => {
      const dueDate = new Date(fee.due_date);
      const isOverdue = dueDate < now;
      const amount = parseFloat(fee.amount) || 0;

      if (fee.status === 'PENDING') {
        if (isOverdue) {
          overdueAmount += amount;
        } else {
          pendingAmount += amount;
          if (!upcomingDueDate || dueDate < new Date(upcomingDueDate)) {
            upcomingDueDate = fee.due_date;
          }
        }
      }
    });

    // Get leave summary
    const { rows: leaves } = await query(
      'SELECT * FROM leave_requests WHERE student_id = $1',
      [studentId]
    );

    const approvedCount = (leaves || []).filter((l: any) => l.status === 'APPROVED').length;
    const pendingCount = (leaves || []).filter((l: any) => l.status === 'PENDING').length;

    const upcomingLeaves = (leaves || [])
      .filter((l: any) => {
        return l.status === 'APPROVED' && new Date(l.start_time) > now;
      })
      .slice(0, 3);

    // Get recent notifications (mock for now)
    const notifications = [
      {
        id: 'notif1',
        message: 'Welcome to the hostel management system',
        created_at: new Date().toISOString(),
      },
    ];

    const dashboardData: DashboardAPI.StudentDashboard = {
      profile: {
        name: user?.full_name || user?.email || 'Student',
        vertical: vertical as any,
        room: roomNumber,
        joining_date: allocation?.allocated_at || 'N/A',
      },
      fees: {
        pending: pendingAmount,
        overdue: overdueAmount,
        upcoming_due_date: upcomingDueDate,
      },
      leaves: {
        approved_count: approvedCount,
        pending_count: pendingCount,
        upcoming: upcomingLeaves,
      },
      notifications,
    };

    return successResponse(dashboardData);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/dashboard/student:', error);
    return serverErrorResponse('Failed to fetch student dashboard', error);
  }
}
