import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { InterviewAPI } from '@/types/api';

/**
 * GET /api/interviews/slots
 * Get available interview time slots for a given date
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
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

    // Get all interviews for the date
    const { data: allInterviews, error } = await supabase
      .from('interviews')
      .select('*')
      .neq('status', 'CANCELLED');

    if (error) {
      console.error('Supabase error fetching interviews:', error);
      return serverErrorResponse('Failed to fetch interviews', error);
    }

    // Filter interviews for the specific date and optionally by trustee
    const interviews = (allInterviews || []).filter((interview: any) => {
      const scheduleDate = new Date(interview.schedule_time).toISOString().split('T')[0];
      const matchesDate = scheduleDate === date;
      const matchesTrustee = !trusteeId || interview.trustee_id === trusteeId;

      return matchesDate && matchesTrustee;
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
    console.error('Error in GET /api/interviews/slots:', error);
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
