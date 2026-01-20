// Leave request types and interfaces

export type LeaveStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'CHECKED_OUT'
  | 'RETURNED';

export type LeaveType = 'REGULAR' | 'EMERGENCY' | 'MEDICAL' | 'VACATION';

export interface LeaveRequest {
  id: string;
  student_user_id: string;
  leave_type: LeaveType;
  reason: string;
  start_date: string;
  end_date: string;
  destination: string;
  destination_address?: string;
  emergency_contact: string;
  status: LeaveStatus;
  applied_at: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  checkout_at?: string;
  return_at?: string;
  parent_notified: boolean;
  parent_notified_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveListResult {
  leaves: LeaveRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface LeaveStats {
  pending: number;
  approved: number;
  checkedOut: number;
  returned: number;
  totalThisMonth: number;
}
