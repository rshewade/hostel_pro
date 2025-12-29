import { NextRequest } from 'next/server';
import { findById, updateById, insert } from '@/lib/api/db';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
  validateFields,
} from '@/lib/api/responses';
import { LeaveAPI, LeaveStatus } from '@/types/api';

/**
 * PUT /api/leaves/[id]/reject
 * Reject a leave request with reason
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const leave = await findById('leaves', id);

    if (!leave) {
      return notFoundResponse('Leave request not found');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      return badRequestResponse(
        `Leave request has already been ${leave.status.toLowerCase()}`
      );
    }

    // Update leave status
    const updatedLeave = await updateById('leaves', id, {
      status: LeaveStatus.REJECTED,
      rejection_reason: reason,
      parent_notified_at: new Date().toISOString(),
    });

    if (!updatedLeave) {
      return serverErrorResponse('Failed to update leave status');
    }

    // Log rejection
    await insert('auditLogs', {
      id: `audit${Date.now()}`,
      entity_type: 'LEAVE',
      entity_id: id,
      action: 'REJECT',
      old_value: LeaveStatus.PENDING,
      new_value: LeaveStatus.REJECTED,
      performed_by: null, // Should be superintendent/admin ID
      performed_at: new Date().toISOString(),
      metadata: {
        student_id: leave.student_id,
        leave_type: leave.type,
        rejection_reason: reason,
      },
    });

    console.log('\n========================================');
    console.log('❌ LEAVE REJECTED');
    console.log('========================================');
    console.log('Leave ID:', id);
    console.log('Student ID:', leave.student_id);
    console.log('Reason:', reason);
    console.log('========================================\n');

    return successResponse({ data: updatedLeave });
  } catch (error: any) {
    console.error('Error in PUT /api/leaves/[id]/reject:', error);
    return serverErrorResponse('Failed to reject leave', error);
  }
}
