import { NextRequest } from 'next/server';
import { findById, updateById, insert } from '@/lib/api/db';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { AllocationAPI, AllocationStatus } from '@/types/api';

/**
 * PUT /api/allocations/vacate/[id]
 * Vacate a room allocation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const allocation = await findById('allocations', id);

    if (!allocation) {
      return notFoundResponse('Allocation not found');
    }

    if (allocation.status === AllocationStatus.VACATED) {
      return badRequestResponse('Room has already been vacated');
    }

    // Get room info
    const room = await findById('rooms', allocation.room_id);

    // Update allocation
    const updatedAllocation = await updateById('allocations', id, {
      vacated_at: new Date().toISOString(),
      status: AllocationStatus.VACATED,
    });

    // Update room occupancy
    if (room) {
      await updateById('rooms', allocation.room_id, {
        current_occupancy: Math.max(0, room.current_occupancy - 1),
        status: room.current_occupancy - 1 < room.capacity ? 'AVAILABLE' : 'FULL',
      });
    }

    // Log vacate action
    await insert('auditLogs', {
      id: `audit${Date.now()}`,
      entity_type: 'ALLOCATION',
      entity_id: id,
      action: 'VACATE',
      old_value: AllocationStatus.ACTIVE,
      new_value: AllocationStatus.VACATED,
      performed_by: null,
      performed_at: new Date().toISOString(),
      metadata: {
        student_id: allocation.student_id,
        room_id: allocation.room_id,
        room_number: room?.room_number,
      },
    });

    console.log('\n========================================');
    console.log('👋 ROOM VACATED');
    console.log('========================================');
    console.log('Allocation ID:', id);
    console.log('Student ID:', allocation.student_id);
    console.log('Room:', room?.room_number);
    console.log('========================================\n');

    return successResponse({
      data: updatedAllocation,
    } as AllocationAPI.VacateResponse);
  } catch (error: any) {
    console.error('Error in PUT /api/allocations/vacate/[id]:', error);
    return serverErrorResponse('Failed to vacate room', error);
  }
}
