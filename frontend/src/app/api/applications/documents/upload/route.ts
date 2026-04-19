import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { saveFile } from '@/lib/storage';

const DOCUMENT_TYPE_MAP: Record<string, string> = {
  'photoFile': 'PHOTOGRAPH',
  'birthCertificate': 'BIRTH_CERTIFICATE',
  'marksheet': 'EDUCATION_CERTIFICATE',
  'recommendationLetter': 'OTHER',
  'incomeCertificate': 'INCOME_CERTIFICATE',
  'medicalCertificate': 'MEDICAL_CERTIFICATE',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

/**
 * POST /api/applications/documents/upload
 * Upload a document for an application to local storage.
 * Public endpoint (guest applicants), but requires valid application_id or temp_id.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get('file') as File;
    const documentType = formData.get('document_type') as string;
    const applicationId = formData.get('application_id') as string | null;
    const tempId = formData.get('temp_id') as string | null;

    // --- Validation ---

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ success: false, error: 'Document type is required' }, { status: 400 });
    }

    // Require an identifier to scope the upload
    if (!applicationId && !tempId) {
      return NextResponse.json({ success: false, error: 'Either application_id or temp_id is required' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File size exceeds 10 MB limit' }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `File type '${file.type}' not allowed. Accepted: PDF, JPEG, PNG` },
        { status: 400 }
      );
    }

    // If application_id provided, verify it exists in DB
    if (applicationId) {
      const { rows } = await query(
        'SELECT id FROM applications WHERE id = $1',
        [applicationId]
      );
      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Invalid application_id' }, { status: 400 });
      }
    }

    // --- Upload ---

    const dbDocumentType = DOCUMENT_TYPE_MAP[documentType] || 'OTHER';
    const identifier = applicationId || tempId || `temp_${Date.now()}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = await saveFile(buffer, 'applications', identifier, file.name);

    return NextResponse.json({
      success: true,
      data: {
        documentType,
        dbDocumentType,
        originalFileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storagePath: filePath,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in POST /api/applications/documents/upload:', message);
    return NextResponse.json({ success: false, error: 'Failed to upload document' }, { status: 500 });
  }
}
