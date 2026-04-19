import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { InterviewAPI } from '@/types/api';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/interviews/slots
 * Get available interview time slots for a given date
 * Auth: TRUSTEE, SUPERINTENDENT
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['TRUSTEE', 'SUPERINTENDENT']);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const trusteeId = searchParams.get('trustee_id');

    if (!date) {
      return badRequestResponse('Date parameter is required');
    }

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return badRequestResponse('Invalid date format');
    }

    // Get all interviews for the date (not cancelled)
    const conditions: string[] = ["status != 'CANCELLED'"];
    const params: any[] = [];
    let paramIndex = 1;

    if (trusteeId) {
      conditions.push(`trustee_id = $${paramIndex++}`);
      params.push(trusteeId);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const { rows: allInterviews } = await query(
      `SELECT * FROM interviews ${whereClause}`,
      params
    );

    // Filter interviews for the specific date
    const interviews = (allInterviews || []).filter((interview: any) => {
      const scheduleDate = new Date(interview.schedule_time).toISOString().split('T')[0];
      return scheduleDate === date;
    });

    // Generate time slots (9 AM - 5 PM, hourly)
    const slots = generateTimeSlots(date);

    // Mark booked slots
    const bookedTimes = new Set(
      interviews.map((i: any) => {
        const time = new Date(i.schedule_time);
        return `${time.getHours().toString().padStart(2, '0')}:00`;
      })
    );

    const availableSlots = slots.map((slot) => ({
      time: slot.time,
      available: !bookedTimes.has(slot.time.split('T')[1].substring(0, 5)),
    }));

    return successResponse({
      slots: availableSlots,
    } as InterviewAPI.SlotsResponse);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return serverErrorResponse('Failed to fetch interview slots', error);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate time slots for a given date
 */
function generateTimeSlots(date: string): Array<{ time: string }> {
  const slots = [];
  const baseDate = new Date(date);

  // Generate hourly slots from 9 AM to 5 PM
  for (let hour = 9; hour <= 17; hour++) {
    const slotTime = new Date(baseDate);
    slotTime.setHours(hour, 0, 0, 0);

    slots.push({
      time: slotTime.toISOString(),
    });
  }

  return slots;
}
