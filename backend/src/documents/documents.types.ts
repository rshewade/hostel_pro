// Document types and interfaces

export type DocumentType =
  | 'PHOTOGRAPH'
  | 'AADHAAR_CARD'
  | 'BIRTH_CERTIFICATE'
  | 'EDUCATION_CERTIFICATE'
  | 'INCOME_CERTIFICATE'
  | 'MEDICAL_CERTIFICATE'
  | 'POLICE_VERIFICATION'
  | 'UNDERTAKING'
  | 'RECEIPT'
  | 'LEAVE_APPLICATION'
  | 'RENEWAL_FORM'
  | 'OTHER';

export type DocumentStatus = 'UPLOADED' | 'VERIFIED' | 'REJECTED';

export type StorageBucket =
  | 'applications-documents'
  | 'student-documents'
  | 'undertakings'
  | 'system-generated';

export interface Document {
  id: string;
  application_id?: string;
  student_user_id?: string;
  document_type: DocumentType;
  bucket_id: string;
  storage_path: string;
  storage_url?: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  status: DocumentStatus;
  verified_at?: string;
  verified_by?: string;
  uploaded_by: string;
  metadata?: Record<string, any>;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UploadResult {
  document: Document;
  signedUrl: string;
}

export interface StorageUploadResult {
  path: string;
  fullPath: string;
}

// Allowed MIME types for validation
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Map document categories to storage buckets
export const CATEGORY_BUCKET_MAP: Record<string, StorageBucket> = {
  application: 'applications-documents',
  student: 'student-documents',
  undertaking: 'undertakings',
  system: 'system-generated',
};
