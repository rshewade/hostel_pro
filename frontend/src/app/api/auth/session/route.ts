import { NextRequest } from 'next/server';
import { findOne } from '@/lib/api/db';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { AuthAPI, UserRole, Vertical } from '@/types/api';

/**
 * GET /api/auth/session
 *
 * Validate current session and return user information.
 * Used by frontend to check if user is authenticated.
 *
 * @see Task 7 - Student Login (Session Handling)
 * @see .docs/api-routes-audit.md
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse('No authentication token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify and decode token
    const tokenData = verifyMockToken(token);

    if (!tokenData) {
      return unauthorizedResponse('Invalid or expired session');
    }

    // Verify user still exists and is active
    const user = await findOne('users', (u: any) => u.id === tokenData.userId);

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    if (user.status !== 'ACTIVE') {
      return unauthorizedResponse(
        `Account is ${user.status.toLowerCase()}. Please contact administration.`
      );
    }

    // Get user's vertical (if student)
    let vertical: Vertical | undefined;
    if (user.role === UserRole.STUDENT) {
      const student = await findOne('students', (s: any) => s.user_id === user.id);
      if (student?.vertical) {
        // Map vertical names to enum values
        const verticalMap: Record<string, Vertical> = {
          'Boys Hostel': Vertical.BOYS_HOSTEL,
          'Girls Ashram': Vertical.GIRLS_ASHRAM,
          'Dharamshala': Vertical.DHARAMSHALA,
        };
        vertical = verticalMap[student.vertical] || student.vertical;
      }
    }

    const response: AuthAPI.SessionResponse = {
      success: true,
      userId: user.id,
      role: user.role as UserRole,
      ...(vertical && { vertical }),
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

    // Verify and decode token
    const tokenData = verifyMockToken(token);

    if (!tokenData) {
      return unauthorizedResponse('Invalid or expired session');
    }

    // Verify user still exists and is active
    const user = await findOne('users', (u: any) => u.id === tokenData.userId);

    if (!user) {
      return unauthorizedResponse('User not found');
    }

    if (user.status !== 'ACTIVE') {
      return unauthorizedResponse(
        `Account is ${user.status.toLowerCase()}. Please contact administration.`
      );
    }

    // Get user's vertical (if student)
    let vertical: Vertical | undefined;
    if (user.role === UserRole.STUDENT) {
      const student = await findOne('students', (s: any) => s.user_id === user.id);
      if (student?.vertical) {
        // Map vertical names to enum values
        const verticalMap: Record<string, Vertical> = {
          'Boys Hostel': Vertical.BOYS_HOSTEL,
          'Girls Ashram': Vertical.GIRLS_ASHRAM,
          'Dharamshala': Vertical.DHARAMSHALA,
        };
        vertical = verticalMap[student.vertical] || student.vertical;
      }
    }

    const response: AuthAPI.SessionResponse = {
      success: true,
      userId: user.id,
      role: user.role as UserRole,
      ...(vertical && { vertical }),
    };

    return successResponse(response);
  } catch (error: any) {
    console.error('Error in /api/auth/session:', error);
    return serverErrorResponse('Session validation failed', error);
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
