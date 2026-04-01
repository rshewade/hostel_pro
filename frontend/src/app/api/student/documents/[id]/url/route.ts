import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateSignedToken, fileExists } from '@/lib/storage';
import { requireAuth } from '@/lib/authorize';

/**
 * GET /api/student/documents/[id]/url
 * Generate a signed URL for viewing/downloading a document
 * Auth: any authenticated user
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(_request);
    const { id } = await params;

    // Get document record to find the storage path
    const result = await query(
      `SELECT file_path, file_name FROM documents WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    const doc = result.rows[0];

    const exists = await fileExists(doc.file_path);
    if (!exists) {
      return NextResponse.json({ success: false, error: 'File not found on disk' }, { status: 404 });
    }

    const token = generateSignedToken(doc.file_path, 3600);
    const url = `/api/files/serve?token=${token}`;

    return NextResponse.json({
      success: true,
      url,
      fileName: doc.file_name,
    });
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in GET /api/student/documents/[id]/url:', message);
    return NextResponse.json({ success: false, error: 'Failed to get document URL' }, { status: 500 });
  }
}
