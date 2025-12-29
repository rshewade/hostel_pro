import { NextRequest } from 'next/server';
import { findOne } from '@/lib/api/db';
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/responses';
import { ApplicationAPI } from '@/types/api';

/**
 * GET /api/applications/track/[trackingNumber]
 * Track application status by tracking number
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await params;

    // Find application by tracking number
    const application = await findOne(
      'applications',
      (app: any) => app.tracking_number === trackingNumber
    );

    if (!application) {
      return notFoundResponse(
        `No application found with tracking number: ${trackingNumber}`
      );
    }

    console.log('\n========================================');
    console.log('🔍 APPLICATION TRACKED');
    console.log('========================================');
    console.log('Tracking Number:', trackingNumber);
    console.log('Status:', application.current_status);
    console.log('Vertical:', application.vertical);
    console.log('Submitted At:', application.submitted_at || 'Not submitted');
    console.log('========================================\n');

    return successResponse({ data: application } as ApplicationAPI.TrackResponse);
  } catch (error: any) {
    console.error('Error in GET /api/applications/track/[trackingNumber]:', error);
    return serverErrorResponse('Failed to track application', error);
  }
}
