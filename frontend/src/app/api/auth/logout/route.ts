import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { AuthAPI } from '@/types/api';

/**
 * POST /api/auth/logout
 *
 * Terminate user session by signing out from Supabase Auth.
 * Logs the logout action for audit purposes.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body: AuthAPI.LogoutRequest = await request.json();
    const { token } = body;

    if (!token) {
      return unauthorizedResponse('Authentication token is required');
    }

    // Verify token with Supabase Auth and get user info
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      // Even if token is invalid, we still want to "logout" on client side
      console.log('Token verification failed during logout, continuing anyway');
      return successResponse({
        success: true,
        message: 'Logged out successfully',
      } as AuthAPI.LogoutResponse);
    }

    // Find user in public.users for audit logging
    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', authData.user.id)
      .single();

    // Sign out from Supabase Auth (invalidate all sessions for this user)
    const { error: signOutError } = await supabase.auth.admin.signOut(token);

    if (signOutError) {
      console.error('Supabase signOut error:', signOutError);
      // Don't fail the request - the token might already be invalid
    }

    // Log logout action
    if (user) {
      await supabase.from('audit_logs').insert({
        entity_type: 'USER',
        entity_id: user.id,
        action: 'LOGOUT',
        actor_id: user.id,
        metadata: {
          auth_user_id: authData.user.id,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        },
      });

      console.log('\n========================================');
      console.log('👋 USER LOGGED OUT (Supabase Auth)');
      console.log('========================================');
      console.log('User ID:', user.id);
      console.log('Auth User ID:', authData.user.id);
      console.log('Role:', user.role);
      console.log('Timestamp:', new Date().toISOString());
      console.log('========================================\n');
    }

    const response: AuthAPI.LogoutResponse = {
      success: true,
      message: 'Logged out successfully',
    };

    return successResponse(response);
  } catch (error: any) {
    console.error('Error in /api/auth/logout:', error);
    return serverErrorResponse('Logout failed', error);
  }
}
