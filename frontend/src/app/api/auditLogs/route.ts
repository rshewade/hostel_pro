import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/auditLogs
 * List audit logs for compliance and tracking
 * Auth: SUPERINTENDENT, TRUSTEE
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT', 'TRUSTEE']);
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entity_type');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '100');

    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (entityType) {
      sql += ` AND entity_type = $${paramIndex++}`;
      params.push(entityType.toUpperCase());
    }
    if (action) {
      sql += ` AND action = $${paramIndex++}`;
      params.push(action.toUpperCase());
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const { rows: logs } = await query(sql, params);

    // Transform to expected format
    const transformedLogs = (logs || []).map((log: any) => ({
      id: log.id,
      timestamp: log.created_at,
      date_time: log.created_at,
      user: log.user_id || 'System',
      user_id: log.user_id,
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      details: log.metadata || {},
      ip_address: log.ip_address,
      user_agent: log.user_agent,
    }));

    return successResponse(transformedLogs);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/auditLogs:', error);
    // Return empty array instead of error for missing table
    return successResponse([]);
  }
}
