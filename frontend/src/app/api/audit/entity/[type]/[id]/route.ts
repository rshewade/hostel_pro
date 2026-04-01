import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/audit/entity/[type]/[id]
 * Get audit logs for a specific entity
 * Auth: SUPERINTENDENT, TRUSTEE, ACCOUNTS (staff only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS']);
    const { type, id } = await params;

    // Query audit logs for the entity
    const { rows: logs } = await query(
      'SELECT * FROM audit_logs WHERE entity_type = $1 AND entity_id = $2 ORDER BY performed_at DESC',
      [type.toUpperCase(), id]
    );

    return successResponse({
      success: true,
      data: logs || [],
      entity: {
        type: type.toUpperCase(),
        id,
      },
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/audit/entity/[type]/[id]:', error);
    return serverErrorResponse('Failed to fetch entity audit logs', error);
  }
}
