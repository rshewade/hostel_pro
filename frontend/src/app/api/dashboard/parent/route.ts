import { NextRequest } from 'next/server';
import { findOne, find } from '@/lib/api/db';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { DashboardAPI } from '@/types/api';

/**
 * GET /api/dashboard/parent
 * Get parent dashboard data (view-only for student's information)
 */
export async function GET(request: NextRequest) {
  try {
    // Get parent's associated student ID from query or token
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');

    if (!studentId) {
      return unauthorizedResponse('Student ID is required');
    }

    // Get student record
    const student = await findOne('students', (s: any) => s.user_id === studentId);

    // Get room allocation
    const allocation = await findOne(
      'allocations',
      (a: any) => a.student_id === studentId && a.status === 'ACTIVE'
    );

    let roomNumber = 'Not Allocated';
    let vertical = 'N/A';

    if (allocation) {
      const room = await findOne('rooms', (r: any) => r.id === allocation.room_id);
      if (room) {
        roomNumber = room.room_number;
        vertical = room.vertical;
      }
    }

    // Get student fees
    const fees = await find('fees', (f: any) => f.student_id === studentId);

    // Get student leaves
    const leaves = await find('leaves', (l: any) => l.student_id === studentId);

    // Get notifications (mock - parent-specific notifications)
    const notifications = [
      {
        id: 'notif1',
        message: 'Your ward has been allocated to a room',
        created_at: allocation?.allocated_at || new Date().toISOString(),
      },
    ];

    const user = await findOne('users', (u: any) => u.id === studentId);

    const dashboardData: DashboardAPI.ParentDashboard = {
      student: {
        name: student?.name || user?.full_name || user?.email || 'Student',
        vertical: vertical as any,
        room: roomNumber,
        joining_date: allocation?.allocated_at || 'N/A',
      },
      fees,
      leaves,
      notifications,
    };

    return successResponse(dashboardData);
  } catch (error: any) {
    console.error('Error in GET /api/dashboard/parent:', error);
    return serverErrorResponse('Failed to fetch parent dashboard', error);
  }
}
