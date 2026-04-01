import { NextRequest } from 'next/server';
import {
  extractTokenFromHeader,
  getUserFromToken,
  invalidateAllSessions,
  createAuditLog,
} from '@/lib/auth';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { AuthAPI } from '@/types/api';

/**
 * POST /api/auth/logout
 *
 * Terminate user session by invalidating all JWT sessions.
 * Logs the logout action for audit purposes.
 */
export async function POST(request: NextRequest) {
  try {
    const body: AuthAPI.LogoutRequest = await request.json();
    const { token } = body;

    if (!token) {
      // Even without a token, consider the client "logged out"
      return successResponse({
        success: true,
        message: 'Logged out successfully',
      } as AuthAPI.LogoutResponse);
    }

    // Verify token and get user info
    const user = await getUserFromToken(token);

    if (!user) {
      // Token invalid/expired — still return success for client-side cleanup
      console.log('Token verification failed during logout, continuing anyway');
      return successResponse({
        success: true,
        message: 'Logged out successfully',
      } as AuthAPI.LogoutResponse);
    }

    // Invalidate all sessions for this user
    try {
      await invalidateAllSessions(user.id);
    } catch (err) {
      console.error('Session invalidation error:', err);
      // Don't fail the request
    }

    // Log logout action
    await createAuditLog({
      entityType: 'USER',
      entityId: user.id,
      action: 'LOGOUT',
      performedBy: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    console.log('\n========================================');
    console.log('USER LOGGED OUT (Custom JWT)');
    console.log('========================================');
    console.log('User ID:', user.id);
    console.log('Role:', user.role);
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
