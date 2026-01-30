import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';

/**
 * POST /api/admin/reset-password
 *
 * Reset password for a user by email.
 *
 * Request body:
 * {
 *   "adminSecret": "your-admin-secret",
 *   "email": "user@example.com",
 *   "newPassword": "NewPassword123!"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { adminSecret, email, newPassword } = body;

    // Validate admin secret
    const expectedSecret = process.env.ADMIN_SEED_SECRET || 'hostel-admin-seed-2024';
    if (adminSecret !== expectedSecret) {
      return unauthorizedResponse('Invalid admin secret');
    }

    if (!email) {
      return badRequestResponse('Email is required');
    }

    if (!newPassword) {
      return badRequestResponse('New password is required');
    }

    if (newPassword.length < 6) {
      return badRequestResponse('Password must be at least 6 characters');
    }

    // First, find the user in public.users to get their auth_user_id
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, auth_user_id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return badRequestResponse(`User with email ${email} not found`);
    }

    if (!user.auth_user_id) {
      return badRequestResponse(`User ${email} does not have a Supabase Auth account. Run seed-auth-users first.`);
    }

    // Update the password using admin API
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      user.auth_user_id,
      { password: newPassword }
    );

    if (authError) {
      console.error('Failed to reset password:', authError);
      return serverErrorResponse('Failed to reset password: ' + authError.message, authError);
    }

    // Optionally clear the requires_password_change flag
    await supabase
      .from('users')
      .update({ requires_password_change: false })
      .eq('id', user.id);

    console.log(`✅ Password reset for ${email} (${user.full_name})`);

    return successResponse({
      success: true,
      message: `Password reset successfully for ${email}`,
      user: {
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/admin/reset-password:', error);
    return serverErrorResponse('Password reset failed', error);
  }
}
