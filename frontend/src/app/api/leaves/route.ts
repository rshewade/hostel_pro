import { NextRequest } from 'next/server';
import { find, insert, generateId } from '@/lib/api/db';
import { paginate } from '@/lib/api/db';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  serverErrorResponse,
  validateFields,
} from '@/lib/api/responses';
import { LeaveAPI, LeaveStatus } from '@/types/api';

/**
 * GET /api/leaves
 * List all leave requests with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const status = searchParams.get('status') as LeaveStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let leaves = await find('leaves', (leave: any) => {
      const matchesStudent = !studentId || leave.student_id === studentId;
      const matchesStatus = !status || leave.status === status;

      return matchesStudent && matchesStatus;
    });

    // Sort by creation date (descending)
    leaves.sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Paginate
    const paginatedResult = paginate(leaves, page, limit);

    return successResponse({
      success: true,
      data: paginatedResult.data,
      pagination: paginatedResult.pagination,
    } as LeaveAPI.ListResponse);
  } catch (error: any) {
    console.error('Error in GET /api/leaves:', error);
    return serverErrorResponse('Failed to fetch leaves', error);
  }
}

/**
 * POST /api/leaves
 * Apply for a new leave
 */
export async function POST(request: NextRequest) {
  try {
    const body: LeaveAPI.CreateRequest = await request.json();
    const { student_id, type, start_time, end_time, reason } = body;

    // Validate input
    const validation = validateFields([
      {
        field: 'student_id',
        value: student_id,
        rules: [{ type: 'required', message: 'Student ID is required' }],
      },
      {
        field: 'type',
        value: type,
        rules: [{ type: 'required', message: 'Leave type is required' }],
      },
      {
        field: 'start_time',
        value: start_time,
        rules: [{ type: 'required', message: 'Start time is required' }],
      },
      {
        field: 'end_time',
        value: end_time,
        rules: [{ type: 'required', message: 'End time is required' }],
      },
      {
        field: 'reason',
        value: reason,
        rules: [
          { type: 'required', message: 'Reason is required' },
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

    // Validate dates
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);

    if (endDate <= startDate) {
      return badRequestResponse('End time must be after start time');
    }

    // Create leave request
    const newLeave = {
      id: generateId('leave'),
      student_id,
      type,
      start_time,
      end_time,
      reason,
      status: LeaveStatus.PENDING,
      parent_notified_at: null,
      created_at: new Date().toISOString(),
    };

    await insert('leaves', newLeave);

    // Log leave creation
    await insert('auditLogs', {
      id: `audit${Date.now()}`,
      entity_type: 'LEAVE',
      entity_id: newLeave.id,
      action: 'CREATE',
      old_value: null,
      new_value: LeaveStatus.PENDING,
      performed_by: student_id,
      performed_at: new Date().toISOString(),
      metadata: {
        type,
        duration: `${start_time} to ${end_time}`,
      },
    });

    console.log('\n========================================');
    console.log('📝 LEAVE REQUEST SUBMITTED');
    console.log('========================================');
    console.log('Leave ID:', newLeave.id);
    console.log('Student ID:', student_id);
    console.log('Type:', type);
    console.log('Duration:', `${start_time} to ${end_time}`);
    console.log('========================================\n');

    return createdResponse(
      { data: newLeave } as LeaveAPI.CreateResponse,
      'Leave request submitted successfully'
    );
  } catch (error: any) {
    console.error('Error in POST /api/leaves:', error);
    return serverErrorResponse('Failed to create leave request', error);
  }
}
