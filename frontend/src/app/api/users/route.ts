import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { requireAuth, getVerticalFilter } from '@/lib/authorize';

/**
 * GET /api/users
 * List users with optional filtering by role and vertical
 * Auth: SUPERINTENDENT, TRUSTEE, ACCOUNTS (staff only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS']);
    const verticalFilter = getVerticalFilter(user);
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const vertical = searchParams.get('vertical');
    const isActive = searchParams.get('is_active');

    let sql = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (role) {
      sql += ` AND role = $${paramIndex++}`;
      params.push(role.toUpperCase());
    }
    // Enforce superintendent's vertical scope; staff without vertical restriction can pass query param
    if (verticalFilter) {
      sql += ` AND vertical = $${paramIndex++}`;
      params.push(verticalFilter);
    } else if (vertical) {
      sql += ` AND vertical = $${paramIndex++}`;
      params.push(vertical.toUpperCase());
    }
    if (isActive !== null) {
      sql += ` AND is_active = $${paramIndex++}`;
      params.push(isActive === 'true');
    }

    sql += ' ORDER BY created_at DESC';

    const { rows: users } = await query(sql, params);

    // Return users without sensitive fields
    const sanitizedUsers = (users || []).map((user: any) => ({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      mobile: user.mobile,
      mobile_no: user.mobile, // Alias for compatibility
      role: user.role,
      vertical: user.vertical,
      is_active: user.is_active,
      created_at: user.created_at,
    }));

    return successResponse(sanitizedUsers);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/users:', error);
    return serverErrorResponse('Failed to fetch users', error);
  }
}
