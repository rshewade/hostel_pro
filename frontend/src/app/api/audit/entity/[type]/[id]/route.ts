import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
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
    const supabase = createServerClient();
    const { type, id } = await params;

    // Query audit logs for the entity
    const { data: logs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', type.toUpperCase())
      .eq('entity_id', id)
      .order('performed_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching audit logs:', error);
      return serverErrorResponse('Failed to fetch audit logs', error);
    }

    return successResponse({
      success: true,
      data: logs || [],
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
