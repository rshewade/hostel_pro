// Application types and interfaces

export type ApplicationType = 'NEW' | 'RENEWAL';

export type VerticalType = 'BOYS' | 'GIRLS' | 'DHARAMSHALA';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INTERVIEW_SCHEDULED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED';

export interface Application {
  id: string;
  tracking_number: string;
  type: ApplicationType;
  vertical: VerticalType;
  applicant_mobile: string;
  student_user_id?: string;
  parent_application_id?: string;
  current_status: ApplicationStatus;
  data: Record<string, any>;
  interview_scheduled_at?: string;
  interview_mode?: 'IN_PERSON' | 'VIDEO_CALL';
  interview_notes?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationListResult {
  applications: Application[];
  total: number;
  page: number;
  limit: number;
}
