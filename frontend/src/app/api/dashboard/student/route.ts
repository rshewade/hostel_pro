import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
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
    const supabase = createServerClient();

    // Get student ID from auth token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.substring(7);

    if (!token) {
      return unauthorizedResponse('Authentication required');
    }

    // Decode token to get user ID
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const studentId = tokenData.userId;

    // Get user record
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', studentId)
      .single();

    // Get room allocation with room details
    const { data: allocation } = await supabase
      .from('room_allocations')
      .select('*, rooms(*)')
      .eq('student_user_id', studentId)
      .eq('status', 'ACTIVE')
      .single();

    let roomNumber = 'Not Allocated';
    let vertical = 'N/A';

    if (allocation && allocation.rooms) {
      roomNumber = allocation.rooms.room_number;
      vertical = allocation.rooms.vertical;
    }

    // Get fee summary
    const { data: fees } = await supabase
      .from('fees')
      .select('*')
      .eq('student_user_id', studentId);

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
    const { data: leaves } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('student_user_id', studentId);

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
    console.error('Error in GET /api/dashboard/student:', error);
    return serverErrorResponse('Failed to fetch student dashboard', error);
  }
}
