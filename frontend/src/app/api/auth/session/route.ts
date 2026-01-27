import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { AuthAPI, UserRole, Vertical } from '@/types/api';

/**
 * GET /api/auth/session
 *
 * Validate current Supabase Auth session and return user information.
 * Used by frontend to check if user is authenticated.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse('No authentication token provided');
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      console.error('Session validation failed:', authError?.message);
      return unauthorizedResponse('Invalid or expired session');
    }

    // Find user in public.users by auth_user_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (userError || !user) {
      console.error('User not found for auth_user_id:', authData.user.id);
      return unauthorizedResponse('User not found');
    }

    if (!user.is_active) {
      return unauthorizedResponse(
        'Account is inactive. Please contact administration.'
      );
    }

    const response: AuthAPI.SessionResponse = {
      success: true,
      userId: user.id,
      role: user.role as UserRole,
      ...(user.vertical && { vertical: user.vertical as Vertical }),
    };

    return successResponse(response);
  } catch (error: any) {
    console.error('Error in /api/auth/session:', error);
    return serverErrorResponse('Session validation failed', error);
  }
}

/**
 * POST /api/auth/session (Alternative for clients that can't use GET with body)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return unauthorizedResponse('Authentication token is required');
    }

    // Verify token with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      console.error('Session validation failed:', authError?.message);
      return unauthorizedResponse('Invalid or expired session');
    }

    // Find user in public.users by auth_user_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (userError || !user) {
      console.error('User not found for auth_user_id:', authData.user.id);
      return unauthorizedResponse('User not found');
    }

    if (!user.is_active) {
      return unauthorizedResponse(
        'Account is inactive. Please contact administration.'
      );
    }

    const response: AuthAPI.SessionResponse = {
      success: true,
      userId: user.id,
      role: user.role as UserRole,
      ...(user.vertical && { vertical: user.vertical as Vertical }),
    };

    return successResponse(response);
  } catch (error: any) {
    console.error('Error in /api/auth/session:', error);
    return serverErrorResponse('Session validation failed', error);
  }
}
