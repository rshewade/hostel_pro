import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';

/**
 * GET /api/users
 * List users with optional filtering by role and vertical
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const vertical = searchParams.get('vertical');
    const isActive = searchParams.get('is_active');

    let query = supabase.from('users').select('*');

    if (role) {
      query = query.eq('role', role.toUpperCase());
    }
    if (vertical) {
      query = query.eq('vertical', vertical.toUpperCase());
    }
    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data: users, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return serverErrorResponse('Failed to fetch users', error);
    }

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
    console.error('Error in GET /api/users:', error);
    return serverErrorResponse('Failed to fetch users', error);
  }
}
