import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
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
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
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

    // Find user by email or mobile
    const normalizedInput = username.toLowerCase().trim();
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.${normalizedInput},mobile.eq.${username.replace(/\s/g, '')}`)
      .single();

    if (userError || !user) {
      // Generic error message for security
      return unauthorizedResponse('Invalid credentials');
    }

    // Check user status
    if (!user.is_active) {
      return unauthorizedResponse(
        'Account is inactive. Please contact administration.'
      );
    }

    // In production, use Supabase Auth for password verification
    // For now, we use a mock verification for prototyping
    const isValidPassword = await verifyPassword(password, user);

    if (!isValidPassword) {
      return unauthorizedResponse('Invalid credentials');
    }

    // Check if first-time login (password never changed)
    const requiresPasswordChange = user.requires_password_change || false;

    // Generate session token (mock JWT)
    const token = generateMockToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    // Get user's vertical
    const vertical: Vertical | undefined = user.vertical as Vertical;

    // Log successful login
    await supabase.from('audit_logs').insert({
      entity_type: 'USER',
      entity_id: user.id,
      action: 'LOGIN',
      actor_id: user.id,
      metadata: {
        email: user.email,
        role: user.role,
      },
    });

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
 * Verify password (mock implementation)
 * In production, use Supabase Auth signInWithPassword
 */
async function verifyPassword(
  password: string,
  user: any
): Promise<boolean> {
  // Mock verification for prototyping
  if (process.env.NODE_ENV === 'development') {
    // Check if user has changed their password (stored in metadata)
    if (user.metadata?.password_hash) {
      // Password was changed via first-time-setup, check against stored hash
      return user.metadata.password_hash === `$mock$${password}`;
    }
    // For users who haven't changed password yet, accept "password123"
    return password === 'password123';
  }

  // In production: use Supabase Auth
  return false;
}

/**
 * Generate mock JWT token
 * In production, use proper JWT library or Supabase Auth tokens
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

  return Buffer.from(JSON.stringify(tokenData)).toString('base64');
}
