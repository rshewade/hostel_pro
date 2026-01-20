import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { DocumentType } from '../documents.types';

export class UploadDocumentDto {
  @IsEnum([
    'PHOTOGRAPH',
    'AADHAAR_CARD',
    'BIRTH_CERTIFICATE',
    'EDUCATION_CERTIFICATE',
    'INCOME_CERTIFICATE',
    'MEDICAL_CERTIFICATE',
    'POLICE_VERIFICATION',
    'UNDERTAKING',
    'RECEIPT',
    'LEAVE_APPLICATION',
    'RENEWAL_FORM',
    'OTHER',
  ])
  @IsNotEmpty()
  documentType: DocumentType;

  @IsString()
  @IsNotEmpty()
  @IsEnum(['application', 'student', 'undertaking', 'system'])
  category: string;

  @IsUUID()
  @IsOptional()
  applicationId?: string;

  @IsUUID()
  @IsOptional()
  studentUserId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class VerifyDocumentDto {
  @IsEnum(['VERIFIED', 'REJECTED'])
  @IsNotEmpty()
  status: 'VERIFIED' | 'REJECTED';

  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

export class ListDocumentsDto {
  @IsUUID()
  @IsOptional()
  studentUserId?: string;

  @IsUUID()
  @IsOptional()
  applicationId?: string;

  @IsEnum(['UPLOADED', 'VERIFIED', 'REJECTED'])
  @IsOptional()
  status?: string;

  @IsEnum([
    'PHOTOGRAPH',
    'AADHAAR_CARD',
    'BIRTH_CERTIFICATE',
    'EDUCATION_CERTIFICATE',
    'INCOME_CERTIFICATE',
    'MEDICAL_CERTIFICATE',
    'POLICE_VERIFICATION',
    'UNDERTAKING',
    'RECEIPT',
    'LEAVE_APPLICATION',
    'RENEWAL_FORM',
    'OTHER',
  ])
  @IsOptional()
  documentType?: DocumentType;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

export class BulkDownloadDto {
  @IsUUID()
  @IsOptional()
  studentUserId?: string;

  @IsUUID()
  @IsOptional()
  applicationId?: string;

  @IsEnum([
    'PHOTOGRAPH',
    'AADHAAR_CARD',
    'BIRTH_CERTIFICATE',
    'EDUCATION_CERTIFICATE',
    'INCOME_CERTIFICATE',
    'MEDICAL_CERTIFICATE',
    'POLICE_VERIFICATION',
    'UNDERTAKING',
    'RECEIPT',
    'LEAVE_APPLICATION',
    'RENEWAL_FORM',
    'OTHER',
  ])
  @IsOptional()
  documentType?: DocumentType;

  @IsEnum(['UPLOADED', 'VERIFIED', 'REJECTED'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  vertical?: string;

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @IsEnum(['zip', 'pdf'])
  @IsOptional()
  format?: 'zip' | 'pdf';
}
