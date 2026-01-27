import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  validateFields,
} from '@/lib/api/responses';
import { AuthAPI, UserRole } from '@/types/api';

/**
 * POST /api/auth/first-time-setup
 *
 * Handle first-time password change after initial login.
 * Requires valid Supabase Auth token from login response.
 * Updates password in Supabase Auth and records DPDP consent.
 *
 * @see Task 7 - Student Login, First-Time Setup
 * @see .docs/api-routes-audit.md
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body: AuthAPI.FirstTimeSetupRequest = await request.json();
    const { token, newPassword, dpdpConsent } = body;

    // Validate input
    const validation = validateFields([
      {
        field: 'token',
        value: token,
        rules: [
          {
            type: 'required',
            message: 'Authentication token is required',
          },
        ],
      },
      {
        field: 'newPassword',
        value: newPassword,
        rules: [
          {
            type: 'required',
            message: 'New password is required',
          },
          {
            type: 'min',
            param: 8,
            message: 'Password must be at least 8 characters long',
          },
          {
            type: 'custom',
            message:
              'Password must contain uppercase, lowercase, number, and special character',
            validator: (pwd: string) => {
              return (
                /[A-Z]/.test(pwd) &&
                /[a-z]/.test(pwd) &&
                /[0-9]/.test(pwd) &&
                /[!@#$%^&*]/.test(pwd)
              );
            },
          },
        ],
      },
      {
        field: 'dpdpConsent',
        value: dpdpConsent,
        rules: [
          {
            type: 'custom',
            message: 'DPDP consent is required',
            validator: (value: boolean) => value === true,
          },
        ],
      },
    ]);

    if (!validation.isValid) {
      return badRequestResponse('Validation failed', validation.errors);
    }

    // Verify token by getting the user from Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      console.error('Token verification failed:', authError?.message);
      return unauthorizedResponse('Invalid or expired token');
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

    // Update password in Supabase Auth using admin API
    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      user.auth_user_id,
      { password: newPassword }
    );

    if (passwordError) {
      console.error('Failed to update password in Supabase Auth:', passwordError);
      return serverErrorResponse('Failed to update password', passwordError);
    }

    // Update public.users - set requires_password_change to false and record DPDP consent
    const { error: updateError } = await supabase
      .from('users')
      .update({
        requires_password_change: false,
        metadata: {
          ...(user.metadata || {}),
          password_changed_at: new Date().toISOString(),
          dpdp_consent: true,
          dpdp_consent_at: new Date().toISOString(),
        },
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to update public.users:', updateError);
      return serverErrorResponse('Failed to update user record', updateError);
    }

    // Log DPDP consent
    await supabase.from('audit_logs').insert({
      entity_type: 'USER',
      entity_id: user.id,
      action: 'DPDP_CONSENT',
      actor_id: user.id,
      metadata: {
        consent_type: 'first_login_setup',
        consent_value: 'ACCEPTED',
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Log password change
    await supabase.from('audit_logs').insert({
      entity_type: 'USER',
      entity_id: user.id,
      action: 'PASSWORD_CHANGE',
      actor_id: user.id,
      metadata: {
        change_type: 'first_time_setup',
        auth_user_id: user.auth_user_id,
      },
    });

    console.log('\n========================================');
    console.log('✅ FIRST-TIME SETUP COMPLETED (Supabase Auth)');
    console.log('========================================');
    console.log('User ID:', user.id);
    console.log('Auth User ID:', user.auth_user_id);
    console.log('Role:', user.role);
    console.log('DPDP Consent:', dpdpConsent);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================\n');

    const response: AuthAPI.FirstTimeSetupResponse = {
      success: true,
      role: user.role as UserRole,
      message: 'Password updated successfully. Redirecting to dashboard...',
    };

    return successResponse(response);
  } catch (error: any) {
    console.error('Error in /api/auth/first-time-setup:', error);
    return serverErrorResponse('Failed to update password', error);
  }
}
