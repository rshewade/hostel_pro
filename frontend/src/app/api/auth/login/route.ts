import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { comparePassword, createSession, createAuditLog } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  validateFields,
} from '@/lib/api/responses';
import { AuthAPI, UserRole, Vertical } from '@/types/api';

/**
 * POST /api/auth/login
 *
 * Authenticate user with username/email/mobile and password.
 * Uses custom PostgreSQL + JWT for secure password verification.
 * Returns JWT access token and user role for session management.
 */
export async function POST(request: NextRequest) {
  try {
    const body: AuthAPI.LoginRequest = await request.json();
    const { username, password } = body;

    // Validate input
    const validation = validateFields([
      {
        field: 'username',
        value: username,
        rules: [
          {
            type: 'required',
            message: 'Username, email, or mobile number is required',
          },
        ],
      },
      {
        field: 'password',
        value: password,
        rules: [
          {
            type: 'required',
            message: 'Password is required',
          },
        ],
      },
    ]);

    if (!validation.isValid) {
      return badRequestResponse('Validation failed', validation.errors);
    }

    // Find user by email or mobile in users table
    const normalizedInput = username.toLowerCase().trim();
    const normalizedMobile = username.replace(/\s/g, '');
    console.log('[LOGIN] Attempting login for:', normalizedInput);

    const userResult = await query(
      `SELECT * FROM users WHERE LOWER(email) = $1 OR mobile = $2 LIMIT 1`,
      [normalizedInput, normalizedMobile]
    );

    const user = userResult.rows[0];

    if (!user) {
      console.error('[LOGIN] User not found:', normalizedInput);
      return unauthorizedResponse('Invalid credentials');
    }

    console.log('[LOGIN] User found:', user.id, user.email);

    // Check user status
    if (!user.is_active) {
      console.error('[LOGIN] User inactive:', user.id);
      return unauthorizedResponse(
        'Account is inactive. Please contact administration.'
      );
    }

    // Check if user has a password_hash set
    if (!user.password_hash) {
      console.error('[LOGIN] User missing password_hash:', user.id, user.email);
      return unauthorizedResponse(
        'Account not configured. Please contact administration.'
      );
    }

    // Verify password using bcrypt
    console.log('[LOGIN] Verifying password for:', user.email);
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      console.error('[LOGIN] Password mismatch for:', user.email);
      return unauthorizedResponse('Invalid credentials');
    }

    console.log('[LOGIN] Password verified for:', user.email);

    // Check if first-time login (password never changed)
    const requiresPasswordChange = user.requires_password_change || false;

    // Create JWT session
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const { accessToken } = await createSession(user.id, ip, userAgent);

    // Get user's vertical
    const vertical: Vertical | undefined = user.vertical as Vertical;

    // Log successful login
    await createAuditLog({
      entityType: 'USER',
      entityId: user.id,
      action: 'LOGIN',
      performedBy: user.id,
      ipAddress: ip,
      userAgent,
      metadata: {
        email: user.email,
        role: user.role,
      },
    });

    console.log('\n========================================');
    console.log('LOGIN SUCCESSFUL (Custom JWT)');
    console.log('========================================');
    console.log('User ID:', user.id);
    console.log('Role:', user.role);
    console.log('Email:', user.email);
    console.log('Requires Password Change:', requiresPasswordChange);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================\n');

    const response: AuthAPI.LoginResponse = {
      success: true,
      role: user.role as UserRole,
      token: accessToken,
      userId: user.id,
      requiresPasswordChange,
      ...(vertical && { vertical }),
      message: requiresPasswordChange
        ? 'Login successful. Please change your password.'
        : 'Login successful',
    };

    return successResponse(response);
  } catch (error: any) {
    console.error('Error in /api/auth/login:', error);
    return serverErrorResponse('Login failed', error);
  }
}
