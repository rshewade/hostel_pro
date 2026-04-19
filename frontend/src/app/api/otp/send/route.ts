import { NextRequest, NextResponse } from 'next/server';
import { sendOtp } from '@/lib/msg91';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

/**
 * POST /api/otp/send
 *
 * Send OTP for application or parent login flows.
 * Uses MSG91 OTP API for generation and delivery.
 *
 * Request body:
 * - phone?: string - Mobile number (for SMS OTP)
 * - email?: string - Email address (for Email OTP)
 * - vertical: string - Application vertical (boys-hostel, girls-ashram, dharamshala)
 *
 * Response:
 * - Success: 200 with { success: true, token: string, expiresIn: number }
 * - Error: 400/500 with { message: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 OTP requests per 15 minutes per IP
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`otp-send:${ip}`, { maxRequests: 3, windowSeconds: 900 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: `Too many OTP requests. Try again in ${rateLimit.retryAfterSeconds} seconds.` },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      );
    }

    const body = await request.json();
    const { phone, email, vertical } = body;

    // Validate input
    if (!phone && !email) {
      return NextResponse.json(
        { message: 'Either phone or email is required' },
        { status: 400 }
      );
    }

    if (!vertical) {
      return NextResponse.json(
        { message: 'Vertical is required' },
        { status: 400 }
      );
    }

    // Validate phone format (if provided)
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { message: 'Invalid phone number format. Must be 10 digits starting with 6-9.' },
        { status: 400 }
      );
    }

    // Validate email format (if provided)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    const contact = phone || email;

    // Send OTP via MSG91
    const msg91Result = await sendOtp(phone, email);

    if (!msg91Result.success) {
      logger.error('OTP send failed via MSG91', { contact, error: msg91Result.message });
      return NextResponse.json(
        { message: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    // Generate session token as base64 JSON (keeps existing contract)
    const sessionToken = Buffer.from(JSON.stringify({
      contact,
      vertical,
      timestamp: Date.now(),
    })).toString('base64');

    return NextResponse.json({
      success: true,
      token: sessionToken,
      expiresIn: 300, // 5 minutes (MSG91 default OTP expiry)
      message: phone
        ? `OTP sent to ${phone}. Check your SMS messages.`
        : `OTP sent to ${email}. Check your inbox.`,
    });

  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('OTP send failed', { route: '/api/otp/send', error: errMsg });
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
