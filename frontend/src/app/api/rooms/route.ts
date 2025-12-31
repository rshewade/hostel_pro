import { NextRequest } from 'next/server';
import { find } from '@/lib/api/db';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { RoomAPI, Vertical, RoomStatus } from '@/types/api';

/**
 * GET /api/rooms
 * List available rooms with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vertical = searchParams.get('vertical') as Vertical | null;
    const floor = searchParams.get('floor');
    const status = searchParams.get('status') as RoomStatus | null;

    let rooms = await find('rooms', (room: any) => {
      const matchesVertical = !vertical || room.vertical === vertical;
      const matchesFloor = !floor || room.floor === parseInt(floor);
      const matchesStatus = !status || room.status === status;

      return matchesVertical && matchesFloor && matchesStatus;
    });

    // Sort by room number
    rooms.sort((a: any, b: any) => a.room_number.localeCompare(b.room_number));

    return successResponse(rooms);
  } catch (error: any) {
    console.error('Error in GET /api/rooms:', error);
    return serverErrorResponse('Failed to fetch rooms', error);
  }
}
