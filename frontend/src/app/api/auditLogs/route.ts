import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';

/**
 * GET /api/auditLogs
 * List audit logs for compliance and tracking
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entity_type');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (entityType) {
      query = query.eq('entity_type', entityType.toUpperCase());
    }
    if (action) {
      query = query.eq('action', action.toUpperCase());
    }

    const { data: logs, error } = await query;

    if (error) {
      // Table might not exist yet - return empty array
      if (error.code === '42P01') {
        console.log('audit_logs table does not exist yet');
        return successResponse([]);
      }
      console.error('Supabase error:', error);
      return serverErrorResponse('Failed to fetch audit logs', error);
    }

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
    console.error('Error in GET /api/auditLogs:', error);
    // Return empty array instead of error for missing table
    return successResponse([]);
  }
}
