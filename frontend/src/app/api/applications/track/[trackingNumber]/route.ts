import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
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
    const supabase = createServerClient();
    const { trackingNumber } = await params;

    // Find application by tracking number
    const { data: application, error } = await supabase
      .from('applications')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .single();

    if (error || !application) {
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
