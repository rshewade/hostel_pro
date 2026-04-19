import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { AllocationAPI } from '@/types/api';
import { requireAuth } from '@/lib/authorize';

/**
 * PUT /api/allocations/vacate/[id]
 * Vacate a room allocation
 * Auth: SUPERINTENDENT only
 */
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(_request, ['SUPERINTENDENT']);
    const { id } = await params;

    // Get allocation with room info
    const { rows: allocationRows } = await query(
      `SELECT ra.*, row_to_json(r.*) AS rooms
       FROM room_allocations ra
       LEFT JOIN rooms r ON r.id = ra.room_id
       WHERE ra.id = $1`,
      [id]
    );

    if (allocationRows.length === 0) {
      return notFoundResponse('Allocation not found');
    }

    const allocation = allocationRows[0];

    if (allocation.status === 'CHECKED_OUT') {
      return badRequestResponse('Room has already been vacated');
    }

    const room = allocation.rooms;

    // Update allocation
    const { rows: updatedRows } = await query(
      `UPDATE room_allocations
       SET vacated_at = $1, status = $2
       WHERE id = $3
       RETURNING *`,
      [new Date().toISOString(), 'CHECKED_OUT', id]
    );

    if (updatedRows.length === 0) {
      return serverErrorResponse('Failed to vacate room');
    }

    const updatedAllocation = updatedRows[0];

    // Update room occupancy
    if (room) {
      const newOccupied = Math.max(0, room.occupied_count - 1);
      await query(
        `UPDATE rooms SET occupied_count = $1, status = $2 WHERE id = $3`,
        [newOccupied, newOccupied < room.capacity ? 'AVAILABLE' : 'OCCUPIED', allocation.room_id]
      );
    }

    // Log vacate action
    await query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, metadata)
       VALUES ($1, $2, $3, $4)`,
      [
        'ROOM_ALLOCATION',
        id,
        'VACATE',
        JSON.stringify({
          student_id: allocation.student_id,
          room_id: allocation.room_id,
          room_number: room?.room_number,
          old_status: allocation.status,
          new_status: 'CHECKED_OUT',
        }),
      ]
    );

    return successResponse({
      data: updatedAllocation,
    } as AllocationAPI.VacateResponse);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in PUT /api/allocations/vacate/[id]:', error);
    return serverErrorResponse('Failed to vacate room', error);
  }
}
