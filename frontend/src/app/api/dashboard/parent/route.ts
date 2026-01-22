import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
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
    const supabase = createServerClient();

    // Get parent's associated student ID from query or token
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');

    if (!studentId) {
      return unauthorizedResponse('Student ID is required');
    }

    // Get student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', studentId)
      .single();

    // Get room allocation
    const { data: allocation, error: allocError } = await supabase
      .from('room_allocations')
      .select('*')
      .eq('student_user_id', studentId)
      .eq('status', 'ACTIVE')
      .single();

    let roomNumber = 'Not Allocated';
    let vertical = 'N/A';

    if (allocation && !allocError) {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', allocation.room_id)
        .single();

      if (room && !roomError) {
        roomNumber = room.room_number;
        vertical = room.vertical;
      }
    }

    // Get student fees
    const { data: fees, error: feesError } = await supabase
      .from('fees')
      .select('*')
      .eq('student_user_id', studentId);

    if (feesError) {
      console.error('Supabase error fetching fees:', feesError);
    }

    // Get student leaves
    const { data: leaves, error: leavesError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('student_user_id', studentId);

    if (leavesError) {
      console.error('Supabase error fetching leaves:', leavesError);
    }

    // Get notifications (mock - parent-specific notifications)
    const notifications = [
      {
        id: 'notif1',
        message: 'Your ward has been allocated to a room',
        created_at: allocation?.allocated_at || new Date().toISOString(),
      },
    ];

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', studentId)
      .single();

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
    console.error('Error in GET /api/dashboard/parent:', error);
    return serverErrorResponse('Failed to fetch parent dashboard', error);
  }
}
