import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { Vertical, RoomStatus } from '@/types/api';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/rooms
 * List available rooms with optional filtering
 * Auth: any authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const vertical = searchParams.get('vertical') as Vertical | null;
    const floor = searchParams.get('floor');
    const status = searchParams.get('status') as RoomStatus | null;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (vertical) {
      conditions.push(`vertical = $${paramIndex++}`);
      params.push(vertical);
    }
    if (floor) {
      conditions.push(`floor = $${paramIndex++}`);
      params.push(parseInt(floor));
    }
    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM rooms ${whereClause} ORDER BY room_number`;

    const { rows: rooms } = await query(sql, params);

    return successResponse(rooms);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/rooms:', error);
    return serverErrorResponse('Failed to fetch rooms', error);
  }
}
