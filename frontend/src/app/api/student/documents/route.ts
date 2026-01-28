import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json([], { status: 200 }); // Return empty array if no studentId
    }

    // Query documents for the student
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('student_user_id', studentId);

    if (error) {
      console.error('Supabase error fetching documents:', error);
    }

    console.log(`📄 Fetching documents for student ${studentId}:`, documents?.length || 0, 'found');

    // Map database enum values to display info
    const documentTypeMap: Record<string, { title: string; category: string }> = {
      'AADHAAR_CARD': { title: 'Aadhar Card', category: 'IDENTITY' },
      'PHOTOGRAPH': { title: 'Passport Size Photo', category: 'IDENTITY' },
      'EDUCATION_CERTIFICATE': { title: 'Academic Document', category: 'ADMISSION' },
      'BIRTH_CERTIFICATE': { title: 'Birth Certificate', category: 'IDENTITY' },
      'INCOME_CERTIFICATE': { title: 'Income Certificate', category: 'ADMISSION' },
      'MEDICAL_CERTIFICATE': { title: 'Medical Certificate', category: 'ADMISSION' },
      'POLICE_VERIFICATION': { title: 'Police Verification', category: 'ADMISSION' },
      'UNDERTAKING': { title: 'Undertaking', category: 'UNDERTAKING' },
      'RECEIPT': { title: 'Fee Receipt', category: 'RECEIPT' },
      'LEAVE_APPLICATION': { title: 'Leave Application', category: 'ADMISSION' },
      'RENEWAL_FORM': { title: 'Renewal Form', category: 'ADMISSION' },
      'OTHER': { title: 'Other Document', category: 'ADMISSION' },
    };

    const formattedDocuments = (documents || []).map((doc: any, index: number) => {
      const typeInfo = documentTypeMap[doc.document_type] || {
        title: doc.document_type?.replace(/_/g, ' ') || 'Document',
        category: 'ADMISSION'
      };

      return {
        id: doc.id || `doc-${index}`,
        title: typeInfo.title,
        category: typeInfo.category,
        uploadDate: doc.created_at ? new Date(doc.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: doc.status || 'UPLOADED',
        size: doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
        type: doc.storage_path?.split('.').pop()?.toUpperCase() || doc.mime_type?.split('/').pop()?.toUpperCase() || 'PDF',
        url: doc.storage_url || '',
      };
    });

    // Return actual documents (empty array if none found)
    return NextResponse.json(formattedDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { message: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
