import { NextRequest } from 'next/server';
import { findOne } from '@/lib/api/db';
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
    const user = await findOne('users', (u: any) => {
      const normalizedContact = contact.toLowerCase().trim();
      return (
        u.email?.toLowerCase() === normalizedContact ||
        u.mobile_no?.replace(/\s/g, '') === contact.replace(/\s/g, '')
      );
    });

    // For security, don't reveal if user exists or not
    // Always return success even if user not found
    if (!user) {
      console.log('Password reset requested for non-existent user:', contact);

      // Return generic success message
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

    // Generate OTP
    const otp = generateOTP();

    // Create reset token
    const resetToken = Buffer.from(
      JSON.stringify({
        userId: user.id,
        contact: user.email || user.mobile_no,
        otp,
        timestamp: Date.now(),
        expiresAt: Date.now() + 600000, // 10 minutes
      })
    ).toString('base64');

    // Mock OTP sending (in production, send via SMS/Email)
    console.log('\n========================================');
    console.log('🔐 PASSWORD RESET OTP GENERATED');
    console.log('========================================');
    console.log('User ID:', user.id);
    console.log('Contact:', user.email || user.mobile_no);
    console.log('OTP Code:', otp);
    console.log('Token:', resetToken);
    console.log('Expires In: 600 seconds (10 minutes)');
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================\n');

    const response: AuthAPI.ForgotPasswordResponse = {
      success: true,
      token: resetToken,
      message: user.email
        ? `Password reset OTP sent to ${user.email}`
        : `Password reset OTP sent to ${user.mobile_no}`,
      // Include OTP in development for easy testing
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp }),
    };

    return successResponse(response);
  } catch (error: any) {
    console.error('Error in /api/auth/forgot-password:', error);
    return serverErrorResponse('Failed to initiate password reset', error);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate 6-digit OTP
 */
function generateOTP(): string {
  // In production, generate random 6-digit code
  // For prototyping, use static OTP for easy testing
  if (process.env.NODE_ENV === 'development') {
    return '123456';
  }

  return Math.floor(100000 + Math.random() * 900000).toString();
}
