import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/users/profile
 * Get user profile by user_id
 * Auth: any authenticated user (own profile)
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return badRequestResponse('user_id is required');
    }

    // Try to find user by id first
    const { rows: userByIdRows } = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    let user = userByIdRows.length > 0 ? userByIdRows[0] : null;

    // If not found by id, try by auth_user_id
    if (!user) {
      const { rows: userByAuthIdRows } = await query(
        'SELECT * FROM users WHERE auth_user_id = $1',
        [userId]
      );
      user = userByAuthIdRows.length > 0 ? userByAuthIdRows[0] : null;
    }

    if (!user) {
      return notFoundResponse('User not found');
    }

    // Return user profile (excluding sensitive fields)
    const profile = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      vertical: user.vertical,
      date_of_birth: user.date_of_birth,
      is_active: user.is_active,
      created_at: user.created_at,
    };

    return successResponse(profile);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/users/profile:', error);
    return serverErrorResponse('Failed to fetch user profile', error);
  }
}

/**
 * PUT /api/users/profile
 * Update user profile
 * Auth: any authenticated user (own profile)
 */
export async function PUT(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const body = await request.json();
    const { user_id, full_name, email, mobile, date_of_birth } = body;

    if (!user_id) {
      return badRequestResponse('user_id is required');
    }

    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (full_name !== undefined) {
      setClauses.push(`full_name = $${paramIndex++}`);
      params.push(full_name);
    }
    if (email !== undefined) {
      setClauses.push(`email = $${paramIndex++}`);
      params.push(email);
    }
    if (mobile !== undefined) {
      setClauses.push(`mobile = $${paramIndex++}`);
      params.push(mobile);
    }
    if (date_of_birth !== undefined) {
      setClauses.push(`date_of_birth = $${paramIndex++}`);
      params.push(date_of_birth);
    }

    if (setClauses.length === 0) {
      return badRequestResponse('No fields to update');
    }

    params.push(user_id);
    const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const { rows } = await query(sql, params);

    if (rows.length === 0) {
      return notFoundResponse('User not found');
    }

    const updatedUser = rows[0];

    const profile = {
      id: updatedUser.id,
      full_name: updatedUser.full_name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      role: updatedUser.role,
      vertical: updatedUser.vertical,
      date_of_birth: updatedUser.date_of_birth,
      is_active: updatedUser.is_active,
      created_at: updatedUser.created_at,
    };

    return successResponse(profile);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in PUT /api/users/profile:', error);
    return serverErrorResponse('Failed to update user profile', error);
  }
}
