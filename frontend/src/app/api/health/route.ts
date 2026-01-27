import { createServerClient } from '@/lib/supabase/server';

/**
 * GET /api/health
 *
 * Health check endpoint to verify:
 * - Environment variables are set
 * - Supabase connection is working
 */
export async function GET() {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {},
  };

  // Check environment variables
  checks.checks.SUPABASE_URL = {
    status: !!process.env.SUPABASE_URL ? 'OK' : 'MISSING',
    value: process.env.SUPABASE_URL
      ? process.env.SUPABASE_URL.substring(0, 40) + '...'
      : null,
  };

  checks.checks.SUPABASE_SERVICE_ROLE_KEY = {
    status: !!process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING',
    value: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? '***' + process.env.SUPABASE_SERVICE_ROLE_KEY.slice(-10)
      : null,
  };

  // Test Supabase connection
  try {
    const supabase = createServerClient();

    // Simple query to test connection
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      checks.checks.supabase_connection = {
        status: 'ERROR',
        error: error.message,
        code: error.code,
      };
    } else {
      checks.checks.supabase_connection = {
        status: 'OK',
        message: 'Connected to Supabase successfully',
      };
    }

    // Test auth service
    const { error: authError } = await supabase.auth.getSession();
    checks.checks.supabase_auth = {
      status: authError ? 'ERROR' : 'OK',
      error: authError?.message || null,
    };

  } catch (error: any) {
    checks.checks.supabase_connection = {
      status: 'ERROR',
      error: error.message,
    };
  }

  // Overall status
  const allOk = Object.values(checks.checks).every(
    (check: any) => check.status === 'OK'
  );
  checks.status = allOk ? 'healthy' : 'unhealthy';

  return Response.json(checks, {
    status: allOk ? 200 : 503
  });
}
