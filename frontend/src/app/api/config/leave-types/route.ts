import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api/responses';

/**
 * GET /api/config/leave-types
 * List all leave types
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let query = supabase
      .from('leave_types')
      .select('*')
      .order('name');

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: leaveTypes, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return serverErrorResponse('Failed to fetch leave types', error);
    }

    // Transform to frontend format
    const transformed = leaveTypes?.map(lt => ({
      id: lt.id,
      name: lt.name,
      maxDaysPerMonth: lt.max_days_per_month,
      maxDaysPerSemester: lt.max_days_per_semester,
      requiresApproval: lt.requires_approval,
      allowedVerticals: lt.allowed_verticals || [],
      active: lt.is_active,
    })) || [];

    return successResponse(transformed);
  } catch (error: any) {
    console.error('Error in GET /api/config/leave-types:', error);
    return serverErrorResponse('Failed to fetch leave types', error);
  }
}

/**
 * POST /api/config/leave-types
 * Create a new leave type
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const { name, maxDaysPerMonth, maxDaysPerSemester, requiresApproval, allowedVerticals, active } = body;

    if (!name || name.trim() === '') {
      return badRequestResponse('Name is required');
    }

    const { data: newLeaveType, error } = await supabase
      .from('leave_types')
      .insert({
        name: name.trim(),
        max_days_per_month: maxDaysPerMonth || 0,
        max_days_per_semester: maxDaysPerSemester || 0,
        requires_approval: requiresApproval ?? true,
        allowed_verticals: allowedVerticals || ['BOYS', 'GIRLS', 'DHARAMSHALA'],
        is_active: active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return serverErrorResponse('Failed to create leave type', error);
    }

    // Transform to frontend format
    const transformed = {
      id: newLeaveType.id,
      name: newLeaveType.name,
      maxDaysPerMonth: newLeaveType.max_days_per_month,
      maxDaysPerSemester: newLeaveType.max_days_per_semester,
      requiresApproval: newLeaveType.requires_approval,
      allowedVerticals: newLeaveType.allowed_verticals || [],
      active: newLeaveType.is_active,
    };

    return createdResponse(transformed, 'Leave type created successfully');
  } catch (error: any) {
    console.error('Error in POST /api/config/leave-types:', error);
    return serverErrorResponse('Failed to create leave type', error);
  }
}

/**
 * PUT /api/config/leave-types
 * Update a leave type
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    const { id, name, maxDaysPerMonth, maxDaysPerSemester, requiresApproval, allowedVerticals, active } = body;

    if (!id) {
      return badRequestResponse('ID is required');
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (maxDaysPerMonth !== undefined) updateData.max_days_per_month = maxDaysPerMonth;
    if (maxDaysPerSemester !== undefined) updateData.max_days_per_semester = maxDaysPerSemester;
    if (requiresApproval !== undefined) updateData.requires_approval = requiresApproval;
    if (allowedVerticals !== undefined) updateData.allowed_verticals = allowedVerticals;
    if (active !== undefined) updateData.is_active = active;

    const { data: updatedLeaveType, error } = await supabase
      .from('leave_types')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      if (error.code === 'PGRST116') {
        return notFoundResponse('Leave type not found');
      }
      return serverErrorResponse('Failed to update leave type', error);
    }

    // Transform to frontend format
    const transformed = {
      id: updatedLeaveType.id,
      name: updatedLeaveType.name,
      maxDaysPerMonth: updatedLeaveType.max_days_per_month,
      maxDaysPerSemester: updatedLeaveType.max_days_per_semester,
      requiresApproval: updatedLeaveType.requires_approval,
      allowedVerticals: updatedLeaveType.allowed_verticals || [],
      active: updatedLeaveType.is_active,
    };

    return successResponse(transformed);
  } catch (error: any) {
    console.error('Error in PUT /api/config/leave-types:', error);
    return serverErrorResponse('Failed to update leave type', error);
  }
}

/**
 * DELETE /api/config/leave-types
 * Delete a leave type
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return badRequestResponse('ID is required');
    }

    const { error } = await supabase
      .from('leave_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return serverErrorResponse('Failed to delete leave type', error);
    }

    return successResponse({ message: 'Leave type deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/config/leave-types:', error);
    return serverErrorResponse('Failed to delete leave type', error);
  }
}
