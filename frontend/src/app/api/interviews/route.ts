import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  serverErrorResponse,
  paginatedResponse,
  validateFields,
} from '@/lib/api/responses';
import { InterviewAPI, InterviewStatus } from '@/types/api';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/interviews
 * List all applications with interviews (status = INTERVIEW or with interview data)
 * Auth: TRUSTEE, SUPERINTENDENT
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['TRUSTEE', 'SUPERINTENDENT']);
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('application_id');
    const status = searchParams.get('status') as InterviewStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const conditions: string[] = ['interview_scheduled_at IS NOT NULL'];
    const params: any[] = [];
    let paramIndex = 1;

    if (applicationId) {
      conditions.push(`id = $${paramIndex++}`);
      params.push(applicationId);
    }

    if (status === 'SCHEDULED') {
      conditions.push(`current_status = 'INTERVIEW'`);
    } else if (status === 'COMPLETED') {
      conditions.push('interview_completed_at IS NOT NULL');
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Get total count
    const { rows: countRows } = await query(
      `SELECT COUNT(*) AS count FROM applications ${whereClause}`,
      params
    );
    const total = parseInt(countRows[0]?.count || '0', 10);

    // Get paginated results
    const { rows: interviews } = await query(
      `SELECT * FROM applications ${whereClause}
       ORDER BY interview_scheduled_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    // Transform applications to interview format
    const formattedInterviews = (interviews || []).map((app: any) => ({
      id: app.id,
      application_id: app.id,
      schedule_time: app.interview_scheduled_at,
      completed_at: app.interview_completed_at,
      status: app.interview_completed_at ? 'COMPLETED' : 'SCHEDULED',
      application: app,
    }));

    return paginatedResponse(formattedInterviews, page, limit, total);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/interviews:', error);
    return serverErrorResponse('Failed to fetch interviews', error);
  }
}

/**
 * POST /api/interviews
 * Schedule an interview for an application
 * Auth: TRUSTEE, SUPERINTENDENT
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['TRUSTEE', 'SUPERINTENDENT']);
    const body: InterviewAPI.CreateRequest = await request.json();
    const { application_id, trustee_id, schedule_time, mode } = body;

    // Validate input
    const validation = validateFields([
      {
        field: 'application_id',
        value: application_id,
        rules: [{ type: 'required', message: 'Application ID is required' }],
      },
      {
        field: 'schedule_time',
        value: schedule_time,
        rules: [{ type: 'required', message: 'Schedule time is required' }],
      },
      {
        field: 'mode',
        value: mode,
        rules: [{ type: 'required', message: 'Interview mode is required' }],
      },
    ]);

    if (!validation.isValid) {
      return badRequestResponse('Validation failed', validation.errors);
    }

    // Validate application exists
    const { rows: appRows } = await query(
      'SELECT * FROM applications WHERE id = $1',
      [application_id]
    );

    if (appRows.length === 0) {
      return badRequestResponse('Invalid application ID');
    }

    const application = appRows[0];

    // Validate trustee exists if provided
    if (trustee_id) {
      const { rows: trusteeRows } = await query(
        "SELECT id FROM users WHERE id = $1 AND role = 'TRUSTEE'",
        [trustee_id]
      );

      if (trusteeRows.length === 0) {
        return badRequestResponse('Invalid trustee ID');
      }
    }

    // Update application with interview data
    const updatedData = {
      ...application.data,
      interview: {
        trustee_id,
        mode,
        scheduled_at: schedule_time,
      },
    };

    const { rows: updatedRows } = await query(
      `UPDATE applications
       SET current_status = 'INTERVIEW', interview_scheduled_at = $1, data = $2
       WHERE id = $3 RETURNING *`,
      [schedule_time, JSON.stringify(updatedData), application_id]
    );

    if (updatedRows.length === 0) {
      return serverErrorResponse('Failed to schedule interview');
    }

    // Log interview scheduling
    await query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, metadata)
       VALUES ($1, $2, $3, $4)`,
      [
        'APPLICATION',
        application_id,
        'INTERVIEW_SCHEDULED',
        JSON.stringify({
          tracking_number: application.tracking_number,
          schedule_time,
          mode,
          trustee_id,
        }),
      ]
    );

    console.log('\n========================================');
    console.log('INTERVIEW SCHEDULED');
    console.log('========================================');
    console.log('Application ID:', application_id);
    console.log('Trustee ID:', trustee_id);
    console.log('Schedule Time:', schedule_time);
    console.log('Mode:', mode);
    console.log('========================================\n');

    return createdResponse(
      {
        data: {
          id: application_id,
          application_id,
          trustee_id,
          schedule_time,
          mode,
          status: InterviewStatus.SCHEDULED,
        },
      } as InterviewAPI.CreateResponse,
      'Interview scheduled successfully'
    );
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in POST /api/interviews:', error);
    return serverErrorResponse('Failed to create interview', error);
  }
}
