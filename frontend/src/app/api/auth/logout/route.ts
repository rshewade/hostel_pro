import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { AuthAPI } from '@/types/api';

/**
 * POST /api/auth/logout
 *
 * Terminate user session and invalidate token.
 * Logs the logout action for audit purposes.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body: AuthAPI.LogoutRequest = await request.json();
    const { token } = body;

    if (!token) {
      return unauthorizedResponse('Authentication token is required');
    }

    // Verify and decode token
    const tokenData = verifyMockToken(token);

    if (!tokenData) {
      return unauthorizedResponse('Invalid or expired token');
    }

    // Log logout action
    await supabase.from('audit_logs').insert({
      entity_type: 'USER',
      entity_id: tokenData.userId,
      action: 'LOGOUT',
      actor_id: tokenData.userId,
      metadata: {
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    console.log('\n========================================');
    console.log('👋 USER LOGGED OUT');
    console.log('========================================');
    console.log('User ID:', tokenData.userId);
    console.log('Role:', tokenData.role);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================\n');

    const response: AuthAPI.LogoutResponse = {
      success: true,
      message: 'Logged out successfully',
    };

    return successResponse(response);
  } catch (error: any) {
    console.error('Error in /api/auth/logout:', error);
    return serverErrorResponse('Logout failed', error);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Verify and decode mock JWT token
 */
function verifyMockToken(token: string): any {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const tokenData = JSON.parse(decoded);

    if (tokenData.exp && tokenData.exp < Date.now()) {
      return null;
    }

    return tokenData;
  } catch {
    return null;
  }
}
