import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Map frontend document types to database enum values
const DOCUMENT_TYPE_MAP: Record<string, string> = {
  'AADHAR_CARD': 'AADHAAR_CARD',
  'PHOTO': 'PHOTOGRAPH',
  'BIRTH_CERTIFICATE': 'BIRTH_CERTIFICATE',
  'MARKSHEET': 'EDUCATION_CERTIFICATE',
  'TRANSFER_CERTIFICATE': 'EDUCATION_CERTIFICATE',
  'INCOME_CERTIFICATE': 'INCOME_CERTIFICATE',
  'ANTI_RAGGING': 'UNDERTAKING',
  'HOSTEL_RULES': 'UNDERTAKING',
  'OTHER': 'OTHER',
};

/**
 * POST /api/student/documents/upload
 * Upload a document to Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const formData = await request.formData();

    const file = formData.get('file') as File;
    const studentId = formData.get('student_id') as string;
    const documentType = formData.get('document_type') as string;
    const category = formData.get('category') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
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
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${studentId}/${documentType}_${timestamp}.${fileExt}`;

    // Convert File to ArrayBuffer then to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('student-documents')
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

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('student-documents')
      .getPublicUrl(fileName);

    // Create document record in database
    const { data: docRecord, error: dbError } = await supabase
      .from('documents')
      .insert({
        student_user_id: studentId,
        document_type: dbDocumentType,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        bucket_id: 'student-documents',
        storage_path: fileName,
        storage_url: urlData?.publicUrl || '',
        status: 'UPLOADED',
        uploaded_by: studentId,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Try to delete the uploaded file if DB insert fails
      await supabase.storage.from('student-documents').remove([fileName]);
      return NextResponse.json(
        { success: false, error: 'Failed to save document record: ' + dbError.message },
        { status: 500 }
      );
    }

    console.log('✅ Document uploaded successfully:', {
      studentId,
      documentType,
      fileName: file.name,
      storagePath: fileName,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: docRecord.id,
        fileName: file.name,
        documentType,
        category,
        storagePath: fileName,
        url: urlData?.publicUrl,
      },
    });
  } catch (error: any) {
    console.error('Error in POST /api/student/documents/upload:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload document: ' + error.message },
      { status: 500 }
    );
  }
}
