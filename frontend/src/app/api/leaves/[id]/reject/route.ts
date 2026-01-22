import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
  validateFields,
} from '@/lib/api/responses';
import { LeaveAPI } from '@/types/api';

/**
 * PUT /api/leaves/[id]/reject
 * Reject a leave request with reason
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    const body: LeaveAPI.RejectRequest = await request.json();
    const { reason } = body;

    // Validate rejection reason
    const validation = validateFields([
      {
        field: 'reason',
        value: reason,
        rules: [
          { type: 'required', message: 'Rejection reason is required' },
          {
            type: 'min',
            param: 10,
            message: 'Reason must be at least 10 characters',
          },
        ],
      },
    ]);

    if (!validation.isValid) {
      return badRequestResponse('Validation failed', validation.errors);
    }

    // Get leave request
    const { data: leave, error: fetchError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !leave) {
      return notFoundResponse('Leave request not found');
    }

    if (leave.status !== 'PENDING') {
      return badRequestResponse(
        `Leave request has already been ${leave.status.toLowerCase()}`
      );
    }

    // Update leave status
    const { data: updatedLeave, error: updateError } = await supabase
      .from('leave_requests')
      .update({
        status: 'REJECTED',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
        parent_notified: true,
        parent_notified_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return serverErrorResponse('Failed to reject leave', updateError);
    }

    // Log rejection
    await supabase.from('audit_logs').insert({
      entity_type: 'LEAVE_REQUEST',
      entity_id: id,
      action: 'REJECT',
      metadata: {
        student_id: leave.student_user_id,
        leave_type: leave.type,
        rejection_reason: reason,
        old_status: 'PENDING',
        new_status: 'REJECTED',
      },
    });

    console.log('\n========================================');
    console.log('❌ LEAVE REJECTED');
    console.log('========================================');
    console.log('Leave ID:', id);
    console.log('Student ID:', leave.student_user_id);
    console.log('Reason:', reason);
    console.log('========================================\n');

    return successResponse({ data: updatedLeave });
  } catch (error: any) {
    console.error('Error in PUT /api/leaves/[id]/reject:', error);
    return serverErrorResponse('Failed to reject leave', error);
  }
}
