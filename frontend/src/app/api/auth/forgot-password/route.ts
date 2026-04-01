import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { createOtp } from '@/lib/auth';
import {
  successResponse,
  badRequestResponse,
  serverErrorResponse,
  validateFields,
} from '@/lib/api/responses';
import { AuthAPI } from '@/types/api';

/**
 * POST /api/auth/forgot-password
 *
 * Initiate password reset process.
 * Sends OTP to user's registered email or mobile.
 * Returns token for password reset verification.
 *
 * @see Task 7 - Student Login (Forgot Password Flow)
 * @see .docs/api-routes-audit.md
 */
export async function POST(request: NextRequest) {
  try {
    const body: AuthAPI.ForgotPasswordRequest = await request.json();
    const { contact } = body;

    // Validate input
    const validation = validateFields([
      {
        field: 'contact',
        value: contact,
        rules: [
          {
            type: 'required',
            message: 'Email or mobile number is required',
          },
        ],
      },
    ]);

    if (!validation.isValid) {
      return badRequestResponse('Validation failed', validation.errors);
    }

    // Find user by email or mobile
    const normalizedContact = contact.toLowerCase().trim();
    const normalizedMobile = contact.replace(/\s/g, '');

    const userResult = await query(
      `SELECT id, email, mobile FROM users
       WHERE LOWER(email) = $1 OR mobile = $2
       LIMIT 1`,
      [normalizedContact, normalizedMobile]
    );

    const user = userResult.rows[0];

    // For security, don't reveal if user exists or not
    // Always return success even if user not found
    if (!user) {
      console.log('Password reset requested for non-existent user:', contact);

      const mockToken = Buffer.from(
        JSON.stringify({
          contact,
          timestamp: Date.now(),
          mock: true,
        })
      ).toString('base64');

      return successResponse({
        success: true,
        token: mockToken,
        message:
          'If an account exists with this contact, a password reset OTP has been sent.',
      } as AuthAPI.ForgotPasswordResponse);
    }

    // Create OTP using DB-backed storage
    const userContact = user.email || user.mobile;
    const otp = await createOtp(userContact, 'password_reset');

    // Create reset token
    const resetToken = Buffer.from(
      JSON.stringify({
        userId: user.id,
        contact: userContact,
        timestamp: Date.now(),
      })
    ).toString('base64');

    // In production, send OTP via SMS/Email service
    console.log('\n========================================');
    console.log('PASSWORD RESET OTP GENERATED');
    console.log('========================================');
    console.log('User ID:', user.id);
    console.log('Contact:', userContact);
    console.log('OTP Code:', otp);
    console.log('Token:', resetToken);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================\n');

    const response: AuthAPI.ForgotPasswordResponse = {
      success: true,
      token: resetToken,
      message: user.email
        ? `Password reset OTP sent to ${user.email}`
        : `Password reset OTP sent to ${user.mobile}`,
      // Include OTP in development for easy testing
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp }),
    };

    return successResponse(response);
  } catch (error: any) {
    console.error('Error in /api/auth/forgot-password:', error);
    return serverErrorResponse('Failed to initiate password reset', error);
  }
}
