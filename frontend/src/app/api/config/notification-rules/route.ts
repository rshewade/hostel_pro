import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api/responses';
import { requireAuth } from '@/lib/authorize';

// DB columns: id, event_type, recipient_type, channels (jsonb), enabled,
//             vertical (enum | null = all), timing, template, created_at, updated_at
const transformFromDb = (rule: any) => ({
  id: rule.id,
  eventType: rule.event_type,
  timing: rule.timing || 'IMMEDIATE',
  channels: rule.channels || { sms: true, whatsapp: true, email: false },
  vertical: rule.vertical || null, // null = all verticals
  template: rule.template || '',
  active: rule.enabled,
});

/**
 * GET /api/config/notification-rules
 * Auth: any authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const eventType = searchParams.get('eventType');

    let sql = 'SELECT * FROM notification_rules WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (activeOnly) {
      sql += ` AND enabled = $${paramIndex++}`;
      params.push(true);
    }
    if (eventType) {
      sql += ` AND event_type = $${paramIndex++}`;
      params.push(eventType);
    }

    sql += ' ORDER BY event_type';

    const { rows } = await query(sql, params);
    return successResponse((rows || []).map(transformFromDb));
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/config/notification-rules:', error);
    return serverErrorResponse('Failed to fetch notification rules', error);
  }
}

/**
 * POST /api/config/notification-rules
 * Auth: SUPERINTENDENT only
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request, ['SUPERINTENDENT']);
    const body = await request.json();

    const { eventType, timing, channels, vertical, template, active } = body;

    if (!eventType) return badRequestResponse('Event type is required');
    if (!template || template.trim() === '') return badRequestResponse('Message template is required');

    const { rows } = await query(
      `INSERT INTO notification_rules (event_type, recipient_type, timing, channels, vertical, template, enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        eventType,
        'STUDENT',
        timing || 'IMMEDIATE',
        JSON.stringify(channels || { sms: true, whatsapp: true, email: false }),
        vertical || null,
        template.trim(),
        active ?? true,
      ]
    );

    if (rows.length === 0) return serverErrorResponse('Failed to create notification rule');
    return createdResponse(transformFromDb(rows[0]), 'Notification rule created successfully');
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in POST /api/config/notification-rules:', error);
    return serverErrorResponse('Failed to create notification rule', error);
  }
}

/**
 * PUT /api/config/notification-rules
 * Auth: SUPERINTENDENT only
 */
export async function PUT(request: NextRequest) {
  try {
    await requireAuth(request, ['SUPERINTENDENT']);
    const body = await request.json();

    const { id, eventType, timing, channels, vertical, template, active } = body;

    if (!id) return badRequestResponse('ID is required');

    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (eventType !== undefined) {
      setClauses.push(`event_type = $${paramIndex++}`);
      params.push(eventType);
    }
    if (timing !== undefined) {
      setClauses.push(`timing = $${paramIndex++}`);
      params.push(timing);
    }
    if (channels !== undefined) {
      setClauses.push(`channels = $${paramIndex++}`);
      params.push(JSON.stringify(channels));
    }
    if (vertical !== undefined) {
      setClauses.push(`vertical = $${paramIndex++}`);
      params.push(vertical); // null = all verticals
    }
    if (template !== undefined) {
      setClauses.push(`template = $${paramIndex++}`);
      params.push(template.trim());
    }
    if (active !== undefined) {
      setClauses.push(`enabled = $${paramIndex++}`);
      params.push(active);
    }

    if (setClauses.length === 0) return badRequestResponse('No fields to update');

    params.push(id);
    const sql = `UPDATE notification_rules SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;

    const { rows } = await query(sql, params);
    if (rows.length === 0) return notFoundResponse('Notification rule not found');

    return successResponse(transformFromDb(rows[0]));
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in PUT /api/config/notification-rules:', error);
    return serverErrorResponse('Failed to update notification rule', error);
  }
}

/**
 * DELETE /api/config/notification-rules
 * Auth: SUPERINTENDENT only
 */
export async function DELETE(request: NextRequest) {
  try {
    await requireAuth(request, ['SUPERINTENDENT']);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return badRequestResponse('ID is required');

    await query('DELETE FROM notification_rules WHERE id = $1', [id]);
    return successResponse({ message: 'Notification rule deleted successfully' });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in DELETE /api/config/notification-rules:', error);
    return serverErrorResponse('Failed to delete notification rule', error);
  }
}
