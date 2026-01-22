import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import type { ApplicationAPI } from '@/types/api';

/**
 * GET /api/applications/[id]
 * Get a single application by ID
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
      return notFoundResponse('Application not found');
    }

    return successResponse({ data: application } as ApplicationAPI.GetResponse);
  } catch (error: any) {
    console.error('Error in GET /api/applications/[id]:', error);
    return serverErrorResponse('Failed to fetch application', error);
  }
}

/**
 * PUT /api/applications/[id]
 * Update an application
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    const body = await request.json() as any;

    // Get existing application
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !application) {
      return notFoundResponse('Application not found');
    }

    // Only allow updates if application is in DRAFT status (for data changes)
    if (application.current_status !== 'DRAFT' && body.data) {
      return badRequestResponse(
        'Cannot modify application data after submission. Only status updates are allowed.'
      );
    }

    // Build update object with only valid database columns
    const updateData: Record<string, any> = {};

    // Map status fields (frontend may send 'status' or 'current_status')
    const newStatus = body.current_status || body.status;
    if (newStatus) {
      updateData.current_status = newStatus;

      // Set appropriate timestamp fields based on status transition
      const now = new Date().toISOString();
      switch (newStatus) {
        case 'SUBMITTED':
          if (!application.submitted_at) {
            updateData.submitted_at = now;
          }
          break;
        case 'REVIEW':
          if (!application.reviewed_at) {
            updateData.reviewed_at = now;
          }
          break;
        case 'APPROVED':
          updateData.approved_at = now;
          // approved_by should be set from the authenticated user, but we don't have that context here
          // For now, store in metadata
          break;
        case 'REJECTED':
          updateData.rejected_at = now;
          if (body.remarks) {
            updateData.rejection_reason = body.remarks;
          }
          break;
      }
    }

    // Map other valid columns
    if (body.data !== undefined) updateData.data = body.data;
    if (body.applicant_name !== undefined) updateData.applicant_name = body.applicant_name;
    if (body.applicant_mobile !== undefined) updateData.applicant_mobile = body.applicant_mobile;
    if (body.applicant_email !== undefined) updateData.applicant_email = body.applicant_email;
    if (body.vertical !== undefined) updateData.vertical = body.vertical;
    if (body.interview_scheduled_at !== undefined) updateData.interview_scheduled_at = body.interview_scheduled_at;
    if (body.interview_completed_at !== undefined) updateData.interview_completed_at = body.interview_completed_at;
    if (body.student_user_id !== undefined) updateData.student_user_id = body.student_user_id;

    // Store remarks in the data JSON if provided (for all status changes)
    if (body.remarks) {
      updateData.data = {
        ...(application.data || {}),
        status_remarks: body.remarks,
        last_status_update: new Date().toISOString(),
      };
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return badRequestResponse('No valid fields to update');
    }

    console.log('Updating application:', id, 'with data:', JSON.stringify(updateData, null, 2));

    // Update application
    const { data: updatedApplication, error: updateError } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return serverErrorResponse('Failed to update application', updateError);
    }

    // Log status change if status was updated
    if (updateData.current_status && updateData.current_status !== application.current_status) {
      try {
        await supabase.from('audit_logs').insert({
          entity_type: 'APPLICATION',
          entity_id: id,
          action: 'STATUS_CHANGE',
          actor_id: application.student_user_id || null, // Can be NULL for new applications
          metadata: {
            tracking_number: application.tracking_number,
            old_status: application.current_status,
            new_status: updateData.current_status,
            remarks: body.remarks || null,
          },
        });
      } catch (auditError) {
        // Log audit error but don't fail the request
        console.error('Failed to create audit log:', auditError);
      }
    }

    // Create student user when application is approved
    if (updateData.current_status === 'APPROVED' && !application.student_user_id) {
      try {
        // Extract parent mobile from application data
        const parentMobile = application.data?.guardian_info?.father_mobile ||
                            application.data?.guardian_info?.mother_mobile ||
                            application.data?.emergency_contact?.mobile || null;

        // Create new student user
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            role: 'STUDENT',
            vertical: application.vertical,
            full_name: application.applicant_name,
            email: application.applicant_email,
            mobile: application.applicant_mobile,
            date_of_birth: application.date_of_birth,
            parent_mobile: parentMobile,
            is_active: true,
            requires_password_change: true, // First login should prompt password setup
            metadata: {
              application_id: id,
              tracking_number: application.tracking_number,
              approved_at: new Date().toISOString(),
            },
          })
          .select()
          .single();

        if (userError) {
          console.error('Failed to create student user:', userError);
        } else if (newUser) {
          // Link the new user to the application
          await supabase
            .from('applications')
            .update({ student_user_id: newUser.id })
            .eq('id', id);

          // Log user creation
          await supabase.from('audit_logs').insert({
            entity_type: 'USER',
            entity_id: newUser.id,
            action: 'CREATE',
            metadata: {
              application_id: id,
              tracking_number: application.tracking_number,
              reason: 'Application approved - student account created',
            },
          });

          console.log('========================================');
          console.log('✅ STUDENT USER CREATED');
          console.log('========================================');
          console.log('User ID:', newUser.id);
          console.log('Name:', newUser.full_name);
          console.log('Email:', newUser.email);
          console.log('Mobile:', newUser.mobile);
          console.log('Application:', application.tracking_number);
          console.log('========================================');

          // Update the response with the new user info
          (updatedApplication as any).student_user_id = newUser.id;
          (updatedApplication as any).student_user = newUser;
        }
      } catch (userCreationError) {
        console.error('Error creating student user:', userCreationError);
        // Don't fail the request - approval succeeded, just user creation failed
      }
    }

    return successResponse({
      data: updatedApplication,
    } as ApplicationAPI.UpdateResponse);
  } catch (error: any) {
    console.error('Error in PUT /api/applications/[id]:', error);
    return serverErrorResponse('Failed to update application', error);
  }
}

/**
 * DELETE /api/applications/[id]
 * Delete an application (soft delete - mark as ARCHIVED)
 */
export async function DELETE(
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

    // Only allow deletion if application is in DRAFT status
    if (application.current_status !== 'DRAFT') {
      return badRequestResponse(
        'Cannot delete application after submission. Contact administration for withdrawal.'
      );
    }

    // Soft delete by marking as ARCHIVED
    await supabase
      .from('applications')
      .update({ current_status: 'ARCHIVED' })
      .eq('id', id);

    // Log deletion
    await supabase.from('audit_logs').insert({
      entity_type: 'APPLICATION',
      entity_id: id,
      action: 'DELETE',
      actor_id: application.student_user_id,
      metadata: {
        tracking_number: application.tracking_number,
        old_status: application.current_status,
        new_status: 'ARCHIVED',
      },
    });

    return successResponse({ success: true, message: 'Application deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/applications/[id]:', error);
    return serverErrorResponse('Failed to delete application', error);
  }
}
