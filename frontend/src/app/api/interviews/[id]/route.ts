import { NextRequest } from 'next/server';
import { findById, updateById } from '@/lib/api/db';
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/responses';

/**
 * GET /api/interviews/[id]
 * Get a single interview by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const interview = await findById('interviews', id);

    if (!interview) {
      return notFoundResponse('Interview not found');
    }

    return successResponse({ data: interview });
  } catch (error: any) {
    console.error('Error in GET /api/interviews/[id]:', error);
    return serverErrorResponse('Failed to fetch interview', error);
  }
}

/**
 * PUT /api/interviews/[id]
 * Update an interview
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const interview = await findById('interviews', id);

    if (!interview) {
      return notFoundResponse('Interview not found');
    }

    const updatedInterview = await updateById('interviews', id, body);

    return successResponse({ data: updatedInterview });
  } catch (error: any) {
    console.error('Error in PUT /api/interviews/[id]:', error);
    return serverErrorResponse('Failed to update interview', error);
  }
}
