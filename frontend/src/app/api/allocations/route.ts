import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
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
    const supabase = createServerClient();

    const { data: allocations, error } = await supabase
      .from('room_allocations')
      .select('*, rooms(*), users!student_user_id(*)')
      .order('allocated_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return serverErrorResponse('Failed to fetch allocations', error);
    }

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
    const supabase = createServerClient();
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
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', room_id)
      .single();

    if (roomError || !room) {
      return badRequestResponse('Room not found');
    }

    if (room.occupied_count >= room.capacity) {
      return badRequestResponse('Room is at full capacity');
    }

    // Check if student already has an active allocation
    const { data: existingAllocation } = await supabase
      .from('room_allocations')
      .select('id')
      .eq('student_user_id', student_id)
      .eq('status', 'ACTIVE')
      .single();

    if (existingAllocation) {
      return badRequestResponse('Student already has an active room allocation');
    }

    // Create allocation
    const { data: newAllocation, error: insertError } = await supabase
      .from('room_allocations')
      .insert({
        student_user_id: student_id,
        room_id,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return serverErrorResponse('Failed to create allocation', insertError);
    }

    // Update room occupancy
    await supabase
      .from('rooms')
      .update({
        occupied_count: room.occupied_count + 1,
        status: room.occupied_count + 1 >= room.capacity ? 'OCCUPIED' : 'AVAILABLE',
      })
      .eq('id', room_id);

    // Log allocation
    await supabase.from('audit_logs').insert({
      entity_type: 'ROOM_ALLOCATION',
      entity_id: newAllocation.id,
      action: 'CREATE',
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
