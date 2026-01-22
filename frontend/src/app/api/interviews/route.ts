import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  serverErrorResponse,
  paginatedResponse,
  validateFields,
} from '@/lib/api/responses';
import { InterviewAPI, InterviewStatus } from '@/types/api';

/**
 * GET /api/interviews
 * List all applications with interviews (status = INTERVIEW or with interview data)
 * In Supabase, interviews are part of the applications table
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('application_id');
    const status = searchParams.get('status') as InterviewStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build query for applications with interviews
    let query = supabase
      .from('applications')
      .select('*', { count: 'exact' })
      .not('interview_scheduled_at', 'is', null);

    if (applicationId) {
      query = query.eq('id', applicationId);
    }

    if (status === 'SCHEDULED') {
      query = query.eq('current_status', 'INTERVIEW');
    } else if (status === 'COMPLETED') {
      query = query.not('interview_completed_at', 'is', null);
    }

    const { data: interviews, error, count } = await query
      .order('interview_scheduled_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error:', error);
      return serverErrorResponse('Failed to fetch interviews', error);
    }

    // Transform applications to interview format
    const formattedInterviews = (interviews || []).map((app: any) => ({
      id: app.id,
      application_id: app.id,
      schedule_time: app.interview_scheduled_at,
      completed_at: app.interview_completed_at,
      status: app.interview_completed_at ? 'COMPLETED' : 'SCHEDULED',
      application: app,
    }));

    const total = count || 0;

    return paginatedResponse(formattedInterviews, page, limit, total);
  } catch (error: any) {
    console.error('Error in GET /api/interviews:', error);
    return serverErrorResponse('Failed to fetch interviews', error);
  }
}

/**
 * POST /api/interviews
 * Schedule an interview for an application
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body: InterviewAPI.CreateRequest = await request.json();
    const { application_id, trustee_id, schedule_time, mode } = body;

    // Validate input
    const validation = validateFields([
      {
        field: 'application_id',
        value: application_id,
        rules: [{ type: 'required', message: 'Application ID is required' }],
      },
      {
        field: 'schedule_time',
        value: schedule_time,
        rules: [{ type: 'required', message: 'Schedule time is required' }],
      },
      {
        field: 'mode',
        value: mode,
        rules: [{ type: 'required', message: 'Interview mode is required' }],
      },
    ]);

    if (!validation.isValid) {
      return badRequestResponse('Validation failed', validation.errors);
    }

    // Validate application exists
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', application_id)
      .single();

    if (appError || !application) {
      return badRequestResponse('Invalid application ID');
    }

    // Validate trustee exists if provided
    if (trustee_id) {
      const { data: trustee, error: trusteeError } = await supabase
        .from('users')
        .select('id')
        .eq('id', trustee_id)
        .eq('role', 'TRUSTEE')
        .single();

      if (trusteeError || !trustee) {
        return badRequestResponse('Invalid trustee ID');
      }
    }

    // Update application with interview data
    const { data: updatedApplication, error: updateError } = await supabase
      .from('applications')
      .update({
        current_status: 'INTERVIEW',
        interview_scheduled_at: schedule_time,
        data: {
          ...application.data,
          interview: {
            trustee_id,
            mode,
            scheduled_at: schedule_time,
          },
        },
      })
      .eq('id', application_id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return serverErrorResponse('Failed to schedule interview', updateError);
    }

    // Log interview scheduling
    await supabase.from('audit_logs').insert({
      entity_type: 'APPLICATION',
      entity_id: application_id,
      action: 'INTERVIEW_SCHEDULED',
      metadata: {
        tracking_number: application.tracking_number,
        schedule_time,
        mode,
        trustee_id,
      },
    });

    console.log('\n========================================');
    console.log('📅 INTERVIEW SCHEDULED');
    console.log('========================================');
    console.log('Application ID:', application_id);
    console.log('Trustee ID:', trustee_id);
    console.log('Schedule Time:', schedule_time);
    console.log('Mode:', mode);
    console.log('========================================\n');

    return createdResponse(
      {
        data: {
          id: application_id,
          application_id,
          trustee_id,
          schedule_time,
          mode,
          status: InterviewStatus.SCHEDULED,
        },
      } as InterviewAPI.CreateResponse,
      'Interview scheduled successfully'
    );
  } catch (error: any) {
    console.error('Error in POST /api/interviews:', error);
    return serverErrorResponse('Failed to create interview', error);
  }
}
