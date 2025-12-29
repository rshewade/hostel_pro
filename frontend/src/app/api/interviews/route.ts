import { NextRequest } from 'next/server';
import { getCollection, insert, generateId, validateReference } from '@/lib/api/db';
import {
  successResponse,
  createdResponse,
  badRequestResponse,
  serverErrorResponse,
  paginatedResponse,
  validateFields,
} from '@/lib/api/responses';
import { InterviewAPI, InterviewStatus } from '@/types/api';

/**
 * GET /api/interviews
 * List all interviews with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('application_id');
    const trusteeId = searchParams.get('trustee_id');
    const status = searchParams.get('status') as InterviewStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let interviews = await getCollection('interviews');

    // Apply filters
    if (applicationId) {
      interviews = interviews.filter((i: any) => i.application_id === applicationId);
    }

    if (trusteeId) {
      interviews = interviews.filter((i: any) => i.trustee_id === trusteeId);
    }

    if (status) {
      interviews = interviews.filter((i: any) => i.status === status);
    }

    // Sort by schedule time (descending)
    interviews.sort((a: any, b: any) => {
      return new Date(b.schedule_time).getTime() - new Date(a.schedule_time).getTime();
    });

    // Paginate
    const total = interviews.length;
    const start = (page - 1) * limit;
    const paginatedInterviews = interviews.slice(start, start + limit);

    return paginatedResponse(paginatedInterviews, page, limit, total);
  } catch (error: any) {
    console.error('Error in GET /api/interviews:', error);
    return serverErrorResponse('Failed to fetch interviews', error);
  }
}

/**
 * POST /api/interviews
 * Create a new interview
 */
export async function POST(request: NextRequest) {
  try {
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
        field: 'trustee_id',
        value: trustee_id,
        rules: [{ type: 'required', message: 'Trustee ID is required' }],
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

    // Validate references
    const applicationExists = await validateReference('applications', application_id);
    if (!applicationExists) {
      return badRequestResponse('Invalid application ID');
    }

    const trusteeExists = await validateReference('users', trustee_id);
    if (!trusteeExists) {
      return badRequestResponse('Invalid trustee ID');
    }

    // Create interview
    const newInterview = {
      id: generateId('int'),
      application_id,
      trustee_id,
      schedule_time,
      mode,
      internal_remarks: '',
      final_score: null,
      status: InterviewStatus.SCHEDULED,
    };

    await insert('interviews', newInterview);

    console.log('\n========================================');
    console.log('📅 INTERVIEW SCHEDULED');
    console.log('========================================');
    console.log('Interview ID:', newInterview.id);
    console.log('Application ID:', application_id);
    console.log('Trustee ID:', trustee_id);
    console.log('Schedule Time:', schedule_time);
    console.log('Mode:', mode);
    console.log('========================================\n');

    return createdResponse(
      { data: newInterview } as InterviewAPI.CreateResponse,
      'Interview scheduled successfully'
    );
  } catch (error: any) {
    console.error('Error in POST /api/interviews:', error);
    return serverErrorResponse('Failed to create interview', error);
  }
}
