import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  serverErrorResponse,
  validateFields,
} from '@/lib/api/responses';
import { AllocationAPI, AllocationStatus } from '@/types/api';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/allocations
 * List room allocations
 * Auth: STUDENT (own only), SUPERINTENDENT, TRUSTEE
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['STUDENT', 'SUPERINTENDENT', 'TRUSTEE']);
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get('student_id');

    // Students can only see their own allocations
    const isStudent = user.role === 'STUDENT';
    const filterStudentId = isStudent ? user.id : studentIdParam;

    let sql = `SELECT ra.*,
              row_to_json(r.*) AS rooms,
              row_to_json(u.*) AS users
       FROM room_allocations ra
       LEFT JOIN rooms r ON r.id = ra.room_id
       LEFT JOIN users u ON u.id = ra.student_id`;
    const params: string[] = [];

    if (filterStudentId) {
      params.push(filterStudentId);
      sql += ` WHERE ra.student_id = $${params.length}`;
    }

    sql += ` ORDER BY ra.allocated_at DESC`;

    const { rows: allocations } = await query(sql, params);

    return successResponse(allocations);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/allocations:', error);
    return serverErrorResponse('Failed to fetch allocations', error);
  }
}

/**
 * POST /api/allocations
 * Create a new room allocation
 * Auth: SUPERINTENDENT, TRUSTEE
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT', 'TRUSTEE']);
    const body: AllocationAPI.CreateRequest = await request.json();
    const { student_id, room_id } = body;

    // Validate input
    const validation = validateFields([
      {
        field: 'student_id',
        value: student_id,
        rules: [{ type: 'required', message: 'Student ID is required' }],
      },
      {
        field: 'room_id',
        value: room_id,
        rules: [{ type: 'required', message: 'Room ID is required' }],
      },
    ]);

    if (!validation.isValid) {
      return badRequestResponse('Validation failed', validation.errors);
    }

    // Verify room exists and has capacity
    const { rows: roomRows } = await query(
      'SELECT * FROM rooms WHERE id = $1',
      [room_id]
    );

    if (roomRows.length === 0) {
      return badRequestResponse('Room not found');
    }

    const room = roomRows[0];

    if (room.occupied_count >= room.capacity) {
      return badRequestResponse('Room is at full capacity');
    }

    // Check if student already has an active allocation
    const { rows: existingRows } = await query(
      'SELECT id FROM room_allocations WHERE student_id = $1 AND status = $2',
      [student_id, 'ACTIVE']
    );

    if (existingRows.length > 0) {
      return badRequestResponse('Student already has an active room allocation');
    }

    // Create allocation
    const { rows: insertRows } = await query(
      `INSERT INTO room_allocations (student_id, room_id, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [student_id, room_id, 'ACTIVE']
    );

    if (insertRows.length === 0) {
      return serverErrorResponse('Failed to create allocation');
    }

    const newAllocation = insertRows[0];

    // Update room occupancy
    const newOccupied = room.occupied_count + 1;
    await query(
      `UPDATE rooms SET occupied_count = $1, status = $2 WHERE id = $3`,
      [newOccupied, newOccupied >= room.capacity ? 'OCCUPIED' : 'AVAILABLE', room_id]
    );

    // Log allocation
    await query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, metadata)
       VALUES ($1, $2, $3, $4)`,
      [
        'ROOM_ALLOCATION',
        newAllocation.id,
        'CREATE',
        JSON.stringify({
          student_id,
          room_id,
          room_number: room.room_number,
        }),
      ]
    );

    console.log('\n========================================');
    console.log('ROOM ALLOCATED');
    console.log('========================================');
    console.log('Allocation ID:', newAllocation.id);
    console.log('Student ID:', student_id);
    console.log('Room:', room.room_number);
    console.log('========================================\n');

    return createdResponse(
      { data: newAllocation } as AllocationAPI.CreateResponse,
      'Room allocated successfully'
    );
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in POST /api/allocations:', error);
    return serverErrorResponse('Failed to create allocation', error);
  }
}
