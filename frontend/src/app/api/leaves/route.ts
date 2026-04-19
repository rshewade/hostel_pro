import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  serverErrorResponse,
  validateFields,
} from '@/lib/api/responses';
import { LeaveAPI, LeaveStatus } from '@/types/api';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/leaves
 * List all leave requests with optional filtering
 * Auth: STUDENT (own leaves) or SUPERINTENDENT (all)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['STUDENT', 'SUPERINTENDENT']);
    const { searchParams } = new URL(request.url);
    // If student, force own ID; superintendent can query any
    const studentId = user.role === 'STUDENT' ? user.id : searchParams.get('student_id');
    const status = searchParams.get('status') as LeaveStatus | null;
    const vertical = searchParams.get('vertical');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (studentId) {
      conditions.push(`lr.student_id = $${paramIndex++}`);
      params.push(studentId);
    }
    if (status) {
      conditions.push(`lr.status = $${paramIndex++}`);
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Query leaves with student info
    params.push(limit);
    const limitParam = paramIndex++;
    params.push(offset);
    const offsetParam = paramIndex++;

    const { rows: leaves } = await query(
      `SELECT lr.*,
              json_build_object('id', u.id, 'full_name', u.full_name, 'email', u.email, 'mobile', u.mobile, 'vertical', u.vertical) AS student
       FROM leave_requests lr
       LEFT JOIN users u ON u.id = lr.student_id
       ${whereClause}
       ORDER BY lr.created_at DESC
       LIMIT $${limitParam} OFFSET $${offsetParam}`,
      params
    );

    // Get total count
    const countParams = params.slice(0, params.length - 2); // exclude limit/offset
    const { rows: countRows } = await query(
      `SELECT COUNT(*) AS total FROM leave_requests lr ${whereClause}`,
      countParams
    );
    const total = parseInt(countRows[0]?.total || '0');

    // Get room allocations for all students in the leave requests
    const studentIds = leaves.map((l: any) => l.student_id).filter(Boolean);
    let roomMap: Record<string, string> = {};

    if (studentIds.length > 0) {
      const placeholders = studentIds.map((_: any, i: number) => `$${i + 1}`).join(', ');
      const { rows: allocations } = await query(
        `SELECT ra.student_id, r.room_number
         FROM room_allocations ra
         LEFT JOIN rooms r ON r.id = ra.room_id
         WHERE ra.student_id IN (${placeholders}) AND ra.status = $${studentIds.length + 1}`,
        [...studentIds, 'ACTIVE']
      );

      for (const alloc of allocations) {
        if (alloc.room_number) {
          roomMap[alloc.student_id] = `Room ${alloc.room_number}`;
        }
      }
    }

    // Map leave type from database enum to frontend display category
    const leaveTypeCategoryMap: Record<string, string> = {
      'SHORT_LEAVE': 'short',
      'NIGHT_OUT': 'night-out',
      'MULTI_DAY': 'multi-day',
      'HOME_VISIT': 'multi-day',
      'MEDICAL': 'multi-day',
      'EMERGENCY': 'multi-day',
      'EXTENDED': 'multi-day',
    };

    // Friendly labels for the original DB enum values
    const leaveTypeLabelMap: Record<string, string> = {
      'SHORT_LEAVE': 'Short Leave',
      'NIGHT_OUT': 'Night Out',
      'MULTI_DAY': 'Multi-Day',
      'HOME_VISIT': 'Home Visit',
      'MEDICAL': 'Medical Leave',
      'EMERGENCY': 'Emergency',
      'EXTENDED': 'Extended Leave',
    };

    // Transform data to match frontend expectations
    const transformedLeaves = leaves.map((leave: any) => ({
      id: leave.id,
      studentId: leave.student_id,
      studentName: leave.student?.full_name || 'Unknown',
      studentRoom: roomMap[leave.student_id] || 'Not Allocated',
      vertical: leave.student?.vertical || 'BOYS_HOSTEL',
      leaveType: leaveTypeCategoryMap[leave.leave_type] || 'short',
      leaveTypeOriginal: leave.leave_type,
      leaveTypeLabel: leaveTypeLabelMap[leave.leave_type] || leave.leave_type,
      fromDate: leave.start_time?.split('T')[0] || '',
      toDate: leave.end_time?.split('T')[0] || '',
      fromTime: leave.start_time?.split('T')[1]?.substring(0, 5) || '',
      toTime: leave.end_time?.split('T')[1]?.substring(0, 5) || '',
      reason: leave.reason || '',
      destination: leave.destination || '',
      contactNumber: leave.emergency_contact || '',
      status: leave.status,
      appliedDate: leave.created_at?.split('T')[0] || '',
      remarks: leave.rejection_reason || '',
      approvedBy: leave.approved_by || '',
      approvedAt: leave.approved_at || '',
      parentContacted: !!leave.parent_notified_at,
    }));

    return successResponse(transformedLeaves);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/leaves:', error);
    return serverErrorResponse('Failed to fetch leaves', error);
  }
}

/**
 * POST /api/leaves
 * Apply for a new leave
 * Auth: STUDENT only
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['STUDENT']);
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
    const { rows: insertRows } = await query(
      `INSERT INTO leave_requests (student_id, leave_type, start_time, end_time, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [student_id, type, start_time, end_time, reason, 'PENDING']
    );

    if (insertRows.length === 0) {
      return serverErrorResponse('Failed to create leave request');
    }

    const newLeave = insertRows[0];

    // Log leave creation in audit_logs
    await query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, actor_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'LEAVE_REQUEST',
        newLeave.id,
        'CREATE',
        student_id,
        JSON.stringify({
          type,
          duration: `${start_time} to ${end_time}`,
        }),
      ]
    );

    return createdResponse(
      { data: newLeave } as LeaveAPI.CreateResponse,
      'Leave request submitted successfully'
    );
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in POST /api/leaves:', error);
    return serverErrorResponse('Failed to create leave request', error);
  }
}
