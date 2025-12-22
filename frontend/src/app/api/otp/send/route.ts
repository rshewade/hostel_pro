import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/otp/send
 *
 * Mock endpoint for sending OTP during prototyping phase.
 * In production, this would integrate with SMS/Email service.
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

    // Mock OTP generation (in production, generate random 6-digit code)
    const mockOTP = '123456';

    // Mock token generation (in production, create JWT with contact info and OTP hash)
    const mockToken = Buffer.from(JSON.stringify({
      contact: phone || email,
      vertical,
      timestamp: Date.now(),
      otp: mockOTP // In production, store hashed OTP
    })).toString('base64');

    // Mock logging (in production, log to database and send SMS/Email)
    console.log('\n========================================');
    console.log('📱 MOCK OTP SENT');
    console.log('========================================');
    console.log('Contact:', phone || email);
    console.log('Vertical:', vertical);
    console.log('OTP Code:', mockOTP);
    console.log('Token:', mockToken);
    console.log('Expires In: 600 seconds (10 minutes)');
    console.log('========================================\n');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      token: mockToken,
      expiresIn: 600, // 10 minutes
      message: phone
        ? `OTP sent to ${phone}. Check your SMS messages.`
        : `OTP sent to ${email}. Check your inbox.`,
      // Include OTP in development for easy testing
      ...(process.env.NODE_ENV === 'development' && { devOTP: mockOTP })
    });

  } catch (error) {
    console.error('Error in /api/otp/send:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
