import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { resolveAndValidatePath } from '@/lib/storage';
import fs from 'fs/promises';
import path from 'path';

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

/**
 * GET /api/applications/[id]/photo
 *
 * Returns the applicant's passport-size photograph (document_type='PHOTOGRAPH')
 * inline. Accepts either the application UUID or the human-readable
 * tracking_number as `id`. Public endpoint — used by the track page,
 * the printable PDF, and the superintendent dashboard.
 *
 * 404 if no photo has been uploaded yet.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const sql = isUuid
      ? `SELECT d.file_path, d.mime_type, d.file_name
           FROM documents d
          WHERE d.application_id = $1 AND d.document_type = 'PHOTOGRAPH'
          ORDER BY d.uploaded_at DESC
          LIMIT 1`
      : `SELECT d.file_path, d.mime_type, d.file_name
           FROM documents d
           JOIN applications a ON a.id = d.application_id
          WHERE a.tracking_number = $1 AND d.document_type = 'PHOTOGRAPH'
          ORDER BY d.uploaded_at DESC
          LIMIT 1`;

    const { rows } = await query(sql, [id]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const { file_path, mime_type, file_name } = rows[0];
    if (!file_path) {
      return NextResponse.json({ error: 'Photo file path missing' }, { status: 404 });
    }

    const absPath = await resolveAndValidatePath(file_path);
    const buffer = await fs.readFile(absPath);
    const ext = path.extname(file_path).toLowerCase();
    const contentType = mime_type || MIME_BY_EXT[ext] || 'application/octet-stream';

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${file_name || 'photo' + ext}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('GET /api/applications/[id]/photo error:', error);
    return NextResponse.json({ error: 'Failed to load photo' }, { status: 500 });
  }
}
