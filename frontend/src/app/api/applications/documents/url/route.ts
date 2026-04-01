import { NextRequest, NextResponse } from 'next/server';
import { generateSignedToken, fileExists } from '@/lib/storage';

/**
 * GET /api/applications/documents/url
 * Generate a signed URL for viewing/downloading an application document
 * Query params: path (storage path)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storagePath = searchParams.get('path');

    if (!storagePath) {
      return NextResponse.json({ success: false, error: 'Storage path is required' }, { status: 400 });
    }

    const exists = await fileExists(storagePath);
    if (!exists) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    const token = generateSignedToken(storagePath, 3600);
    const url = `/api/files/serve?token=${token}`;

    return NextResponse.json({ success: true, url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in GET /api/applications/documents/url:', message);
    return NextResponse.json({ success: false, error: 'Failed to get document URL' }, { status: 500 });
  }
}
