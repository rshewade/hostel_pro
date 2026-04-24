import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { Vertical, RoomStatus } from '@/types/api';
import { requireAuth, getVerticalFilter } from '@/lib/authorize';

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

    // Superintendents can only see their own vertical's rooms
    const userVerticalFilter = getVerticalFilter(user);
    if (userVerticalFilter) {
      conditions.push(`vertical = $${paramIndex++}`);
      params.push(userVerticalFilter);
    } else if (vertical) {
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

/**
 * POST /api/rooms
 * Create a new room
 * Auth: SUPERINTENDENT only
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT']);
    const body = await request.json();

    const { room_number, floor, capacity, building, room_type, amenities, rent_per_head } = body;
    // Auto-set vertical from superintendent's profile
    const vertical = body.vertical || user.vertical;

    if (!room_number || !vertical || floor === undefined || !capacity) {
      return badRequestResponse('Room number, floor, and capacity are required');
    }

    // Superintendent can only create rooms for their vertical
    const verticalFilter = getVerticalFilter(user);
    if (verticalFilter && vertical !== verticalFilter) {
      return badRequestResponse('You can only create rooms for your vertical');
    }

    const { rows } = await query(
      `INSERT INTO rooms (room_number, vertical, floor, capacity, building, room_type, amenities, rent_per_head)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        room_number,
        vertical,
        floor,
        capacity,
        building || null,
        room_type || null,
        amenities ? JSON.stringify(amenities) : null,
        rent_per_head || null,
      ]
    );

    return createdResponse(rows[0]);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in POST /api/rooms:', error);
    return serverErrorResponse('Failed to create room', error);
  }
}

/**
 * PUT /api/rooms
 * Update a room
 * Auth: SUPERINTENDENT only
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT']);
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return badRequestResponse('Room ID is required');
    }

    // Check room exists
    const { rows: existing } = await query('SELECT * FROM rooms WHERE id = $1', [id]);
    if (existing.length === 0) {
      return badRequestResponse('Room not found');
    }

    // Superintendent can only update rooms for their vertical
    const verticalFilter = getVerticalFilter(user);
    if (verticalFilter && existing[0].vertical !== verticalFilter) {
      return badRequestResponse('You can only update rooms in your vertical');
    }

    const ALLOWED_FIELDS = ['room_number', 'floor', 'capacity', 'building', 'room_type', 'amenities', 'status', 'rent_per_head'];
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const key of ALLOWED_FIELDS) {
      if (key in body && body[key] !== undefined) {
        values.push(key === 'amenities' ? JSON.stringify(body[key]) : body[key]);
        setClauses.push(`${key} = $${paramIndex++}`);
      }
    }

    if (setClauses.length === 0) {
      return badRequestResponse('No valid fields to update');
    }

    values.push(id);
    const { rows } = await query(
      `UPDATE rooms SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return successResponse(rows[0]);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in PUT /api/rooms:', error);
    return serverErrorResponse('Failed to update room', error);
  }
}
