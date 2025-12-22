import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/otp/resend
 *
 * Mock endpoint for resending OTP during prototyping phase.
 * In production, this would rate-limit resend attempts and send new OTP.
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
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Mock rate limiting check (in production, check database for resend attempts)
    // For now, we'll allow resends if more than 60 seconds have passed
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

    // Generate new OTP
    const mockOTP = '123456';

    // Generate new token with same contact info but new timestamp
    const newToken = Buffer.from(JSON.stringify({
      contact: tokenData.contact,
      vertical: tokenData.vertical,
      timestamp: Date.now(),
      otp: mockOTP,
      resent: true
    })).toString('base64');

    // Mock logging (in production, log to database and send SMS/Email)
    console.log('\n========================================');
    console.log('🔄 MOCK OTP RESENT');
    console.log('========================================');
    console.log('Contact:', tokenData.contact);
    console.log('Vertical:', tokenData.vertical);
    console.log('Reason:', reason || 'user_request');
    console.log('New OTP Code:', mockOTP);
    console.log('New Token:', newToken);
    console.log('Expires In: 600 seconds (10 minutes)');
    console.log('========================================\n');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      token: newToken,
      expiresIn: 600, // 10 minutes
      message: `New OTP sent to ${tokenData.contact}`,
      // Include OTP in development for easy testing
      ...(process.env.NODE_ENV === 'development' && { devOTP: mockOTP })
    });

  } catch (error) {
    console.error('Error in /api/otp/resend:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
