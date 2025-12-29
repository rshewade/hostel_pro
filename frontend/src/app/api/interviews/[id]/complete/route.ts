import { NextRequest } from 'next/server';
import { findById, updateById, insert } from '@/lib/api/db';
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  serverErrorResponse,
  validateFields,
} from '@/lib/api/responses';
import { InterviewAPI, InterviewStatus } from '@/types/api';

/**
 * PUT /api/interviews/[id]/complete
 * Mark interview as completed with final score
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const interview = await findById('interviews', id);

    if (!interview) {
      return notFoundResponse('Interview not found');
    }

    if (interview.status === InterviewStatus.COMPLETED) {
      return badRequestResponse('Interview has already been completed');
    }

    // Update interview
    const updatedInterview = await updateById('interviews', id, {
      final_score,
      internal_remarks,
      status: InterviewStatus.COMPLETED,
    });

    // Log completion
    await insert('auditLogs', {
      id: `audit${Date.now()}`,
      entity_type: 'INTERVIEW',
      entity_id: id,
      action: 'COMPLETE',
      old_value: interview.status,
      new_value: InterviewStatus.COMPLETED,
      performed_by: interview.trustee_id,
      performed_at: new Date().toISOString(),
      metadata: {
        application_id: interview.application_id,
        final_score,
      },
    });

    console.log('\n========================================');
    console.log('✅ INTERVIEW COMPLETED');
    console.log('========================================');
    console.log('Interview ID:', id);
    console.log('Application ID:', interview.application_id);
    console.log('Final Score:', final_score);
    console.log('========================================\n');

    return successResponse({
      data: updatedInterview,
    } as InterviewAPI.CompleteResponse);
  } catch (error: any) {
    console.error('Error in PUT /api/interviews/[id]/complete:', error);
    return serverErrorResponse('Failed to complete interview', error);
  }
}
