import { NextRequest } from 'next/server';
import { findOne, find } from '@/lib/api/db';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { DashboardAPI } from '@/types/api';

/**
 * GET /api/dashboard/student
 * Get student dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Get student ID from auth token (simplified for prototype)
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7); // Remove 'Bearer '

    if (!token) {
      return unauthorizedResponse('Authentication required');
    }

    // Decode token to get user ID (simplified)
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const studentId = tokenData.userId;

    // Get student profile
    const profile = await findOne('profiles', (p: any) => p.user_id === studentId);

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

    // Get fee summary
    const fees = await find('fees', (f: any) => f.student_id === studentId);
    let pendingAmount = 0;
    let overdueAmount = 0;
    let upcomingDueDate: string | null = null;

    fees.forEach((fee: any) => {
      const dueDate = new Date(fee.due_date);
      const isOverdue = dueDate < new Date();

      if (fee.status === 'PENDING') {
        if (isOverdue) {
          overdueAmount += fee.amount;
        } else {
          pendingAmount += fee.amount;
          if (!upcomingDueDate || dueDate < new Date(upcomingDueDate)) {
            upcomingDueDate = fee.due_date;
          }
        }
      }
    });

    // Get leave summary
    const leaves = await find('leaves', (l: any) => l.student_id === studentId);
    const approvedCount = leaves.filter((l: any) => l.status === 'APPROVED').length;
    const pendingCount = leaves.filter((l: any) => l.status === 'PENDING').length;

    const upcomingLeaves = leaves
      .filter((l: any) => {
        return l.status === 'APPROVED' && new Date(l.start_time) > new Date();
      })
      .slice(0, 3);

    // Get recent notifications (mock)
    const notifications = [
      {
        id: 'notif1',
        message: 'Welcome to the hostel management system',
        created_at: new Date().toISOString(),
      },
    ];

    const user = await findOne('users', (u: any) => u.id === studentId);

    const dashboardData: DashboardAPI.StudentDashboard = {
      profile: {
        name: profile?.full_name || user?.email || 'Student',
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
    console.error('Error in GET /api/dashboard/student:', error);
    return serverErrorResponse('Failed to fetch student dashboard', error);
  }
}
