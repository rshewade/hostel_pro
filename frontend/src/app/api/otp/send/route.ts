import { NextRequest, NextResponse } from 'next/server';
import { createOtp } from '@/lib/auth';

/**
 * POST /api/otp/send
 *
 * Send OTP for application or parent login flows.
 * Uses DB-backed OTP storage via createOtp().
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

    // Create OTP in DB
    const otp = await createOtp(contact, 'application');

    // Generate session token as base64 JSON (keeps existing contract)
    const sessionToken = Buffer.from(JSON.stringify({
      contact,
      vertical,
      timestamp: Date.now(),
    })).toString('base64');

    // In production, send OTP via SMS/Email service
    console.log('\n========================================');
    console.log('OTP SENT (DB-backed)');
    console.log('========================================');
    console.log('Contact:', contact);
    console.log('Vertical:', vertical);
    console.log('OTP Code:', otp);
    console.log('Expires In: 300 seconds (5 minutes)');
    console.log('========================================\n');

    return NextResponse.json({
      success: true,
      token: sessionToken,
      expiresIn: 300, // 5 minutes (matches OTP_EXPIRY_MINUTES in auth.ts)
      message: phone
        ? `OTP sent to ${phone}. Check your SMS messages.`
        : `OTP sent to ${email}. Check your inbox.`,
      // Include OTP in development for easy testing
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
    });

  } catch (error) {
    console.error('Error in /api/otp/send:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
