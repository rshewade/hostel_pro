import { NextRequest, NextResponse } from 'next/server';
import { verifySignedToken, resolveAndValidatePath } from '@/lib/storage';
import fs from 'fs/promises';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.zip': 'application/zip',
};

/**
 * GET /api/files/serve?token=...
 * Serve a file using a signed URL token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const result = verifySignedToken(token);
    if (!result.valid || !result.filePath) {
      return NextResponse.json({ error: result.error || 'Invalid token' }, { status: 403 });
    }

    // Resolve path and validate it stays within uploads directory (prevents path traversal + symlink attacks)
    let absPath: string;
    try {
      absPath = await resolveAndValidatePath(result.filePath);
    } catch {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
    }

    const buffer = await fs.readFile(absPath);
    const ext = path.extname(result.filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const fileName = path.basename(result.filePath);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error serving file:', message);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
