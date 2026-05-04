import { NextRequest, NextResponse } from 'next/server';
import { saveFile } from '@/lib/storage';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

/**
 * POST /api/alumni/documents/upload
 * Public guest upload during alumni registration. Returns the storage path
 * which the client then submits with /api/alumni/register.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const kind = (formData.get('kind') as string | null) || 'profilePhoto';

    if (!file) return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ success: false, error: 'File exceeds 10 MB limit' }, { status: 400 });
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: `File type '${file.type}' not allowed. Accepted: PDF, JPEG, PNG` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const subPath = kind === 'proofDocument' ? 'proof' : 'photo';
    const path = await saveFile(buffer, 'alumni', subPath, file.name);

    return NextResponse.json({ success: true, data: { path, fileName: file.name, mimeType: file.type, size: file.size } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: `Upload failed: ${message}` }, { status: 500 });
  }
}
