import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { ApplicationAPI, ApplicationStatus } from '@/types/api';

/**
 * POST /api/applications/[id]/submit
 * Submit an application for review
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;

    // Get application
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !application) {
      return notFoundResponse('Application not found');
    }

    // Check if application is in DRAFT status
    if (application.current_status !== 'DRAFT') {
      return badRequestResponse(
        `Application has already been submitted (Status: ${application.current_status})`
      );
    }

    // Validate required fields
    const validation = validateApplicationData(application.data);
    if (!validation.isValid) {
      return badRequestResponse('Application is incomplete', {
        missing_fields: validation.missingFields,
      });
    }

    // Update status to SUBMITTED
    const { data: updatedApplication, error: updateError } = await supabase
      .from('applications')
      .update({
        current_status: 'SUBMITTED',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return serverErrorResponse('Failed to update application status', updateError);
    }

    // Log submission
    await supabase.from('audit_logs').insert({
      entity_type: 'APPLICATION',
      entity_id: id,
      action: 'SUBMIT',
      actor_id: application.student_user_id,
      metadata: {
        tracking_number: application.tracking_number,
        vertical: application.vertical,
        applicant_mobile: application.applicant_mobile,
        old_status: ApplicationStatus.DRAFT,
        new_status: ApplicationStatus.SUBMITTED,
      },
    });

    console.log('\n========================================');
    console.log('📝 APPLICATION SUBMITTED');
    console.log('========================================');
    console.log('Application ID:', id);
    console.log('Tracking Number:', application.tracking_number);
    console.log('Vertical:', application.vertical);
    console.log('Submitted At:', updatedApplication?.submitted_at);
    console.log('========================================\n');

    return successResponse({
      data: updatedApplication,
      message: `Application ${application.tracking_number} submitted successfully. You will be notified about the next steps.`,
    } as ApplicationAPI.SubmitResponse);
  } catch (error: any) {
    console.error('Error in POST /api/applications/[id]/submit:', error);
    return serverErrorResponse('Failed to submit application', error);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate application data completeness
 */
function validateApplicationData(data: any): {
  isValid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];

  // Check required fields based on application type
  if (!data?.personal_info?.full_name) {
    missingFields.push('personal_info.full_name');
  }

  if (!data?.personal_info?.age) {
    missingFields.push('personal_info.age');
  }

  if (!data?.personal_info?.native_place) {
    missingFields.push('personal_info.native_place');
  }

  if (!data?.guardian_info?.father_name) {
    missingFields.push('guardian_info.father_name');
  }

  // For students (not dharamshala), require education details
  if (data?.education) {
    if (!data.education.institution) {
      missingFields.push('education.institution');
    }
    if (!data.education.course) {
      missingFields.push('education.course');
    }
  }

  // For dharamshala, require stay duration
  if (data?.stay_duration) {
    if (!data.stay_duration.from || !data.stay_duration.to) {
      missingFields.push('stay_duration');
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}
