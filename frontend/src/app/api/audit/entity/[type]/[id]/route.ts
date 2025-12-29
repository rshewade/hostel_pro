import { NextRequest } from 'next/server';
import { find } from '@/lib/api/db';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';

/**
 * GET /api/audit/entity/[type]/[id]
 * Get audit logs for a specific entity
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params;

    const logs = await find('auditLogs', (log: any) => {
      return log.entity_type === type.toUpperCase() && log.entity_id === id;
    });

    // Sort by timestamp (descending)
    logs.sort((a: any, b: any) => {
      return new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime();
    });

    return successResponse({
      success: true,
      data: logs,
      entity: {
        type: type.toUpperCase(),
        id,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/audit/entity/[type]/[id]:', error);
    return serverErrorResponse('Failed to fetch entity audit logs', error);
  }
}
