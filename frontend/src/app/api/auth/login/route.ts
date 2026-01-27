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
 * Uses Supabase Auth for secure password verification.
 * Returns Supabase session token and user role for session management.
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

    // Find user by email or mobile in public.users
    const normalizedInput = username.toLowerCase().trim();
    console.log('[LOGIN] Attempting login for:', normalizedInput);

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.${normalizedInput},mobile.eq.${username.replace(/\s/g, '')}`)
      .single();

    if (userError || !user) {
      console.error('[LOGIN] User not found:', normalizedInput, 'Error:', userError?.message);
      return unauthorizedResponse('Invalid credentials');
    }

    console.log('[LOGIN] User found:', user.id, user.email, 'auth_user_id:', user.auth_user_id);

    // Check user status
    if (!user.is_active) {
      console.error('[LOGIN] User inactive:', user.id);
      return unauthorizedResponse(
        'Account is inactive. Please contact administration.'
      );
    }

    // Check if user has auth_user_id (linked to Supabase Auth)
    if (!user.auth_user_id) {
      console.error('[LOGIN] User missing auth_user_id:', user.id, user.email);
      return unauthorizedResponse(
        'Account not properly configured. Please contact administration.'
      );
    }

    // Verify password using Supabase Auth
    console.log('[LOGIN] Verifying password with Supabase Auth for:', user.email);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password,
    });

    if (authError || !authData.session) {
      console.error('[LOGIN] Supabase Auth failed:', authError?.message, 'Code:', authError?.status);
      return unauthorizedResponse('Invalid credentials');
    }

    console.log('[LOGIN] Supabase Auth successful for:', user.email);

    // Check if first-time login (password never changed)
    const requiresPasswordChange = user.requires_password_change || false;

    // Use Supabase session access_token
    const token = authData.session.access_token;

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
        auth_user_id: user.auth_user_id,
      },
    });

    console.log('\n========================================');
    console.log('✅ LOGIN SUCCESSFUL (Supabase Auth)');
    console.log('========================================');
    console.log('User ID:', user.id);
    console.log('Auth User ID:', user.auth_user_id);
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
