import { NextRequest, NextResponse } from 'next/server';
import { resendOtp } from '@/lib/msg91';
import { logger } from '@/lib/logger';

/**
 * POST /api/otp/resend
 *
 * Resend OTP for application or parent login flows.
 * Uses MSG91 retry API to resend via SMS or voice channel.
 *
 * Request body:
 * - token: string - Original token from /api/otp/send response
 * - reason: string - Reason for resending (user_request, expired, etc.)
 * - retryType?: 'text' | 'voice' | 'email' - Channel for retry (default: 'text')
 *
 * Response:
 * - Success: 200 with { success: true, token: string, expiresIn: number }
 * - Error: 400/429 with { message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, retryType } = body;

    // Validate input
    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    // Decode original token
    let tokenData;
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      tokenData = JSON.parse(decoded);
    } catch {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Rate limiting: require at least 60 seconds between resends
    const timeSinceOriginal = Date.now() - tokenData.timestamp;
    const minResendInterval = 60000; // 60 seconds

    if (timeSinceOriginal < minResendInterval) {
      const secondsRemaining = Math.ceil((minResendInterval - timeSinceOriginal) / 1000);
      return NextResponse.json(
        {
          message: `Please wait ${secondsRemaining} seconds before requesting a new OTP`
        },
        { status: 429 }
      );
    }

    const contact = tokenData.contact;

    // Resend OTP via MSG91 retry API
    const msg91Result = await resendOtp(contact, retryType || 'text');

    if (!msg91Result.success) {
      logger.error('OTP resend failed via MSG91', { contact, error: msg91Result.message });
      return NextResponse.json(
        { message: 'Failed to resend OTP. Please try again.' },
        { status: 500 }
      );
    }

    // Generate new token with same contact info but new timestamp
    const newToken = Buffer.from(JSON.stringify({
      contact: tokenData.contact,
      vertical: tokenData.vertical,
      timestamp: Date.now(),
      resent: true
    })).toString('base64');

    return NextResponse.json({
      success: true,
      token: newToken,
      expiresIn: 300, // 5 minutes
      message: `New OTP sent to ${tokenData.contact}`,
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('OTP resend failed', { route: '/api/otp/resend', error: errMsg });
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
