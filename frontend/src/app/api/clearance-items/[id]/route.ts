import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { requireAuth } from '@/lib/authorize';

/**
 * PATCH /api/clearance-items/[id]
 * Update a clearance item status
 * Auth: SUPERINTENDENT, TRUSTEE
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT', 'TRUSTEE']);
    const { id } = await params;
    const body = await request.json();
    const { status, remarks } = body;

    if (!status) {
      return badRequestResponse('Status is required');
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'WAIVED'];
    if (!validStatuses.includes(status)) {
      return badRequestResponse(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    // Update the clearance item
    const { rows } = await query(
      `UPDATE exit_clearance_items
       SET status = $1, remarks = $2, verified_by = $3, verified_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, remarks || null, user.id, id]
    );

    if (rows.length === 0) {
      return badRequestResponse('Clearance item not found');
    }

    // Log the update
    await query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'CLEARANCE_ITEM',
        id,
        'STATUS_UPDATE',
        user.id,
        JSON.stringify({ status, remarks }),
      ]
    );

    return successResponse(rows[0], 'Clearance item updated');
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in PATCH /api/clearance-items/[id]:', error);
    return serverErrorResponse('Failed to update clearance item', error);
  }
}
