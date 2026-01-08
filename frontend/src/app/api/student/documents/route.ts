import { NextRequest, NextResponse } from 'next/server';
import { find } from '@/lib/api/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId') || 'u1';

    const documents = await find('documents', (doc: any) => 
      doc.student_id === studentId || doc.studentId === studentId
    );

    const documentTypeMap: Record<string, { title: string; category: string }> = {
      'AADHAR_CARD': { title: 'Aadhar Card', category: 'IDENTITY' },
      'PHOTO': { title: 'Passport Size Photo', category: 'IDENTITY' },
      'MARKSHEET': { title: 'Academic Marksheet', category: 'ADMISSION' },
      'BIRTH_CERTIFICATE': { title: 'Birth Certificate', category: 'IDENTITY' },
      'TRANSFER_CERTIFICATE': { title: 'Transfer Certificate', category: 'ADMISSION' },
      'ANTI_RAGGING': { title: 'Anti-Ragging Undertaking', category: 'UNDERTAKING' },
      'HOSTEL_RULES': { title: 'Hostel Rules Acceptance', category: 'UNDERTAKING' },
      'FEE_RECEIPT': { title: 'Fee Receipt', category: 'RECEIPT' },
    };

    const formattedDocuments = documents.map((doc: any, index: number) => {
      const typeInfo = documentTypeMap[doc.document_type] || { 
        title: doc.document_type.replace(/_/g, ' '), 
        category: 'ADMISSION' 
      };
      
      return {
        id: doc.id || `doc-${index}`,
        title: typeInfo.title,
        category: typeInfo.category,
        uploadDate: doc.uploaded_at ? new Date(doc.uploaded_at).toISOString().split('T')[0] : '2024-06-15',
        status: doc.verification_status || 'PENDING',
        size: '0.5 MB',
        type: doc.s3_key?.split('.').pop()?.toUpperCase() || 'PDF'
      };
    });

    if (formattedDocuments.length === 0) {
      return NextResponse.json([
        {
          id: '1',
          title: 'Aadhar Card',
          category: 'IDENTITY' as const,
          uploadDate: '2024-06-10',
          status: 'VERIFIED' as const,
          size: '2.4 MB',
          type: 'PDF'
        },
        {
          id: '2',
          title: 'Passport Size Photo',
          category: 'IDENTITY' as const,
          uploadDate: '2024-06-10',
          status: 'VERIFIED' as const,
          size: '1.8 MB',
          type: 'JPG'
        },
        {
          id: '3',
          title: 'Academic Marksheet',
          category: 'ADMISSION' as const,
          uploadDate: '2024-06-15',
          status: 'VERIFIED' as const,
          size: '1.2 MB',
          type: 'PDF'
        }
      ]);
    }

    return NextResponse.json(formattedDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { message: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
