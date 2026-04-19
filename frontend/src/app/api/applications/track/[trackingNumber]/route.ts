import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
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
  _request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await params;

    // Find application by tracking number
    const { rows } = await query(
      'SELECT * FROM applications WHERE tracking_number = $1',
      [trackingNumber]
    );

    if (rows.length === 0) {
      return notFoundResponse(
        `No application found with tracking number: ${trackingNumber}`
      );
    }

    const application = rows[0];

    return successResponse({ data: application } as ApplicationAPI.TrackResponse);
  } catch (error: any) {
    return serverErrorResponse('Failed to track application', error);
  }
}
