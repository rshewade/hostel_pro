import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromToken, hashPassword, createAuditLog } from '@/lib/auth';
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
 * Requires valid JWT token from login response.
 * Updates password hash in PostgreSQL and records DPDP consent.
 *
 * @see Task 7 - Student Login, First-Time Setup
 * @see .docs/api-routes-audit.md
 */
export async function POST(request: NextRequest) {
  try {
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

    // Verify token and get user
    const user = await getUserFromToken(token);

    if (!user) {
      return unauthorizedResponse('Invalid or expired token');
    }

    // Hash the new password
    const newHash = await hashPassword(newPassword);

    // Update user: set password_hash, clear requires_password_change, record DPDP consent
    const now = new Date().toISOString();
    const { rowCount } = await query(
      `UPDATE users
       SET password_hash = $1,
           requires_password_change = false,
           metadata = COALESCE(metadata, '{}'::jsonb)
             || jsonb_build_object('password_changed_at', $2::text)
             || jsonb_build_object('dpdp_consent', true)
             || jsonb_build_object('dpdp_consent_at', $2::text),
           updated_at = NOW()
       WHERE id = $3`,
      [newHash, now, user.id]
    );

    if (rowCount === 0) {
      return serverErrorResponse('Failed to update user record');
    }

    // Log DPDP consent
    await createAuditLog({
      entityType: 'USER',
      entityId: user.id,
      action: 'DPDP_CONSENT',
      performedBy: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        consent_type: 'first_login_setup',
        consent_value: 'ACCEPTED',
      },
    });

    // Log password change
    await createAuditLog({
      entityType: 'USER',
      entityId: user.id,
      action: 'PASSWORD_CHANGE',
      performedBy: user.id,
      metadata: {
        change_type: 'first_time_setup',
      },
    });

    console.log('\n========================================');
    console.log('FIRST-TIME SETUP COMPLETED (Custom JWT)');
    console.log('========================================');
    console.log('User ID:', user.id);
    console.log('Role:', user.role);
    console.log('DPDP Consent:', dpdpConsent);
    console.log('Timestamp:', now);
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
