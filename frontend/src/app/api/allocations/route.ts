import { NextRequest } from 'next/server';
import { getCollection, insert, findById, updateById, generateId } from '@/lib/api/db';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  serverErrorResponse,
  validateFields,
} from '@/lib/api/responses';
import { AllocationAPI, AllocationStatus } from '@/types/api';

/**
 * GET /api/allocations
 * List all room allocations
 */
export async function GET(request: NextRequest) {
  try {
    const allocations = await getCollection('allocations');

    // Sort by allocation date (descending)
    allocations.sort((a: any, b: any) => {
      return new Date(b.allocated_at).getTime() - new Date(a.allocated_at).getTime();
    });

    return successResponse(allocations);
  } catch (error: any) {
    console.error('Error in GET /api/allocations:', error);
    return serverErrorResponse('Failed to fetch allocations', error);
  }
}

/**
 * POST /api/allocations
 * Create a new room allocation
 */
export async function POST(request: NextRequest) {
  try {
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
    const room = await findById('rooms', room_id);
    if (!room) {
      return badRequestResponse('Room not found');
    }

    if (room.current_occupancy >= room.capacity) {
      return badRequestResponse('Room is at full capacity');
    }

    // Check if student already has an active allocation
    const allocations = await getCollection('allocations');
    const existingAllocation = allocations.find(
      (a: any) => a.student_id === student_id && a.status === AllocationStatus.ACTIVE
    );

    if (existingAllocation) {
      return badRequestResponse('Student already has an active room allocation');
    }

    // Create allocation
    const newAllocation = {
      id: generateId('alloc'),
      student_id,
      room_id,
      allocated_at: new Date().toISOString(),
      vacated_at: null,
      status: AllocationStatus.ACTIVE,
    };

    await insert('allocations', newAllocation);

    // Update room occupancy
    await updateById('rooms', room_id, {
      current_occupancy: room.current_occupancy + 1,
      status: room.current_occupancy + 1 >= room.capacity ? 'FULL' : 'AVAILABLE',
    });

    // Log allocation
    await insert('auditLogs', {
      id: `audit${Date.now()}`,
      entity_type: 'ALLOCATION',
      entity_id: newAllocation.id,
      action: 'CREATE',
      old_value: null,
      new_value: AllocationStatus.ACTIVE,
      performed_by: null,
      performed_at: new Date().toISOString(),
      metadata: {
        student_id,
        room_id,
        room_number: room.room_number,
      },
    });

    console.log('\n========================================');
    console.log('🏠 ROOM ALLOCATED');
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
    console.error('Error in POST /api/allocations:', error);
    return serverErrorResponse('Failed to create allocation', error);
  }
}
