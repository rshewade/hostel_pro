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

/**
 * GET /api/config/notification-rules
 * List all notification rules
 * Auth: any authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const eventType = searchParams.get('eventType');

    let sql = 'SELECT * FROM notification_rules WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (activeOnly) {
      sql += ` AND is_active = $${paramIndex++}`;
      params.push(true);
    }
    if (eventType) {
      sql += ` AND event_type = $${paramIndex++}`;
      params.push(eventType);
    }

    sql += ' ORDER BY event_type';

    const { rows: rules } = await query(sql, params);

    // Transform to frontend format
    const transformed = (rules || []).map((rule: any) => ({
      id: rule.id,
      eventType: rule.event_type,
      timing: rule.timing,
      channels: rule.channels || { sms: true, whatsapp: true, email: false },
      verticals: rule.verticals || [],
      template: rule.template || '',
      active: rule.is_active,
    }));

    return successResponse(transformed);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/config/notification-rules:', error);
    return serverErrorResponse('Failed to fetch notification rules', error);
  }
}

/**
 * POST /api/config/notification-rules
 * Create a new notification rule
 * Auth: SUPERINTENDENT only
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT']);
    const body = await request.json();

    const { eventType, timing, channels, verticals, template, active } = body;

    if (!eventType) {
      return badRequestResponse('Event type is required');
    }
    if (!template || template.trim() === '') {
      return badRequestResponse('Message template is required');
    }

    const { rows } = await query(
      `INSERT INTO notification_rules (event_type, timing, channels, verticals, template, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        eventType,
        timing || 'IMMEDIATE',
        JSON.stringify(channels || { sms: true, whatsapp: true, email: false }),
        JSON.stringify(verticals || ['BOYS', 'GIRLS', 'DHARAMSHALA']),
        template.trim(),
        active ?? true,
      ]
    );

    if (rows.length === 0) {
      return serverErrorResponse('Failed to create notification rule');
    }

    const newRule = rows[0];

    // Transform to frontend format
    const transformed = {
      id: newRule.id,
      eventType: newRule.event_type,
      timing: newRule.timing,
      channels: newRule.channels || { sms: true, whatsapp: true, email: false },
      verticals: newRule.verticals || [],
      template: newRule.template || '',
      active: newRule.is_active,
    };

    return createdResponse(transformed, 'Notification rule created successfully');
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in POST /api/config/notification-rules:', error);
    return serverErrorResponse('Failed to create notification rule', error);
  }
}

/**
 * PUT /api/config/notification-rules
 * Update a notification rule
 * Auth: SUPERINTENDENT only
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT']);
    const body = await request.json();

    const { id, eventType, timing, channels, verticals, template, active } = body;

    if (!id) {
      return badRequestResponse('ID is required');
    }

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
    if (verticals !== undefined) {
      setClauses.push(`verticals = $${paramIndex++}`);
      params.push(JSON.stringify(verticals));
    }
    if (template !== undefined) {
      setClauses.push(`template = $${paramIndex++}`);
      params.push(template.trim());
    }
    if (active !== undefined) {
      setClauses.push(`is_active = $${paramIndex++}`);
      params.push(active);
    }

    if (setClauses.length === 0) {
      return badRequestResponse('No fields to update');
    }

    params.push(id);
    const sql = `UPDATE notification_rules SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const { rows } = await query(sql, params);

    if (rows.length === 0) {
      return notFoundResponse('Notification rule not found');
    }

    const updatedRule = rows[0];

    // Transform to frontend format
    const transformed = {
      id: updatedRule.id,
      eventType: updatedRule.event_type,
      timing: updatedRule.timing,
      channels: updatedRule.channels || { sms: true, whatsapp: true, email: false },
      verticals: updatedRule.verticals || [],
      template: updatedRule.template || '',
      active: updatedRule.is_active,
    };

    return successResponse(transformed);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in PUT /api/config/notification-rules:', error);
    return serverErrorResponse('Failed to update notification rule', error);
  }
}

/**
 * DELETE /api/config/notification-rules
 * Delete a notification rule
 * Auth: SUPERINTENDENT only
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT']);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return badRequestResponse('ID is required');
    }

    await query('DELETE FROM notification_rules WHERE id = $1', [id]);

    return successResponse({ message: 'Notification rule deleted successfully' });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in DELETE /api/config/notification-rules:', error);
    return serverErrorResponse('Failed to delete notification rule', error);
  }
}
