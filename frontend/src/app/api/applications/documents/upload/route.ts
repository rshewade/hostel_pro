import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Map frontend document types to database enum values
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
 * Upload a document for an application to Supabase Storage
 * This is used during the application submission process
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const formData = await request.formData();

    const file = formData.get('file') as File;
    const documentType = formData.get('document_type') as string;
    const applicationId = formData.get('application_id') as string | null;
    const tempId = formData.get('temp_id') as string; // Temporary ID for pre-submission uploads

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!documentType) {
      return NextResponse.json(
        { success: false, error: 'Document type is required' },
        { status: 400 }
      );
    }

    // Map document type to database enum value
    const dbDocumentType = DOCUMENT_TYPE_MAP[documentType] || 'OTHER';

    // Generate unique file path
    // Use tempId for pre-submission, applicationId for post-submission
    const identifier = applicationId || tempId || `temp_${Date.now()}`;
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `applications/${identifier}/${documentType}_${timestamp}.${fileExt}`;

    // Convert File to ArrayBuffer then to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage (using applications-documents bucket)
    const { error: uploadError } = await supabase.storage
      .from('applications-documents')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload file: ' + uploadError.message },
        { status: 500 }
      );
    }

    console.log('Document uploaded successfully:', {
      documentType,
      fileName: file.name,
      storagePath: fileName,
    });

    // Return the storage path - this will be stored in the application's data
    return NextResponse.json({
      success: true,
      data: {
        documentType,
        dbDocumentType,
        originalFileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storagePath: fileName,
        bucketId: 'applications-documents',
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/applications/documents/upload:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload document: ' + error.message },
      { status: 500 }
    );
  }
}
