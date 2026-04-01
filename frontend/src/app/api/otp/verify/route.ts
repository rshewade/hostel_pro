import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/auth';

/**
 * POST /api/otp/verify
 *
 * Verify OTP for application or parent login flows.
 * Uses DB-backed OTP verification via verifyOtp().
 *
 * Request body:
 * - code: string - 6-digit OTP code
 * - token: string - Token from /api/otp/send response
 * - attempts: number - Number of verification attempts (client-side tracking)
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

    // Decode token to get contact and vertical
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

    // Verify OTP via DB
    const otpResult = await verifyOtp(tokenData.contact, code, 'application');

    if (!otpResult.valid) {
      return NextResponse.json(
        { message: otpResult.error || 'Invalid OTP code' },
        { status: 401 }
      );
    }

    // Generate session token (keeps existing contract)
    const sessionToken = Buffer.from(JSON.stringify({
      contact: tokenData.contact,
      vertical: tokenData.vertical,
      verified: true,
      timestamp: Date.now(),
      sessionId: Math.random().toString(36).substring(7)
    })).toString('base64');

    // Log verification
    console.log('\n========================================');
    console.log('OTP VERIFIED SUCCESSFULLY (DB-backed)');
    console.log('========================================');
    console.log('Contact:', tokenData.contact);
    console.log('Vertical:', tokenData.vertical);
    console.log('Attempts:', (attempts || 0) + 1);
    console.log('User Agent:', userAgent || 'Unknown');
    console.log('========================================\n');

    // Determine redirect based on vertical
    const redirect = tokenData.vertical === 'parent'
      ? '/dashboard/parent'
      : `/apply/${tokenData.vertical}/form`;

    return NextResponse.json({
      success: true,
      sessionToken,
      message: 'OTP verified successfully',
      redirect
    });

  } catch (error) {
    console.error('Error in /api/otp/verify:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
