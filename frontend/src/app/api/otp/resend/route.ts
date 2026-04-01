import { NextRequest, NextResponse } from 'next/server';
import { createOtp } from '@/lib/auth';

/**
 * POST /api/otp/resend
 *
 * Resend OTP for application or parent login flows.
 * Uses DB-backed OTP storage via createOtp() (invalidates previous OTP).
 *
 * Request body:
 * - token: string - Original token from /api/otp/send response
 * - reason: string - Reason for resending (user_request, expired, etc.)
 *
 * Response:
 * - Success: 200 with { success: true, token: string, expiresIn: number }
 * - Error: 400/429 with { message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, reason } = body;

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

    // Create new OTP in DB (invalidates the previous one for this contact+purpose)
    const otp = await createOtp(tokenData.contact, 'application');

    // Generate new token with same contact info but new timestamp
    const newToken = Buffer.from(JSON.stringify({
      contact: tokenData.contact,
      vertical: tokenData.vertical,
      timestamp: Date.now(),
      resent: true
    })).toString('base64');

    // In production, send OTP via SMS/Email service
    console.log('\n========================================');
    console.log('OTP RESENT (DB-backed)');
    console.log('========================================');
    console.log('Contact:', tokenData.contact);
    console.log('Vertical:', tokenData.vertical);
    console.log('Reason:', reason || 'user_request');
    console.log('New OTP Code:', otp);
    console.log('Expires In: 300 seconds (5 minutes)');
    console.log('========================================\n');

    return NextResponse.json({
      success: true,
      token: newToken,
      expiresIn: 300, // 5 minutes
      message: `New OTP sent to ${tokenData.contact}`,
      // Include OTP in development for easy testing
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
    });

  } catch (error) {
    console.error('Error in /api/otp/resend:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
