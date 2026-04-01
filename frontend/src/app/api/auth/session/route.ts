import { NextRequest } from 'next/server';
import { extractTokenFromHeader, getUserFromToken } from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { AuthAPI, UserRole, Vertical } from '@/types/api';

/**
 * GET /api/auth/session
 *
 * Validate current JWT session and return user information.
 * Used by frontend to check if user is authenticated.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return unauthorizedResponse('No authentication token provided');
    }

    const user = await getUserFromToken(token);

    if (!user) {
      return unauthorizedResponse('Invalid or expired session');
    }

    if (!user.is_active) {
      return unauthorizedResponse(
        'Account is inactive. Please contact administration.'
      );
    }

    const response: AuthAPI.SessionResponse = {
      success: true,
      userId: user.id,
      role: user.role as UserRole,
      ...(user.vertical && { vertical: user.vertical as Vertical }),
    };

    return successResponse(response);
  } catch (error: any) {
    console.error('Error in /api/auth/session:', error);
    return serverErrorResponse('Session validation failed', error);
  }
}

/**
 * POST /api/auth/session (Alternative for clients that can't use GET with body)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return unauthorizedResponse('Authentication token is required');
    }

    const user = await getUserFromToken(token);

    if (!user) {
      return unauthorizedResponse('Invalid or expired session');
    }

    if (!user.is_active) {
      return unauthorizedResponse(
        'Account is inactive. Please contact administration.'
      );
    }

    const response: AuthAPI.SessionResponse = {
      success: true,
      userId: user.id,
      role: user.role as UserRole,
      ...(user.vertical && { vertical: user.vertical as Vertical }),
    };

    return successResponse(response);
  } catch (error: any) {
    console.error('Error in /api/auth/session:', error);
    return serverErrorResponse('Session validation failed', error);
  }
}
