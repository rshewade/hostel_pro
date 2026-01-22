import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { AllocationAPI } from '@/types/api';

/**
 * PUT /api/allocations/vacate/[id]
 * Vacate a room allocation
 */
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;

    // Get allocation with room info
    const { data: allocation, error: fetchError } = await supabase
      .from('room_allocations')
      .select('*, rooms(*)')
      .eq('id', id)
      .single();

    if (fetchError || !allocation) {
      return notFoundResponse('Allocation not found');
    }

    if (allocation.status === 'CHECKED_OUT') {
      return badRequestResponse('Room has already been vacated');
    }

    const room = allocation.rooms;

    // Update allocation
    const { data: updatedAllocation, error: updateError } = await supabase
      .from('room_allocations')
      .update({
        vacated_at: new Date().toISOString(),
        status: 'CHECKED_OUT',
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return serverErrorResponse('Failed to vacate room', updateError);
    }

    // Update room occupancy
    if (room) {
      await supabase
        .from('rooms')
        .update({
          occupied_count: Math.max(0, room.occupied_count - 1),
          status: room.occupied_count - 1 < room.capacity ? 'AVAILABLE' : 'OCCUPIED',
        })
        .eq('id', allocation.room_id);
    }

    // Log vacate action
    await supabase.from('audit_logs').insert({
      entity_type: 'ROOM_ALLOCATION',
      entity_id: id,
      action: 'VACATE',
      metadata: {
        student_id: allocation.student_user_id,
        room_id: allocation.room_id,
        room_number: room?.room_number,
        old_status: allocation.status,
        new_status: 'CHECKED_OUT',
      },
    });

    console.log('\n========================================');
    console.log('👋 ROOM VACATED');
    console.log('========================================');
    console.log('Allocation ID:', id);
    console.log('Student ID:', allocation.student_user_id);
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
