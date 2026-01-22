import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
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
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const status = searchParams.get('status') as LeaveStatus | null;
    const vertical = searchParams.get('vertical');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query with joins to get student info and room
    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        student:users!student_user_id(id, full_name, email, mobile, vertical)
      `, { count: 'exact' });

    if (studentId) {
      query = query.eq('student_user_id', studentId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: leaves, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error:', error);
      return serverErrorResponse('Failed to fetch leaves', error);
    }

    // Get room allocations for all students in the leave requests
    const studentIds = leaves?.map(l => l.student_user_id).filter(Boolean) || [];
    let roomMap: Record<string, string> = {};

    if (studentIds.length > 0) {
      const { data: allocations } = await supabase
        .from('room_allocations')
        .select('student_user_id, rooms(room_number)')
        .in('student_user_id', studentIds)
        .eq('status', 'ACTIVE');

      if (allocations) {
        for (const alloc of allocations) {
          const roomNumber = (alloc.rooms as any)?.room_number;
          if (roomNumber) {
            roomMap[alloc.student_user_id] = `Room ${roomNumber}`;
          }
        }
      }
    }

    // Map leave type from database to frontend format
    const leaveTypeMap: Record<string, string> = {
      'SHORT_LEAVE': 'short',
      'NIGHT_OUT': 'night-out',
      'HOME_VISIT': 'multi-day',
      'MEDICAL': 'multi-day',
      'EMERGENCY': 'multi-day',
    };

    // Transform data to match frontend expectations
    const transformedLeaves = leaves?.map(leave => ({
      id: leave.id,
      studentId: leave.student_user_id,
      studentName: (leave.student as any)?.full_name || 'Unknown',
      studentRoom: roomMap[leave.student_user_id] || 'Not Allocated',
      vertical: (leave.student as any)?.vertical || 'BOYS_HOSTEL',
      leaveType: leaveTypeMap[leave.type] || 'short',
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
      parentContacted: leave.parent_notified || false,
    })) || [];

    const total = count || 0;

    return successResponse(transformedLeaves);
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
    const supabase = createServerClient();
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
    const { data: newLeave, error: insertError } = await supabase
      .from('leave_requests')
      .insert({
        student_user_id: student_id,
        type,
        start_time,
        end_time,
        reason,
        status: 'PENDING',
        parent_notified: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return serverErrorResponse('Failed to create leave request', insertError);
    }

    // Log leave creation in audit_logs
    await supabase.from('audit_logs').insert({
      entity_type: 'LEAVE_REQUEST',
      entity_id: newLeave.id,
      action: 'CREATE',
      actor_id: student_id,
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
