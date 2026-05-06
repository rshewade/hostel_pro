import { NextRequest, NextResponse } from 'next/server';
import { saveFile } from '@/lib/storage';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { detectMimeFromBytes, isAcceptedMime } from '@/lib/file-type';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

/**
 * POST /api/alumni/documents/upload
 *
 * Alumni registration upload. The current registration flow has no
 * pre-upload OTP step, so we cannot strictly bind to a session token
 * without breaking the UX. Instead we reduce abuse with:
 *  - Per-IP rate limit (10 / hour)            — S-12 partial mitigation
 *  - Strict size cap (10 MB)
 *  - Server-side magic-byte MIME validation   — S-21
 *  - UUID-prefixed sanitised file names        — pre-existing
 *
 * Hard binding to a registration session is tracked as a follow-up:
 * we will issue a one-time "register-intent" token on /alumni/register
 * page load and validate it here.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`alumni-upload-ip:${ip}`, {
      maxRequests: 10,
      windowSeconds: 60 * 60,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many uploads — try again later.' },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const kind = (formData.get('kind') as string | null) || 'profilePhoto';

    if (!file) return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ success: false, error: 'File exceeds 10 MB limit' }, { status: 400 });
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: `File type '${file.type}' not allowed. Accepted: PDF, JPEG, PNG` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // S-21: sniff magic bytes to detect content/Content-Type mismatch.
    const detected = detectMimeFromBytes(buffer);
    if (!detected || !isAcceptedMime(detected, ALLOWED_MIME_TYPES)) {
      return NextResponse.json(
        { success: false, error: 'File contents do not match the declared type' },
        { status: 400 },
      );
    }

    const subPath = kind === 'proofDocument' ? 'proof' : 'photo';
    const path = await saveFile(buffer, 'alumni', subPath, file.name);

    return NextResponse.json({ success: true, data: { path, fileName: file.name, mimeType: file.type, size: file.size } });
  } catch (error: unknown) {
    console.error('Alumni upload failed', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}
