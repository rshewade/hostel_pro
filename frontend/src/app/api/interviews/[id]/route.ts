import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/responses';

/**
 * GET /api/interviews/[id]
 * Get interview details for an application
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;

    const { data: application, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !application) {
      return notFoundResponse('Interview not found');
    }

    // Format as interview data
    const interview = {
      id: application.id,
      application_id: application.id,
      schedule_time: application.interview_scheduled_at,
      completed_at: application.interview_completed_at,
      status: application.interview_completed_at ? 'COMPLETED' : 'SCHEDULED',
      trustee_id: application.data?.interview?.trustee_id,
      mode: application.data?.interview?.mode,
      internal_remarks: application.data?.interview?.remarks,
      final_score: application.data?.interview?.score,
      application,
    };

    return successResponse({ data: interview });
  } catch (error: any) {
    console.error('Error in GET /api/interviews/[id]:', error);
    return serverErrorResponse('Failed to fetch interview', error);
  }
}

/**
 * PUT /api/interviews/[id]
 * Update interview details
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    const body = await request.json();

    // Get existing application
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !application) {
      return notFoundResponse('Interview not found');
    }

    // Update interview data in application
    const updateData: any = {};

    if (body.schedule_time) {
      updateData.interview_scheduled_at = body.schedule_time;
    }

    // Store additional interview data in the data JSONB field
    if (body.internal_remarks || body.final_score || body.mode || body.trustee_id) {
      updateData.data = {
        ...application.data,
        interview: {
          ...application.data?.interview,
          ...(body.trustee_id && { trustee_id: body.trustee_id }),
          ...(body.mode && { mode: body.mode }),
          ...(body.internal_remarks && { remarks: body.internal_remarks }),
          ...(body.final_score !== undefined && { score: body.final_score }),
        },
      };
    }

    const { data: updatedApplication, error: updateError } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return serverErrorResponse('Failed to update interview', updateError);
    }

    // Format response as interview
    const interview = {
      id: updatedApplication.id,
      application_id: updatedApplication.id,
      schedule_time: updatedApplication.interview_scheduled_at,
      completed_at: updatedApplication.interview_completed_at,
      status: updatedApplication.interview_completed_at ? 'COMPLETED' : 'SCHEDULED',
      trustee_id: updatedApplication.data?.interview?.trustee_id,
      mode: updatedApplication.data?.interview?.mode,
      internal_remarks: updatedApplication.data?.interview?.remarks,
      final_score: updatedApplication.data?.interview?.score,
    };

    return successResponse({ data: interview });
  } catch (error: any) {
    console.error('Error in PUT /api/interviews/[id]:', error);
    return serverErrorResponse('Failed to update interview', error);
  }
}
