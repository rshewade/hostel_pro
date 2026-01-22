import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api/responses';

/**
 * GET /api/config/notification-rules
 * List all notification rules
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const eventType = searchParams.get('eventType');

    let query = supabase
      .from('notification_rules')
      .select('*')
      .order('event_type');

    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data: rules, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return serverErrorResponse('Failed to fetch notification rules', error);
    }

    // Transform to frontend format
    const transformed = rules?.map(rule => ({
      id: rule.id,
      eventType: rule.event_type,
      timing: rule.timing,
      channels: rule.channels || { sms: true, whatsapp: true, email: false },
      verticals: rule.verticals || [],
      template: rule.template || '',
      active: rule.is_active,
    })) || [];

    return successResponse(transformed);
  } catch (error: any) {
    console.error('Error in GET /api/config/notification-rules:', error);
    return serverErrorResponse('Failed to fetch notification rules', error);
  }
}

/**
 * POST /api/config/notification-rules
 * Create a new notification rule
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const { eventType, timing, channels, verticals, template, active } = body;

    if (!eventType) {
      return badRequestResponse('Event type is required');
    }
    if (!template || template.trim() === '') {
      return badRequestResponse('Message template is required');
    }

    const { data: newRule, error } = await supabase
      .from('notification_rules')
      .insert({
        event_type: eventType,
        timing: timing || 'IMMEDIATE',
        channels: channels || { sms: true, whatsapp: true, email: false },
        verticals: verticals || ['BOYS', 'GIRLS', 'DHARAMSHALA'],
        template: template.trim(),
        is_active: active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return serverErrorResponse('Failed to create notification rule', error);
    }

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
    console.error('Error in POST /api/config/notification-rules:', error);
    return serverErrorResponse('Failed to create notification rule', error);
  }
}

/**
 * PUT /api/config/notification-rules
 * Update a notification rule
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const { id, eventType, timing, channels, verticals, template, active } = body;

    if (!id) {
      return badRequestResponse('ID is required');
    }

    const updateData: Record<string, any> = {};
    if (eventType !== undefined) updateData.event_type = eventType;
    if (timing !== undefined) updateData.timing = timing;
    if (channels !== undefined) updateData.channels = channels;
    if (verticals !== undefined) updateData.verticals = verticals;
    if (template !== undefined) updateData.template = template.trim();
    if (active !== undefined) updateData.is_active = active;

    const { data: updatedRule, error } = await supabase
      .from('notification_rules')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      if (error.code === 'PGRST116') {
        return notFoundResponse('Notification rule not found');
      }
      return serverErrorResponse('Failed to update notification rule', error);
    }

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
    console.error('Error in PUT /api/config/notification-rules:', error);
    return serverErrorResponse('Failed to update notification rule', error);
  }
}

/**
 * DELETE /api/config/notification-rules
 * Delete a notification rule
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return badRequestResponse('ID is required');
    }

    const { error } = await supabase
      .from('notification_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return serverErrorResponse('Failed to delete notification rule', error);
    }

    return successResponse({ message: 'Notification rule deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/config/notification-rules:', error);
    return serverErrorResponse('Failed to delete notification rule', error);
  }
}
