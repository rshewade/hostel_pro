import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import {
  hashPassword,
  extractTokenFromHeader,
  getUserFromToken,
  createAuditLog,
} from '@/lib/auth';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/responses';

/**
 * POST /api/admin/seed-auth-users
 *
 * Seeds password hashes for existing users who don't have one.
 * Uses direct PostgreSQL INSERT with bcrypt hashing.
 * No Supabase Auth — users.id is the sole identity.
 *
 * IMPORTANT: This endpoint should be protected in production.
 *
 * Request body:
 * {
 *   "adminSecret": "your-admin-secret",
 *   "dryRun": true/false (optional, defaults to true),
 *   "userType": "staff" | "students" | "all" (optional, defaults to "staff")
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminSecret, dryRun = true, userType = 'staff' } = body;

    // Validate admin secret (use environment variable in production)
    const expectedSecret = process.env.ADMIN_SEED_SECRET || 'hostel-admin-seed-2024';
    if (adminSecret !== expectedSecret) {
      return unauthorizedResponse('Invalid admin secret');
    }

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

    console.log('\n========================================');
    console.log(`${dryRun ? 'DRY RUN:' : 'EXECUTING:'} SEED AUTH USERS`);
    console.log('========================================');
    console.log('User type:', userType);
    console.log('Users to process:', usersWithoutAuth.length);
    console.log('========================================\n');

    const results: {
      success: any[];
      failed: any[];
    } = {
      success: [],
      failed: [],
    };

    // For students, fetch their tracking numbers from applications
    const trackingNumberMap: Record<string, string> = {};
    if (userType === 'students' || userType === 'all') {
      const appResult = await query(
        `SELECT student_user_id, tracking_number FROM applications WHERE student_user_id IS NOT NULL`
      );

      for (const app of appResult.rows) {
        if (app.student_user_id && app.tracking_number) {
          trackingNumberMap[app.student_user_id] = app.tracking_number;
        }
      }
    }

    for (const user of usersWithoutAuth) {
      // Generate temporary password based on role
      let tempPassword: string;
      if (user.role === 'STUDENT') {
        const trackingNumber = trackingNumberMap[user.id];
        tempPassword = trackingNumber ? `Hostel@${trackingNumber}` : `Hostel@Student${user.id.slice(-6)}`;
      } else {
        tempPassword = `Staff@${user.role}2024`;
      }

      console.log(`Processing: ${user.full_name} (${user.email}) - Role: ${user.role}`);

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

        console.log(`  Seeded password for: ${user.email}`);
      } catch (error: any) {
        console.error(`Error processing ${user.email}:`, error);
        results.failed.push({
          userId: user.id,
          email: user.email,
          role: user.role,
          error: error.message,
        });
      }
    }

    console.log('\n========================================');
    console.log('SEED COMPLETE');
    console.log('========================================');
    console.log('Success:', results.success.length);
    console.log('Failed:', results.failed.length);
    console.log('========================================\n');

    return successResponse({
      success: true,
      dryRun,
      message: dryRun
        ? `Dry run complete. ${results.success.length} users would be seeded.`
        : `Seed complete. ${results.success.length} users seeded.`,
      results,
    });
  } catch (error: any) {
    console.error('Error in /api/admin/seed-auth-users:', error);
    return serverErrorResponse('Seed operation failed', error);
  }
}

/**
 * GET /api/admin/seed-auth-users
 *
 * Get count of users without password_hash
 */
export async function GET(request: NextRequest) {
  try {
    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      return unauthorizedResponse('Authorization required');
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return unauthorizedResponse('Invalid or expired token');
    }

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
    console.error('Error in GET /api/admin/seed-auth-users:', error);
    return serverErrorResponse('Failed to get user counts', error);
  }
}
