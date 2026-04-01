import { NextRequest, NextResponse } from 'next/server';
import { saveFile } from '@/lib/storage';

const DOCUMENT_TYPE_MAP: Record<string, string> = {
  'photoFile': 'PHOTOGRAPH',
  'birthCertificate': 'BIRTH_CERTIFICATE',
  'marksheet': 'EDUCATION_CERTIFICATE',
  'recommendationLetter': 'OTHER',
  'incomeCertificate': 'INCOME_CERTIFICATE',
  'medicalCertificate': 'MEDICAL_CERTIFICATE',
};

/**
 * POST /api/applications/documents/upload
 * Upload a document for an application to local storage
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get('file') as File;
    const documentType = formData.get('document_type') as string;
    const applicationId = formData.get('application_id') as string | null;
    const tempId = formData.get('temp_id') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ success: false, error: 'Document type is required' }, { status: 400 });
    }

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
    return NextResponse.json({ success: false, error: 'Failed to upload document: ' + message }, { status: 500 });
  }
}
