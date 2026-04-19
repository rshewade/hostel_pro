import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { hashPassword, validatePasswordStrength } from '@/lib/auth';
import { requireAuth } from '@/lib/authorize';

/**
 * POST /api/admin/reset-password
 *
 * Reset password for a user by email.
 * Auth: TRUSTEE only (highest authority since ADMIN role was removed)
 *
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "newPassword": "NewPassword123!"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, ['TRUSTEE']);
    const body = await request.json();
    const { email, newPassword } = body;

    if (!email) {
      return badRequestResponse('Email is required');
    }

    if (!newPassword) {
      return badRequestResponse('New password is required');
    }

    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      return badRequestResponse(passwordError);
    }

    // Find the user in public.users
    const { rows: userRows } = await query(
      'SELECT id, email, full_name, role, auth_user_id FROM users WHERE email = $1',
      [email]
    );

    if (userRows.length === 0) {
      return badRequestResponse(`User with email ${email} not found`);
    }

    const user = userRows[0];

    // Hash the new password and update
    const hashedPassword = await hashPassword(newPassword);

    await query(
      'UPDATE users SET password_hash = $1, requires_password_change = false WHERE id = $2',
      [hashedPassword, user.id]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, performed_by, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'USER',
        user.id,
        'PASSWORD_RESET_BY_ADMIN',
        authUser.id,
        JSON.stringify({ target_email: email, target_role: user.role }),
      ]
    );

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
    if (error instanceof NextResponse) return error;
    return serverErrorResponse('Password reset failed', error);
  }
}
