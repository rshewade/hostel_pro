// Payment types and interfaces

export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'WAIVED';

export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE';

export type FeeType =
  | 'HOSTEL_FEE'
  | 'PROCESSING_FEE'
  | 'SECURITY_DEPOSIT'
  | 'KEY_DEPOSIT'
  | 'MESS_FEE'
  | 'ELECTRICITY'
  | 'LAUNDRY'
  | 'OTHER';

export interface Fee {
  id: string;
  student_user_id: string;
  application_id?: string;
  fee_type: FeeType;
  amount: number;
  due_date: string;
  status: PaymentStatus;
  paid_amount: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  fee_id: string;
  student_user_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_reference?: string;
  payment_date: string;
  receipt_number: string;
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  created_at: string;
}

export interface PaymentListResult {
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
}

export interface FeeListResult {
  fees: Fee[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentSummary {
  totalDue: number;
  totalPaid: number;
  totalPending: number;
  overdueFees: number;
}
