import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/communications
 * List communication logs (SMS, WhatsApp, Email notifications sent)
 * Auth: SUPERINTENDENT, TRUSTEE, ACCOUNTS (staff only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS']);
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (channel) {
      conditions.push(`channel = $${paramIndex++}`);
      params.push(channel.toUpperCase());
    }
    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status.toUpperCase());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    params.push(limit);
    const sql = `SELECT * FROM communications ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex}`;

    const { rows: logs } = await query(sql, params);

    return successResponse(logs || []);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/communications:', error);
    // Return empty array instead of error for missing table
    return successResponse([]);
  }
}
