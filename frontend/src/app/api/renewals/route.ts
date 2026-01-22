import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';

/**
 * GET /api/renewals
 * List renewal applications - students due for 6-month renewal
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vertical = searchParams.get('vertical');

    // Get active allocations with student info
    let query = supabase
      .from('room_allocations')
      .select(`
        id,
        student_user_id,
        room_id,
        allocated_at,
        status,
        check_in_confirmed,
        rooms (id, room_number, vertical, floor),
        users!student_user_id (id, full_name, email, mobile, vertical)
      `)
      .eq('status', 'ACTIVE');

    const { data: allocations, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return serverErrorResponse('Failed to fetch renewals', error);
    }

    // Calculate renewal status for each allocation
    const now = new Date();
    const renewals = (allocations || []).map((allocation: any) => {
      const allocatedAt = new Date(allocation.allocated_at);
      const sixMonthsFromAllocation = new Date(allocatedAt);
      sixMonthsFromAllocation.setMonth(sixMonthsFromAllocation.getMonth() + 6);

      const daysRemaining = Math.ceil(
        (sixMonthsFromAllocation.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Determine renewal status
      let renewalStatus = 'NOT_DUE';
      if (daysRemaining <= 0) {
        renewalStatus = 'OVERDUE';
      } else if (daysRemaining <= 30) {
        renewalStatus = 'DUE_SOON';
      } else if (daysRemaining <= 60) {
        renewalStatus = 'UPCOMING';
      }

      const user = allocation.users || {};
      const room = allocation.rooms || {};

      return {
        id: allocation.id,
        student_id: allocation.student_user_id,
        student_name: user.full_name || 'Unknown Student',
        vertical: user.vertical || room.vertical || 'BOYS',
        room: room.room_number || 'Unassigned',
        type: 'SEMESTER',
        status: renewalStatus,
        days_remaining: daysRemaining,
        documents_uploaded: 0,
        documents_required: 3,
        allocated_at: allocation.allocated_at,
        renewal_due_date: sixMonthsFromAllocation.toISOString(),
      };
    });

    // Filter by status if provided
    let filteredRenewals = renewals;
    if (status && status !== 'all') {
      filteredRenewals = renewals.filter((r: any) => r.status === status.toUpperCase());
    }

    // Filter by vertical if provided
    if (vertical && vertical !== 'all') {
      filteredRenewals = filteredRenewals.filter((r: any) =>
        r.vertical.toUpperCase() === vertical.toUpperCase()
      );
    }

    // Sort by days remaining (most urgent first)
    filteredRenewals.sort((a: any, b: any) => a.days_remaining - b.days_remaining);

    return successResponse(filteredRenewals);
  } catch (error: any) {
    console.error('Error in GET /api/renewals:', error);
    return serverErrorResponse('Failed to fetch renewals', error);
  }
}
