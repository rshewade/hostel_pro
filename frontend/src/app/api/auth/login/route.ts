import { NextRequest } from 'next/server';
import { findOne } from '@/lib/api/db';
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
 * Returns JWT token and user role for session management.
 *
 * @see Task 7 - Student Login
 * @see .docs/api-routes-audit.md
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

    // Find user by username, email, or mobile
    const user = await findOne('users', (u: any) => {
      const normalizedInput = username.toLowerCase().trim();
      return (
        u.email?.toLowerCase() === normalizedInput ||
        u.mobile_no?.replace(/\s/g, '') === username.replace(/\s/g, '') ||
        u.id === username
      );
    });

    if (!user) {
      // Generic error message for security (don't reveal if user exists)
      return unauthorizedResponse('Invalid credentials');
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      return unauthorizedResponse(
        `Account is ${user.status.toLowerCase()}. Please contact administration.`
      );
    }

    // Verify password (mock implementation)
    // In production, use bcrypt.compare(password, user.password_hash)
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return unauthorizedResponse('Invalid credentials');
    }

    // Check if first-time login (password never changed)
    const requiresPasswordChange = await checkFirstTimeLogin(user.id);

    // Generate session token (mock JWT)
    // In production, use proper JWT library
    const token = generateMockToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    // Get user's vertical (if student)
    let vertical: Vertical | undefined;
    if (user.role === UserRole.STUDENT) {
      const profile = await findOne('profiles', (p: any) => p.user_id === user.id);
      if (profile?.details?.vertical) {
        vertical = profile.details.vertical;
      }
    }

    // Log successful login (audit)
    console.log('\n========================================');
    console.log('✅ LOGIN SUCCESSFUL');
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
      token,
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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Verify password against hash (mock implementation)
 * In production, use: bcrypt.compare(password, hash)
 */
async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  // Mock verification for prototyping
  // In development, accept any password for testing
  // In production, use actual bcrypt comparison
  if (process.env.NODE_ENV === 'development') {
    // For prototyping, accept "password123" or actual hash comparison
    return password === 'password123' || password === hash;
  }

  // In production: return await bcrypt.compare(password, hash);
  return password === hash;
}

/**
 * Check if user needs to change password (first-time login)
 * In production, track this with a database flag
 */
async function checkFirstTimeLogin(userId: string): Promise<boolean> {
  // Mock implementation - check if user has a "first_login" flag
  // In production, maintain a separate field or password_changed_at timestamp
  const user = await findOne('users', (u: any) => u.id === userId);

  // For prototyping, check if user was created recently (within 7 days)
  // and hasn't changed password yet
  if (user?.created_at) {
    const createdDate = new Date(user.created_at);
    const daysSinceCreation =
      (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

    // If account is less than 7 days old, require password change
    // In production, use explicit password_changed_at field
    return daysSinceCreation < 7;
  }

  return false;
}

/**
 * Generate mock JWT token
 * In production, use proper JWT library (jsonwebtoken or jose)
 */
function generateMockToken(payload: {
  userId: string;
  role: string;
  email: string;
}): string {
  const tokenData = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  // Mock token (base64 encoded)
  // In production: jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' })
  return Buffer.from(JSON.stringify(tokenData)).toString('base64');
}
