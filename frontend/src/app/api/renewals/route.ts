import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/renewals
 * List renewal applications - students due for 6-month renewal
 * Auth: STUDENT (own renewals) or SUPERINTENDENT (all)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['STUDENT', 'SUPERINTENDENT']);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vertical = searchParams.get('vertical');

    // Get active allocations with student and room info via JOINs
    const { rows: allocations } = await query(
      `SELECT
        ra.id,
        ra.student_id,
        ra.room_id,
        ra.allocated_at,
        ra.status,
        ra.check_in_confirmed,
        r.id AS room_db_id,
        r.room_number,
        r.vertical AS room_vertical,
        r.floor,
        u.id AS user_db_id,
        u.full_name,
        u.email,
        u.mobile,
        u.vertical AS user_vertical
      FROM room_allocations ra
      LEFT JOIN rooms r ON ra.room_id = r.id
      LEFT JOIN users u ON ra.student_id = u.id
      WHERE ra.status = 'ACTIVE'`,
      []
    );

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

      return {
        id: allocation.id,
        student_id: allocation.student_id,
        student_name: allocation.full_name || 'Unknown Student',
        vertical: allocation.user_vertical || allocation.room_vertical || 'BOYS',
        room: allocation.room_number || 'Unassigned',
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
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/renewals:', error);
    return serverErrorResponse('Failed to fetch renewals', error);
  }
}
