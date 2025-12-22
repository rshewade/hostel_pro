import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/otp/verify
 *
 * Mock endpoint for verifying OTP during prototyping phase.
 * In production, this would validate against stored OTP hash.
 *
 * Request body:
 * - code: string - 6-digit OTP code
 * - token: string - Token from /api/otp/send response
 * - attempts: number - Number of verification attempts
 * - userAgent?: string - Browser user agent for logging
 *
 * Response:
 * - Success: 200 with { success: true, sessionToken: string }
 * - Error: 400/401 with { message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, token, attempts, userAgent } = body;

    // Validate input
    if (!code) {
      return NextResponse.json(
        { message: 'OTP code is required' },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { message: 'OTP must be a 6-digit number' },
        { status: 400 }
      );
    }

    // Check attempts limit
    if (attempts >= 3) {
      return NextResponse.json(
        { message: 'Too many failed attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    // Decode token
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

    // Check token expiration (10 minutes)
    const tokenAge = Date.now() - tokenData.timestamp;
    const maxAge = 600000; // 10 minutes in milliseconds

    if (tokenAge > maxAge) {
      return NextResponse.json(
        { message: 'OTP has expired. Please request a new one.' },
        { status: 401 }
      );
    }

    // Verify OTP (in development, accept '123456' or the stored mock OTP)
    const isValidOTP = code === '123456' || code === tokenData.otp;

    if (!isValidOTP) {
      const remainingAttempts = 3 - (attempts + 1);
      return NextResponse.json(
        {
          message: remainingAttempts > 0
            ? `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`
            : 'Invalid OTP. Maximum attempts reached. Please request a new OTP.'
        },
        { status: 401 }
      );
    }

    // Generate session token (in production, create JWT with user session)
    const sessionToken = Buffer.from(JSON.stringify({
      contact: tokenData.contact,
      vertical: tokenData.vertical,
      verified: true,
      timestamp: Date.now(),
      sessionId: Math.random().toString(36).substring(7)
    })).toString('base64');

    // Mock logging (in production, log to database)
    console.log('\n========================================');
    console.log('✅ OTP VERIFIED SUCCESSFULLY');
    console.log('========================================');
    console.log('Contact:', tokenData.contact);
    console.log('Vertical:', tokenData.vertical);
    console.log('Attempts:', attempts + 1);
    console.log('User Agent:', userAgent || 'Unknown');
    console.log('Session Token:', sessionToken);
    console.log('========================================\n');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      sessionToken,
      message: 'OTP verified successfully',
      redirect: `/apply/${tokenData.vertical}/form`
    });

  } catch (error) {
    console.error('Error in /api/otp/verify:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
