import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * GET /api/applications/documents/url
 * Generate a signed URL for viewing/downloading an application document
 * Query params: path (storage path), bucket (bucket id)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const storagePath = searchParams.get('path');
    const bucketId = searchParams.get('bucket') || 'applications-documents';

    if (!storagePath) {
      return NextResponse.json(
        { success: false, error: 'Storage path is required' },
        { status: 400 }
      );
    }

    // Generate signed URL (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketId)
      .createSignedUrl(storagePath, 3600); // 1 hour expiry

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate document URL: ' + signedUrlError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: signedUrlData.signedUrl,
    });
  } catch (error: any) {
    console.error('Error in GET /api/applications/documents/url:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get document URL' },
      { status: 500 }
    );
  }
}
