import { NextRequest } from 'next/server';
import { findOne, updateById, insert } from '@/lib/api/db';
import {
  successResponse,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  validateFields,
} from '@/lib/api/responses';
import { AuthAPI, UserRole } from '@/types/api';

/**
 * POST /api/auth/first-time-setup
 *
 * Handle first-time password change after initial login.
 * Requires valid token from login response.
 * Validates password strength and DPDP consent.
 *
 * @see Task 7 - Student Login, First-Time Setup
 * @see .docs/api-routes-audit.md
 */
export async function POST(request: NextRequest) {
  try {
    const body: AuthAPI.FirstTimeSetupRequest = await request.json();
    const { token, newPassword, dpdpConsent } = body;

    // Validate input
    const validation = validateFields([
      {
        field: 'token',
        value: token,
        rules: [
          {
            type: 'required',
            message: 'Authentication token is required',
          },
        ],
      },
      {
        field: 'newPassword',
        value: newPassword,
        rules: [
          {
            type: 'required',
            message: 'New password is required',
          },
          {
            type: 'min',
            param: 8,
            message: 'Password must be at least 8 characters long',
          },
          {
            type: 'custom',
            message:
              'Password must contain uppercase, lowercase, number, and special character',
            validator: (pwd: string) => {
              return (
                /[A-Z]/.test(pwd) &&
                /[a-z]/.test(pwd) &&
                /[0-9]/.test(pwd) &&
                /[!@#$%^&*]/.test(pwd)
              );
            },
          },
        ],
      },
      {
        field: 'dpdpConsent',
        value: dpdpConsent,
        rules: [
          {
            type: 'custom',
            message: 'DPDP consent is required',
            validator: (value: boolean) => value === true,
          },
        ],
      },
    ]);

    if (!validation.isValid) {
      return badRequestResponse('Validation failed', validation.errors);
    }

    // Verify and decode token
    const tokenData = verifyMockToken(token);
    if (!tokenData) {
      return unauthorizedResponse('Invalid or expired token');
    }

    // Find user
    const user = await findOne('users', (u: any) => u.id === tokenData.userId);

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    // Hash new password (mock implementation)
    // In production, use: bcrypt.hash(newPassword, 10)
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await updateById('users', user.id, {
      password_hash: hashedPassword,
      password_changed_at: new Date().toISOString(),
      first_login_completed: true,
    });

    // Log DPDP consent
    await insert('auditLogs', {
      id: `audit${Date.now()}`,
      entity_type: 'USER',
      entity_id: user.id,
      action: 'DPDP_CONSENT',
      old_value: null,
      new_value: 'ACCEPTED',
      performed_by: user.id,
      performed_at: new Date().toISOString(),
      metadata: {
        consent_type: 'first_login_setup',
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Log password change
    await insert('auditLogs', {
      id: `audit${Date.now() + 1}`,
      entity_type: 'USER',
      entity_id: user.id,
      action: 'PASSWORD_CHANGE',
      old_value: null,
      new_value: 'CHANGED',
      performed_by: user.id,
      performed_at: new Date().toISOString(),
      metadata: {
        change_type: 'first_time_setup',
      },
    });

    console.log('\n========================================');
    console.log('✅ FIRST-TIME SETUP COMPLETED');
    console.log('========================================');
    console.log('User ID:', user.id);
    console.log('Role:', user.role);
    console.log('DPDP Consent:', dpdpConsent);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================\n');

    const response: AuthAPI.FirstTimeSetupResponse = {
      success: true,
      role: user.role as UserRole,
      message: 'Password updated successfully. Redirecting to dashboard...',
    };

    return successResponse(response);
  } catch (error: any) {
    console.error('Error in /api/auth/first-time-setup:', error);
    return serverErrorResponse('Failed to update password', error);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Verify and decode mock JWT token
 * In production, use: jwt.verify(token, SECRET_KEY)
 */
function verifyMockToken(token: string): any {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const tokenData = JSON.parse(decoded);

    // Check expiration
    if (tokenData.exp && tokenData.exp < Date.now()) {
      return null;
    }

    return tokenData;
  } catch (error) {
    return null;
  }
}

/**
 * Hash password (mock implementation)
 * In production, use: bcrypt.hash(password, 10)
 */
async function hashPassword(password: string): Promise<string> {
  // Mock hashing for prototyping
  // In development, just use a simple prefix for testing
  if (process.env.NODE_ENV === 'development') {
    return `$mock$${password}`;
  }

  // In production: return await bcrypt.hash(password, 10);
  return `$mock$${password}`;
}
