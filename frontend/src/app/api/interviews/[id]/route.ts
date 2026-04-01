import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/interviews/[id]
 * Get interview details for an application
 * Auth: TRUSTEE, SUPERINTENDENT
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(_request, ['TRUSTEE', 'SUPERINTENDENT']);
    const { id } = await params;

    const { rows } = await query(
      'SELECT * FROM applications WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      return notFoundResponse('Interview not found');
    }

    const application = rows[0];

    // Format as interview data
    const interview = {
      id: application.id,
      application_id: application.id,
      schedule_time: application.interview_scheduled_at,
      completed_at: application.interview_completed_at,
      status: application.interview_completed_at ? 'COMPLETED' : 'SCHEDULED',
      trustee_id: application.data?.interview?.trustee_id,
      mode: application.data?.interview?.mode,
      internal_remarks: application.data?.interview?.remarks,
      final_score: application.data?.interview?.score,
      application,
    };

    return successResponse({ data: interview });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in GET /api/interviews/[id]:', error);
    return serverErrorResponse('Failed to fetch interview', error);
  }
}

/**
 * PUT /api/interviews/[id]
 * Update interview details
 * Auth: TRUSTEE, SUPERINTENDENT
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request, ['TRUSTEE', 'SUPERINTENDENT']);
    const { id } = await params;
    const body = await request.json();

    // Get existing application
    const { rows } = await query(
      'SELECT * FROM applications WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      return notFoundResponse('Interview not found');
    }

    const application = rows[0];

    // Build update fields
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.schedule_time) {
      setClauses.push(`interview_scheduled_at = $${paramIndex++}`);
      values.push(body.schedule_time);
    }

    // Store additional interview data in the data JSONB field
    if (body.internal_remarks || body.final_score || body.mode || body.trustee_id) {
      const updatedData = {
        ...application.data,
        interview: {
          ...application.data?.interview,
          ...(body.trustee_id && { trustee_id: body.trustee_id }),
          ...(body.mode && { mode: body.mode }),
          ...(body.internal_remarks && { remarks: body.internal_remarks }),
          ...(body.final_score !== undefined && { score: body.final_score }),
        },
      };
      setClauses.push(`data = $${paramIndex++}`);
      values.push(JSON.stringify(updatedData));
    }

    if (setClauses.length === 0) {
      return successResponse({ data: application });
    }

    values.push(id);
    const updateSql = `UPDATE applications SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const { rows: updatedRows } = await query(updateSql, values);

    if (updatedRows.length === 0) {
      return serverErrorResponse('Failed to update interview');
    }

    const updatedApplication = updatedRows[0];

    // Format response as interview
    const interview = {
      id: updatedApplication.id,
      application_id: updatedApplication.id,
      schedule_time: updatedApplication.interview_scheduled_at,
      completed_at: updatedApplication.interview_completed_at,
      status: updatedApplication.interview_completed_at ? 'COMPLETED' : 'SCHEDULED',
      trustee_id: updatedApplication.data?.interview?.trustee_id,
      mode: updatedApplication.data?.interview?.mode,
      internal_remarks: updatedApplication.data?.interview?.remarks,
      final_score: updatedApplication.data?.interview?.score,
    };

    return successResponse({ data: interview });
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in PUT /api/interviews/[id]:', error);
    return serverErrorResponse('Failed to update interview', error);
  }
}
