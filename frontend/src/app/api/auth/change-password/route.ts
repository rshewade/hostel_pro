import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromToken, comparePassword, hashPassword, createAuditLog, validatePasswordStrength } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { getClientIp } from '@/lib/rate-limit';

/**
 * POST /api/auth/change-password
 *
 * Change password for an authenticated user.
 * Requires current password verification + new password.
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return unauthorizedResponse('Authentication required');
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return unauthorizedResponse('Invalid or expired token');
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return badRequestResponse('Current password and new password are required');
    }

    if (currentPassword === newPassword) {
      return badRequestResponse('New password must be different from current password');
    }

    // Validate new password strength
    const strengthError = validatePasswordStrength(newPassword);
    if (strengthError) {
      return badRequestResponse(strengthError);
    }

    // Fetch current password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1 AND is_active = true',
      [user.id]
    );

    if (result.rows.length === 0) {
      return unauthorizedResponse('User not found');
    }

    const { password_hash } = result.rows[0];

    // Verify current password
    const isValid = await comparePassword(currentPassword, password_hash);
    if (!isValid) {
      return unauthorizedResponse('Current password is incorrect');
    }

    // Hash and save new password
    const newHash = await hashPassword(newPassword);
    await query(
      `UPDATE users
       SET password_hash = $1,
           requires_password_change = false,
           profile_data = COALESCE(profile_data, '{}'::jsonb)
             || jsonb_build_object(
                  'password_changed_at', NOW()::text
                ),
           updated_at = NOW()
       WHERE id = $2`,
      [newHash, user.id]
    );

    // Audit log
    const ip = getClientIp(request);
    await createAuditLog({
      entityType: 'USER',
      entityId: user.id,
      action: 'PASSWORD_CHANGE',
      performedBy: user.id,
      ipAddress: ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: { change_type: 'user_initiated' },
    });

    return successResponse(null, 'Password changed successfully');
  } catch (error: any) {
    console.error('Error in POST /api/auth/change-password:', error);
    return serverErrorResponse('Failed to change password', error);
  }
}
