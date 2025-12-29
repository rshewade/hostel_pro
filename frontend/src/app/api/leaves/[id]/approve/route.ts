import { NextRequest } from 'next/server';
import { findById, updateById, insert } from '@/lib/api/db';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { LeaveAPI, LeaveStatus } from '@/types/api';

/**
 * PUT /api/leaves/[id]/approve
 * Approve a leave request
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
      status: LeaveStatus.APPROVED,
      parent_notified_at: new Date().toISOString(),
    });

    // Log approval
    await insert('auditLogs', {
      id: `audit${Date.now()}`,
      entity_type: 'LEAVE',
      entity_id: id,
      action: 'APPROVE',
      old_value: LeaveStatus.PENDING,
      new_value: LeaveStatus.APPROVED,
      performed_by: null, // Should be superintendent/admin ID
      performed_at: new Date().toISOString(),
      metadata: {
        student_id: leave.student_id,
        leave_type: leave.type,
      },
    });

    console.log('\n========================================');
    console.log('✅ LEAVE APPROVED');
    console.log('========================================');
    console.log('Leave ID:', id);
    console.log('Student ID:', leave.student_id);
    console.log('Type:', leave.type);
    console.log('Parent Notified:', true);
    console.log('========================================\n');

    return successResponse({ data: updatedLeave });
  } catch (error: any) {
    console.error('Error in PUT /api/leaves/[id]/approve:', error);
    return serverErrorResponse('Failed to approve leave', error);
  }
}
