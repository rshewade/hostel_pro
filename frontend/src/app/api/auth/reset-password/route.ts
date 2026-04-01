import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, verifyOtp, createAuditLog } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  validateFields,
} from '@/lib/api/responses';
import { AuthAPI } from '@/types/api';

/**
 * POST /api/auth/reset-password
 *
 * Complete password reset with OTP verification.
 * Validates OTP via DB and updates user password hash.
 *
 * @see Task 7 - Student Login (Forgot Password Flow)
 * @see .docs/api-routes-audit.md
 */
export async function POST(request: NextRequest) {
  try {
    const body: AuthAPI.ResetPasswordRequest = await request.json();
    const { token, otp, newPassword } = body;

    // Validate input
    const validation = validateFields([
      {
        field: 'token',
        value: token,
        rules: [
          {
            type: 'required',
            message: 'Reset token is required',
          },
        ],
      },
      {
        field: 'otp',
        value: otp,
        rules: [
          {
            type: 'required',
            message: 'OTP is required',
          },
          {
            type: 'pattern',
            param: /^\d{6}$/,
            message: 'OTP must be a 6-digit number',
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
    ]);

    if (!validation.isValid) {
      return badRequestResponse('Validation failed', validation.errors);
    }

    // Decode and verify token
    let tokenData: any;
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      tokenData = JSON.parse(decoded);
    } catch {
      return unauthorizedResponse('Invalid reset token');
    }

    // Check if token is a mock (user doesn't exist)
    if (tokenData.mock) {
      return unauthorizedResponse('Invalid reset token');
    }

    // Verify OTP via DB-backed verification
    const otpResult = await verifyOtp(tokenData.contact, otp, 'password_reset');

    if (!otpResult.valid) {
      return unauthorizedResponse(otpResult.error || 'Invalid OTP code');
    }

    // Find user
    const userResult = await query(
      `SELECT id, email, mobile FROM users WHERE id = $1`,
      [tokenData.userId]
    );

    if (userResult.rows.length === 0) {
      return unauthorizedResponse('User not found');
    }

    const user = userResult.rows[0];

    // Hash new password with bcrypt
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    const updateResult = await query(
      `UPDATE users SET password_hash = $1, password_changed_at = NOW(), updated_at = NOW() WHERE id = $2`,
      [hashedPassword, user.id]
    );

    if (updateResult.rowCount === 0) {
      return serverErrorResponse('Failed to reset password');
    }

    // Log password reset
    await createAuditLog({
      entityType: 'USER',
      entityId: user.id,
      action: 'PASSWORD_RESET',
      performedBy: user.id,
      newValue: 'RESET',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      metadata: {
        reset_method: 'OTP',
      },
    });

    console.log('\n========================================');
    console.log('PASSWORD RESET SUCCESSFUL');
    console.log('========================================');
    console.log('User ID:', user.id);
    console.log('Email:', user.email);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================\n');

    const response: AuthAPI.ResetPasswordResponse = {
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.',
    };

    return successResponse(response);
  } catch (error: any) {
    console.error('Error in /api/auth/reset-password:', error);
    return serverErrorResponse('Failed to reset password', error);
  }
}
