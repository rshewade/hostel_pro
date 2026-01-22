import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { LeaveStatus } from '@/types/api';

/**
 * PUT /api/leaves/[id]/approve
 * Approve a leave request
 */
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;

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
        status: 'APPROVED',
        approved_at: new Date().toISOString(),
        parent_notified: true,
        parent_notified_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return serverErrorResponse('Failed to approve leave', updateError);
    }

    // Log approval
    await supabase.from('audit_logs').insert({
      entity_type: 'LEAVE_REQUEST',
      entity_id: id,
      action: 'APPROVE',
      metadata: {
        student_id: leave.student_user_id,
        leave_type: leave.type,
        old_status: 'PENDING',
        new_status: 'APPROVED',
      },
    });

    console.log('\n========================================');
    console.log('✅ LEAVE APPROVED');
    console.log('========================================');
    console.log('Leave ID:', id);
    console.log('Student ID:', leave.student_user_id);
    console.log('Type:', leave.type);
    console.log('Parent Notified:', true);
    console.log('========================================\n');

    return successResponse({ data: updatedLeave });
  } catch (error: any) {
    console.error('Error in PUT /api/leaves/[id]/approve:', error);
    return serverErrorResponse('Failed to approve leave', error);
  }
}
