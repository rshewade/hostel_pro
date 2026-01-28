import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/responses';

/**
 * POST /api/admin/seed-auth-users
 *
 * Creates Supabase Auth users for existing users in public.users
 * who don't have auth_user_id set. This is a one-time migration script.
 *
 * IMPORTANT: This endpoint should be protected in production.
 * For now, it requires an admin secret in the request body.
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
    const supabase = createServerClient();
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

    // Find all users without auth_user_id
    const { data: usersWithoutAuth, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .is('auth_user_id', null)
      .in('role', rolesToProcess);

    if (fetchError) {
      console.error('Failed to fetch users:', fetchError);
      return serverErrorResponse('Failed to fetch users', fetchError);
    }

    if (!usersWithoutAuth || usersWithoutAuth.length === 0) {
      return successResponse({
        success: true,
        message: `No ${userType} users found without auth_user_id`,
        usersProcessed: 0,
      });
    }

    console.log('\n========================================');
    console.log(`${dryRun ? '🔍 DRY RUN:' : '🚀 EXECUTING:'} SEED AUTH USERS`);
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
      const { data: applications } = await supabase
        .from('applications')
        .select('student_user_id, tracking_number')
        .not('student_user_id', 'is', null);

      if (applications) {
        for (const app of applications) {
          if (app.student_user_id && app.tracking_number) {
            trackingNumberMap[app.student_user_id] = app.tracking_number;
          }
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
        // Create Supabase Auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: user.full_name,
            role: user.role,
            vertical: user.vertical,
          },
        });

        if (authError) {
          console.error(`Failed to create auth user for ${user.email}:`, authError);
          results.failed.push({
            userId: user.id,
            email: user.email,
            role: user.role,
            error: authError.message,
          });
          continue;
        }

        // Update public.users with auth_user_id
        const { error: updateError } = await supabase
          .from('users')
          .update({
            auth_user_id: authData.user.id,
            requires_password_change: true,
            metadata: {
              ...(user.metadata || {}),
              migrated_to_supabase_auth: new Date().toISOString(),
              temp_password_hint: `Staff@{role}2024`,
            },
          })
          .eq('id', user.id);

        if (updateError) {
          console.error(`Failed to update user ${user.id}:`, updateError);
          // Rollback: delete the auth user
          await supabase.auth.admin.deleteUser(authData.user.id);
          results.failed.push({
            userId: user.id,
            email: user.email,
            role: user.role,
            error: `Update failed: ${updateError.message}`,
          });
          continue;
        }

        // Log the migration
        await supabase.from('audit_logs').insert({
          entity_type: 'USER',
          entity_id: user.id,
          action: 'AUTH_MIGRATION',
          metadata: {
            auth_user_id: authData.user.id,
            migration_type: 'staff_seed',
            role: user.role,
          },
        });

        results.success.push({
          userId: user.id,
          email: user.email,
          role: user.role,
          authUserId: authData.user.id,
          tempPassword,
        });

        console.log(`  ✅ Created auth user: ${authData.user.id}`);
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
        ? `Dry run complete. ${results.success.length} users would be migrated.`
        : `Migration complete. ${results.success.length} users migrated.`,
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
 * Get count of staff users without auth_user_id
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();

    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse('Authorization required');
    }

    // Count users without auth_user_id
    const { data: staffWithoutAuth } = await supabase
      .from('users')
      .select('id, full_name, email, role, vertical', { count: 'exact' })
      .is('auth_user_id', null)
      .in('role', ['SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS']);

    const { data: studentsWithoutAuth } = await supabase
      .from('users')
      .select('id, full_name, email, role, vertical', { count: 'exact' })
      .is('auth_user_id', null)
      .eq('role', 'STUDENT');

    return successResponse({
      success: true,
      staffWithoutAuth: {
        count: staffWithoutAuth?.length || 0,
        users: staffWithoutAuth || [],
      },
      studentsWithoutAuth: {
        count: studentsWithoutAuth?.length || 0,
        users: studentsWithoutAuth || [],
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/seed-auth-users:', error);
    return serverErrorResponse('Failed to get user counts', error);
  }
}
