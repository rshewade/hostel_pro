import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';

/**
 * GET /api/communications
 * List communication logs (SMS, WhatsApp, Email notifications sent)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Try to fetch from communications table
    let query = supabase
      .from('communications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (channel) {
      query = query.eq('channel', channel.toUpperCase());
    }
    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    const { data: logs, error } = await query;

    if (error) {
      // Table might not exist yet - return empty array
      if (error.code === '42P01' || error.code === 'PGRST205') {
        console.log('communications table does not exist yet');
        return successResponse([]);
      }
      console.error('Supabase error:', error);
      // Return empty array instead of error to prevent page crash
      return successResponse([]);
    }

    return successResponse(logs || []);
  } catch (error: any) {
    console.error('Error in GET /api/communications:', error);
    // Return empty array instead of error for missing table
    return successResponse([]);
  }
}
