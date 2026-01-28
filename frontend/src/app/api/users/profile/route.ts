import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';

/**
 * GET /api/users/profile
 * Get user profile by user_id
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return badRequestResponse('user_id is required');
    }

    // Try to find user by id first, then by auth_user_id (for JWT sub fallback)
    let user = null;
    let error = null;

    // First try by public.users.id
    const { data: userById, error: errorById } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userById) {
      user = userById;
    } else if (errorById?.code === 'PGRST116') {
      // Not found by id, try by auth_user_id (Supabase Auth UUID)
      const { data: userByAuthId, error: errorByAuthId } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      user = userByAuthId;
      error = errorByAuthId;
    } else {
      error = errorById;
    }

    if (error) {
      if (error.code === 'PGRST116') {
        return notFoundResponse('User not found');
      }
      console.error('Supabase error:', error);
      return serverErrorResponse('Failed to fetch user profile', error);
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
    console.error('Error in GET /api/users/profile:', error);
    return serverErrorResponse('Failed to fetch user profile', error);
  }
}
