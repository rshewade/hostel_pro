import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * GET /api/student/documents/[id]/url
 * Generate a signed URL for viewing/downloading a document
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;

    // Get document record to find the storage path
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('storage_path, bucket_id, file_name')
      .eq('id', id)
      .single();

    if (docError || !doc) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Generate signed URL (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(doc.bucket_id || 'student-documents')
      .createSignedUrl(doc.storage_path, 3600); // 1 hour expiry

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate document URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: signedUrlData.signedUrl,
      fileName: doc.file_name,
    });
  } catch (error: any) {
    console.error('Error in GET /api/student/documents/[id]/url:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get document URL' },
      { status: 500 }
    );
  }
}
