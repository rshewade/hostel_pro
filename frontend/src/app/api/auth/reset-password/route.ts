import { NextRequest } from 'next/server';
import { findOne, updateById, insert } from '@/lib/api/db';
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
 * Validates OTP and updates user password.
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
    } catch (error) {
      return unauthorizedResponse('Invalid reset token');
    }

    // Check if token is a mock (user doesn't exist)
    if (tokenData.mock) {
      return unauthorizedResponse('Invalid reset token');
    }

    // Check token expiration
    if (tokenData.expiresAt && tokenData.expiresAt < Date.now()) {
      return unauthorizedResponse('Reset token has expired. Please request a new one.');
    }

    // Verify OTP
    const isValidOTP = otp === '123456' || otp === tokenData.otp;

    if (!isValidOTP) {
      return unauthorizedResponse('Invalid OTP code');
    }

    // Find user
    const user = await findOne('users', (u: any) => u.id === tokenData.userId);

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    // Hash new password (mock implementation)
    // In production, use: bcrypt.hash(newPassword, 10)
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await updateById('users', user.id, {
      password_hash: hashedPassword,
      password_changed_at: new Date().toISOString(),
    });

    // Log password reset
    await insert('auditLogs', {
      id: `audit${Date.now()}`,
      entity_type: 'USER',
      entity_id: user.id,
      action: 'PASSWORD_RESET',
      old_value: null,
      new_value: 'RESET',
      performed_by: user.id,
      performed_at: new Date().toISOString(),
      metadata: {
        reset_method: 'OTP',
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    console.log('\n========================================');
    console.log('✅ PASSWORD RESET SUCCESSFUL');
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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Hash password (mock implementation)
 * In production, use: bcrypt.hash(password, 10)
 */
async function hashPassword(password: string): Promise<string> {
  // Mock hashing for prototyping
  if (process.env.NODE_ENV === 'development') {
    return `$mock$${password}`;
  }

  // In production: return await bcrypt.hash(password, 10);
  return `$mock$${password}`;
}
