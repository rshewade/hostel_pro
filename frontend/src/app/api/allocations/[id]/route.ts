import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/responses';

/**
 * GET /api/allocations/[id]
 * Get a single allocation by ID
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const params = await props.params;
    const { id } = params;

    console.log(`GET /api/allocations/${id}`);

    const { data: allocation, error } = await supabase
      .from('room_allocations')
      .select('*, rooms(*), users!student_user_id(*)')
      .eq('id', id)
      .single();

    if (error || !allocation) {
      return notFoundResponse('Allocation not found');
    }

    return successResponse(allocation);
  } catch (error: any) {
    console.error('Error in GET /api/allocations/[id]:', error);
    return serverErrorResponse('Failed to fetch allocation', error);
  }
}

/**
 * PUT /api/allocations/[id]
 * Update an allocation (e.g. check-in confirmation)
 */
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const params = await props.params;
    const { id } = params;
    const body = await request.json();

    console.log(`PUT /api/allocations/${id}`, body);

    // Check if allocation exists
    const { data: existingAllocation, error: fetchError } = await supabase
      .from('room_allocations')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingAllocation) {
      return notFoundResponse('Allocation not found');
    }

    // Perform update
    const { data: updatedAllocation, error: updateError } = await supabase
      .from('room_allocations')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return serverErrorResponse('Failed to update allocation', updateError);
    }

    return successResponse(updatedAllocation);
  } catch (error: any) {
    console.error('Error in PUT /api/allocations/[id]:', error);
    return serverErrorResponse('Failed to update allocation', error);
  }
}
