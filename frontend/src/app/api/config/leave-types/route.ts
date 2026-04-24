import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  serverErrorResponse,
  notFoundResponse,
} from '@/lib/api/responses';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/config/leave-types
 * List all leave types
 * Auth: any authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    let sql = 'SELECT * FROM leave_types';
    const params: any[] = [];

    if (activeOnly) {
      sql += ' WHERE is_active = $1';
      params.push(true);
    }

    sql += ' ORDER BY name';

    const { rows: leaveTypes } = await query(sql, params);

    // Transform to frontend format
    const transformed = (leaveTypes || []).map((lt: any) => ({
      id: lt.id,
      name: lt.name,
      code: lt.code,
      maxDays: lt.max_days,
      requiresApproval: lt.requires_approval,
      parentNotification: lt.parent_notification,
      vertical: lt.vertical || null,
      active: lt.is_active,
    }));

    return successResponse(transformed);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/config/leave-types:', error);
    return serverErrorResponse('Failed to fetch leave types', error);
  }
}

/**
 * POST /api/config/leave-types
 * Create a new leave type
 * Auth: SUPERINTENDENT only
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT']);
    const body = await request.json();

    const { name, code, maxDays, requiresApproval, parentNotification, vertical, active } = body;

    if (!name || name.trim() === '') {
      return badRequestResponse('Name is required');
    }
    if (!code) {
      return badRequestResponse('Code is required');
    }

    const { rows } = await query(
      `INSERT INTO leave_types (name, code, max_days, requires_approval, parent_notification, vertical, is_active)
       VALUES ($1, $2::leave_type_enum, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name.trim(),
        code,
        maxDays || null,
        requiresApproval ?? true,
        parentNotification || 'ON_APPROVAL',
        vertical || null,
        active ?? true,
      ]
    );

    if (rows.length === 0) {
      return serverErrorResponse('Failed to create leave type');
    }

    const newLeaveType = rows[0];

    // Transform to frontend format
    const transformed = {
      id: newLeaveType.id,
      name: newLeaveType.name,
      code: newLeaveType.code,
      maxDays: newLeaveType.max_days,
      requiresApproval: newLeaveType.requires_approval,
      parentNotification: newLeaveType.parent_notification,
      vertical: newLeaveType.vertical || null,
      active: newLeaveType.is_active,
    };

    return createdResponse(transformed, 'Leave type created successfully');
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in POST /api/config/leave-types:', error);
    return serverErrorResponse('Failed to create leave type', error);
  }
}

/**
 * PUT /api/config/leave-types
 * Update a leave type
 * Auth: SUPERINTENDENT only
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT']);
    const body = await request.json();

    const { id, name, maxDays, requiresApproval, parentNotification, vertical, active } = body;

    if (!id) {
      return badRequestResponse('ID is required');
    }

    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      params.push(name.trim());
    }
    if (maxDays !== undefined) {
      setClauses.push(`max_days = $${paramIndex++}`);
      params.push(maxDays);
    }
    if (requiresApproval !== undefined) {
      setClauses.push(`requires_approval = $${paramIndex++}`);
      params.push(requiresApproval);
    }
    if (parentNotification !== undefined) {
      setClauses.push(`parent_notification = $${paramIndex++}`);
      params.push(parentNotification);
    }
    if (vertical !== undefined) {
      setClauses.push(`vertical = $${paramIndex++}`);
      params.push(vertical);
    }
    if (active !== undefined) {
      setClauses.push(`is_active = $${paramIndex++}`);
      params.push(active);
    }

    if (setClauses.length === 0) {
      return badRequestResponse('No fields to update');
    }

    params.push(id);
    const sql = `UPDATE leave_types SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const { rows } = await query(sql, params);

    if (rows.length === 0) {
      return notFoundResponse('Leave type not found');
    }

    const updatedLeaveType = rows[0];

    // Transform to frontend format
    const transformed = {
      id: updatedLeaveType.id,
      name: updatedLeaveType.name,
      code: updatedLeaveType.code,
      maxDays: updatedLeaveType.max_days,
      requiresApproval: updatedLeaveType.requires_approval,
      parentNotification: updatedLeaveType.parent_notification,
      vertical: updatedLeaveType.vertical || null,
      active: updatedLeaveType.is_active,
    };

    return successResponse(transformed);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in PUT /api/config/leave-types:', error);
    return serverErrorResponse('Failed to update leave type', error);
  }
}

/**
 * DELETE /api/config/leave-types
 * Delete a leave type
 * Auth: SUPERINTENDENT only
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT']);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return badRequestResponse('ID is required');
    }

    await query('DELETE FROM leave_types WHERE id = $1', [id]);

    return successResponse({ message: 'Leave type deleted successfully' });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in DELETE /api/config/leave-types:', error);
    return serverErrorResponse('Failed to delete leave type', error);
  }
}
