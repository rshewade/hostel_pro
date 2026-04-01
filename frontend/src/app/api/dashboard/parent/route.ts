import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { DashboardAPI } from '@/types/api';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/dashboard/parent
 * Get parent dashboard data (view-only for student's information)
 * Auth: PARENT only
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, ['PARENT']);
    // Get parent's associated student ID from query or token
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');

    if (!studentId) {
      return unauthorizedResponse('Student ID is required');
    }

    // Get student record
    const { rows: studentRows } = await query(
      'SELECT * FROM students WHERE user_id = $1',
      [studentId]
    );
    const student = studentRows.length > 0 ? studentRows[0] : null;

    // Get room allocation
    const { rows: allocationRows } = await query(
      `SELECT * FROM room_allocations WHERE student_id = $1 AND status = 'ACTIVE'`,
      [studentId]
    );
    const allocation = allocationRows.length > 0 ? allocationRows[0] : null;

    let roomNumber = 'Not Allocated';
    let vertical = 'N/A';

    if (allocation) {
      const { rows: roomRows } = await query(
        'SELECT * FROM rooms WHERE id = $1',
        [allocation.room_id]
      );
      const room = roomRows.length > 0 ? roomRows[0] : null;

      if (room) {
        roomNumber = room.room_number;
        vertical = room.vertical;
      }
    }

    // Get student fees
    const { rows: fees } = await query(
      'SELECT * FROM fees WHERE student_id = $1',
      [studentId]
    );

    // Get student leaves
    const { rows: leaves } = await query(
      'SELECT * FROM leave_requests WHERE student_id = $1',
      [studentId]
    );

    // Get notifications (mock - parent-specific notifications)
    const notifications = [
      {
        id: 'notif1',
        message: 'Your ward has been allocated to a room',
        created_at: allocation?.allocated_at || new Date().toISOString(),
      },
    ];

    // Get user details
    const { rows: userRows } = await query(
      'SELECT * FROM users WHERE id = $1',
      [studentId]
    );
    const user = userRows.length > 0 ? userRows[0] : null;

    const dashboardData: DashboardAPI.ParentDashboard = {
      student: {
        name: student?.name || user?.full_name || user?.email || 'Student',
        vertical: vertical as any,
        room: roomNumber,
        joining_date: allocation?.allocated_at || 'N/A',
      },
      fees: fees || [],
      leaves: leaves || [],
      notifications,
    };

    return successResponse(dashboardData);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/dashboard/parent:', error);
    return serverErrorResponse('Failed to fetch parent dashboard', error);
  }
}
