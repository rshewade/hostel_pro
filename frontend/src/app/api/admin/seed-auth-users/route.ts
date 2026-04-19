import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  hashPassword,
  createAuditLog,
  generateSecureTempPassword,
} from '@/lib/auth';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { requireAuth } from '@/lib/authorize';
import { logger } from '@/lib/logger';

/**
 * POST /api/admin/seed-auth-users
 *
 * Seeds password hashes for existing users who don't have one.
 * Auth: TRUSTEE only (highest authority since ADMIN role was removed)
 *
 * Request body:
 * {
 *   "dryRun": true/false (optional, defaults to true),
 *   "userType": "staff" | "students" | "all" (optional, defaults to "staff")
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request, ['TRUSTEE']);
    const body = await request.json();
    const { dryRun = true, userType = 'staff' } = body;

    // Determine which roles to process
    let rolesToProcess: string[] = [];
    if (userType === 'staff') {
      rolesToProcess = ['SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS'];
    } else if (userType === 'students') {
      rolesToProcess = ['STUDENT'];
    } else if (userType === 'all') {
      rolesToProcess = ['SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS', 'STUDENT'];
    } else {
      rolesToProcess = ['SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS'];
    }

    // Find all users without password_hash
    const usersResult = await query(
      `SELECT * FROM users WHERE password_hash IS NULL AND role = ANY($1)`,
      [rolesToProcess]
    );

    const usersWithoutAuth = usersResult.rows;

    if (usersWithoutAuth.length === 0) {
      return successResponse({
        success: true,
        message: `No ${userType} users found without password_hash`,
        usersProcessed: 0,
      });
    }

    logger.info('Seed auth users started', {
      dryRun,
      userType,
      count: usersWithoutAuth.length,
      performedBy: authUser.id,
    });

    const results: {
      success: Array<{ userId: string; email: string; role: string; tempPassword?: string; status?: string }>;
      failed: Array<{ userId: string; email: string; role: string; error: string }>;
    } = {
      success: [],
      failed: [],
    };

    for (const user of usersWithoutAuth) {
      // Generate cryptographically secure temporary password per user
      const tempPassword = generateSecureTempPassword();

      if (dryRun) {
        results.success.push({
          userId: user.id,
          email: user.email,
          role: user.role,
          tempPassword,
          status: 'DRY_RUN',
        });
        continue;
      }

      try {
        // Hash the temporary password
        const passwordHash = await hashPassword(tempPassword);

        // Update user with password_hash
        await query(
          `UPDATE users
           SET password_hash = $1,
               requires_password_change = true,
               metadata = COALESCE(metadata, '{}'::jsonb)
                 || jsonb_build_object('seeded_at', $2::text),
               updated_at = NOW()
           WHERE id = $3`,
          [passwordHash, new Date().toISOString(), user.id]
        );

        // Log the seeding
        await createAuditLog({
          entityType: 'USER',
          entityId: user.id,
          action: 'AUTH_MIGRATION',
          performedBy: authUser.id,
          metadata: {
            migration_type: 'password_seed',
            role: user.role,
          },
        });

        results.success.push({
          userId: user.id,
          email: user.email,
          role: user.role,
          tempPassword,
        });
      } catch (error: any) {
        logger.error('Seed password failed for user', { userId: user.id, error: error.message });
        results.failed.push({
          userId: user.id,
          email: user.email,
          role: user.role,
          error: error.message,
        });
      }
    }

    logger.info('Seed auth users complete', {
      success: results.success.length,
      failed: results.failed.length,
      performedBy: authUser.id,
    });

    return successResponse({
      success: true,
      dryRun,
      message: dryRun
        ? `Dry run complete. ${results.success.length} users would be seeded.`
        : `Seed complete. ${results.success.length} users seeded.`,
      results,
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    logger.error('Seed operation failed', { error: error.message });
    return serverErrorResponse('Seed operation failed', error);
  }
}

/**
 * GET /api/admin/seed-auth-users
 *
 * Get count of users without password_hash
 * Auth: TRUSTEE only
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request, ['TRUSTEE']);

    // Count staff without password_hash
    const staffResult = await query(
      `SELECT id, full_name, email, role, vertical FROM users
       WHERE password_hash IS NULL AND role IN ('SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS')`
    );

    // Count students without password_hash
    const studentResult = await query(
      `SELECT id, full_name, email, role, vertical FROM users
       WHERE password_hash IS NULL AND role = 'STUDENT'`
    );

    return successResponse({
      success: true,
      staffWithoutAuth: {
        count: staffResult.rows.length,
        users: staffResult.rows,
      },
      studentsWithoutAuth: {
        count: studentResult.rows.length,
        users: studentResult.rows,
      },
    });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return serverErrorResponse('Failed to get user counts', error);
  }
}
