import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { requireAuth } from '@/lib/authorize';

/**
 * POST /api/clearance-items/bulk
 * Bulk update clearance items for multiple exit requests
 * Auth: SUPERINTENDENT, TRUSTEE
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT', 'TRUSTEE']);
    const body = await request.json();
    const { requestIds, action } = body;

    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return badRequestResponse('requestIds must be a non-empty array');
    }

    if (!action) {
      return badRequestResponse('action is required');
    }

    const validActions = ['APPROVE_ALL', 'CLEAR_ALL', 'RESET_ALL'];
    if (!validActions.includes(action)) {
      return badRequestResponse(`action must be one of: ${validActions.join(', ')}`);
    }

    const statusMap: Record<string, string> = {
      APPROVE_ALL: 'COMPLETED',
      CLEAR_ALL: 'COMPLETED',
      RESET_ALL: 'PENDING',
    };

    const newStatus = statusMap[action];
    let updatedCount = 0;

    for (const requestId of requestIds) {
      const { rowCount } = await query(
        `UPDATE exit_clearance_items
         SET status = $1, verified_by = $2, verified_at = NOW()
         WHERE exit_request_id = $3`,
        [newStatus, user.id, requestId]
      );
      updatedCount += rowCount ?? 0;

      // Update the exit request clearance_status if all items completed
      if (newStatus === 'COMPLETED') {
        const { rows: pendingItems } = await query(
          `SELECT id FROM exit_clearance_items
           WHERE exit_request_id = $1 AND status != 'COMPLETED'`,
          [requestId]
        );

        if (pendingItems.length === 0) {
          await query(
            `UPDATE exit_requests SET clearance_status = 'CLEARED', updated_at = NOW() WHERE id = $1`,
            [requestId]
          );
        }
      }
    }

    // Log the bulk action
    await query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'CLEARANCE_BULK',
        requestIds[0],
        'BULK_UPDATE',
        user.id,
        JSON.stringify({ requestIds, action, updatedCount }),
      ]
    );

    return successResponse(
      { updatedCount, requestIds },
      `Bulk action completed for ${requestIds.length} request(s)`
    );
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in POST /api/clearance-items/bulk:', error);
    return serverErrorResponse('Failed to execute bulk action', error);
  }
}
