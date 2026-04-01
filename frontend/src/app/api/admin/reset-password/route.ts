import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { hashPassword } from '@/lib/auth';

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

    console.log(`Password reset for ${email} (${user.full_name})`);

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
