import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { Vertical, RoomStatus } from '@/types/api';

/**
 * GET /api/rooms
 * List available rooms with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const vertical = searchParams.get('vertical') as Vertical | null;
    const floor = searchParams.get('floor');
    const status = searchParams.get('status') as RoomStatus | null;

    let query = supabase.from('rooms').select('*');

    if (vertical) {
      query = query.eq('vertical', vertical);
    }
    if (floor) {
      query = query.eq('floor', parseInt(floor));
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: rooms, error } = await query.order('room_number');

    if (error) {
      console.error('Supabase error:', error);
      return serverErrorResponse('Failed to fetch rooms', error);
    }

    return successResponse(rooms);
  } catch (error: any) {
    console.error('Error in GET /api/rooms:', error);
    return serverErrorResponse('Failed to fetch rooms', error);
  }
}
