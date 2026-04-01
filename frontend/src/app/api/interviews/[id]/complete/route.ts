import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
  validateFields,
} from '@/lib/api/responses';
import { InterviewAPI, InterviewStatus } from '@/types/api';
import { requireAuth } from '@/lib/authorize';

/**
 * PUT /api/interviews/[id]/complete
 * Mark interview as completed with final score
 * Auth: TRUSTEE only
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request, ['TRUSTEE']);
    const { id } = await params;
    const body: InterviewAPI.CompleteRequest = await request.json();
    const { final_score, internal_remarks } = body;

    // Validate input
    const validation = validateFields([
      {
        field: 'final_score',
        value: final_score,
        rules: [
          { type: 'required', message: 'Final score is required' },
          {
            type: 'custom',
            message: 'Score must be between 0 and 100',
            validator: (score: number) => score >= 0 && score <= 100,
          },
        ],
      },
      {
        field: 'internal_remarks',
        value: internal_remarks,
        rules: [{ type: 'required', message: 'Internal remarks are required' }],
      },
    ]);

    if (!validation.isValid) {
      return badRequestResponse('Validation failed', validation.errors);
    }

    // Find interview
    const { rows } = await query(
      'SELECT * FROM interviews WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      return notFoundResponse('Interview not found');
    }

    const interview = rows[0];

    if (interview.status === InterviewStatus.COMPLETED) {
      return badRequestResponse('Interview has already been completed');
    }

    // Update interview
    const { rows: updatedRows } = await query(
      `UPDATE interviews
       SET final_score = $1, internal_remarks = $2, status = $3
       WHERE id = $4 RETURNING *`,
      [final_score, internal_remarks, InterviewStatus.COMPLETED, id]
    );

    if (updatedRows.length === 0) {
      return serverErrorResponse('Failed to complete interview');
    }

    const updatedInterview = updatedRows[0];

    // Log completion
    await query(
      `INSERT INTO audit_logs (entity_type, entity_id, action, old_value, new_value, actor_id, performed_at, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'INTERVIEW',
        id,
        'COMPLETE',
        interview.status,
        InterviewStatus.COMPLETED,
        interview.trustee_id,
        new Date().toISOString(),
        JSON.stringify({
          application_id: interview.application_id,
          final_score,
        }),
      ]
    );

    console.log('\n========================================');
    console.log('INTERVIEW COMPLETED');
    console.log('========================================');
    console.log('Interview ID:', id);
    console.log('Application ID:', interview.application_id);
    console.log('Final Score:', final_score);
    console.log('========================================\n');

    return successResponse({
      data: updatedInterview,
    } as InterviewAPI.CompleteResponse);
  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    console.error('Error in PUT /api/interviews/[id]/complete:', error);
    return serverErrorResponse('Failed to complete interview', error);
  }
}
