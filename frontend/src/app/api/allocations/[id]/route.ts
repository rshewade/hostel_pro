import { NextRequest } from 'next/server';
import { findById, updateById } from '@/lib/api/db';
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
  badRequestResponse,
} from '@/lib/api/responses';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/allocations/[id]
 * Get a single allocation by ID
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    
    console.log(`GET /api/allocations/${id}`); // Debug

    const allocation = await findById('allocations', id);

    if (!allocation) {
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
    const params = await props.params;
    const { id } = params;
    const body = await request.json();

    console.log(`PUT /api/allocations/${id}`, body); // Debug

    const existingAllocation = await findById('allocations', id);

    if (!existingAllocation) {
      return notFoundResponse('Allocation not found');
    }

    // Perform update
    const updatedAllocation = await updateById('allocations', id, body);

    if (!updatedAllocation) {
      return serverErrorResponse('Failed to update allocation');
    }

    return successResponse(updatedAllocation);
  } catch (error: any) {
    console.error('Error in PUT /api/allocations/[id]:', error);
    return serverErrorResponse('Failed to update allocation', error);
  }
}
