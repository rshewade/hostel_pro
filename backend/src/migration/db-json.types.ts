/**
 * Type definitions for db.json schema
 * Used for migration from prototype to Supabase
 */

// User from db.json
export interface DbJsonUser {
  id: string;
  email: string;
  password_hash?: string;
  role: string;
  vertical?: string;
  mobile_no: string;
  full_name?: string;
  photo_url?: string;
  status: string;
  requires_password_change?: boolean;
  dpdp_consent?: boolean;
  linked_student_ids?: string[];
  created_at: string;
}

// Student from db.json
export interface DbJsonStudent {
  id: string;
  user_id: string;
  vertical: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  blood_group?: string;
  email: string;
  mobile: string;
  permanent_address: string;
  emergency_contact: string;
  parent_name: string;
  parent_mobile: string;
  parent_email?: string;
  local_guardian_name?: string;
  local_guardian_mobile?: string;
  local_guardian_address?: string;
  course?: string;
  institution?: string;
  year_of_study?: number;
  admission_date: string;
  current_session_start?: string;
  current_session_end?: string;
  renewal_count?: number;
  status: string;
  room_id?: string;
  bed_number?: string;
  photo_url?: string;
  created_at: string;
  updated_at?: string;
}

// Application from db.json
export interface DbJsonApplication {
  id: string;
  tracking_number: string;
  type: string;
  vertical: string;
  applicant_name: string;
  applicant_mobile: string;
  applicant_email: string;
  application_data: Record<string, unknown>;
  current_status: string;
  status_history?: Array<{
    status: string;
    changed_at: string;
    changed_by?: string;
    remarks?: string;
  }>;
  interview_schedule?: {
    date: string;
    time: string;
    venue?: string;
    interviewer_id?: string;
  };
  assigned_superintendent?: string;
  reviewed_at?: string;
  remarks?: string;
  student_user_id?: string;
  parent_application_id?: string;
  created_at: string;
  updated_at?: string;
}

// Document from db.json
export interface DbJsonDocument {
  id: string;
  student_id?: string;
  application_id?: string;
  type: string;
  name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  verification_status: string;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  uploaded_by: string;
  created_at: string;
}

// Interview from db.json
export interface DbJsonInterview {
  id: string;
  application_id: string;
  scheduled_date: string;
  scheduled_time: string;
  venue?: string;
  interviewer_ids?: string[];
  status: string;
  feedback?: string;
  recommendation?: string;
  conducted_at?: string;
  created_at: string;
}

// Room from db.json
export interface DbJsonRoom {
  id: string;
  vertical: string;
  floor: number;
  room_number: string;
  room_type: string;
  capacity: number;
  occupied: number;
  available: number;
  amenities?: string[];
  status: string;
  base_rent?: number;
  created_at: string;
}

// Allocation from db.json
export interface DbJsonAllocation {
  id: string;
  student_id: string;
  room_id: string;
  bed_number: string;
  allocated_at: string;
  valid_from: string;
  valid_until?: string;
  status: string;
  allocated_by: string;
  remarks?: string;
  created_at: string;
}

// Leave Request from db.json
export interface DbJsonLeave {
  id: string;
  student_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  emergency_contact?: string;
  destination?: string;
  status: string;
  applied_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_remarks?: string;
  checkout_at?: string;
  checkin_at?: string;
  created_at: string;
}

// Fee from db.json
export interface DbJsonFee {
  id: string;
  student_id: string;
  fee_type: string;
  description: string;
  amount: number;
  due_date: string;
  status: string;
  paid_amount?: number;
  paid_at?: string;
  transaction_id?: string;
  session?: string;
  created_at: string;
}

// Transaction from db.json
export interface DbJsonTransaction {
  id: string;
  fee_id?: string;
  student_id: string;
  amount: number;
  payment_method: string;
  payment_gateway?: string;
  gateway_transaction_id?: string;
  status: string;
  receipt_number?: string;
  paid_at?: string;
  created_at: string;
}

// Renewal from db.json
export interface DbJsonRenewal {
  id: string;
  student_id: string;
  session_start: string;
  session_end: string;
  status: string;
  application_id?: string;
  fee_id?: string;
  renewed_at?: string;
  reviewed_by?: string;
  remarks?: string;
  created_at: string;
}

// Exit Request from db.json
export interface DbJsonExitRequest {
  id: string;
  student_id: string;
  exit_type: string;
  exit_reason: string;
  requested_date: string;
  status: string;
  clearance_status?: Record<string, boolean>;
  approved_by?: string;
  approved_at?: string;
  actual_exit_date?: string;
  remarks?: string;
  created_at: string;
}

// Audit Log from db.json
export interface DbJsonAuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id?: string;
  actor_role?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

// Communication from db.json
export interface DbJsonCommunication {
  id: string;
  type: string;
  recipient_type: string;
  recipient_id: string;
  recipient_contact: string;
  subject?: string;
  message: string;
  status: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

// Notification from db.json
export interface DbJsonNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

// Receivable from db.json
export interface DbJsonReceivable {
  id: string;
  student_id: string;
  fee_head: string;
  amount: number;
  due_date: string;
  status: string;
  paid_amount?: number;
  created_at: string;
}

// Clearance Item from db.json
export interface DbJsonClearanceItem {
  id: string;
  name: string;
  department: string;
  required_for: string[];
  created_at: string;
}

// Clearance from db.json
export interface DbJsonClearance {
  id: string;
  student_id: string;
  exit_request_id: string;
  clearance_item_id: string;
  status: string;
  cleared_by?: string;
  cleared_at?: string;
  remarks?: string;
  created_at: string;
}

// Leave Rule from db.json
export interface DbJsonLeaveRule {
  id: string;
  vertical: string;
  leave_type: string;
  max_days_per_month?: number;
  max_days_per_session?: number;
  requires_approval: boolean;
  advance_notice_days?: number;
  created_at: string;
}

// Complete db.json schema
export interface DbJson {
  users: DbJsonUser[];
  students: DbJsonStudent[];
  applications: DbJsonApplication[];
  documents: DbJsonDocument[];
  interviews: DbJsonInterview[];
  rooms: DbJsonRoom[];
  allocations: DbJsonAllocation[];
  leaves: DbJsonLeave[];
  fees: DbJsonFee[];
  transactions: DbJsonTransaction[];
  renewals: DbJsonRenewal[];
  exitRequests: DbJsonExitRequest[];
  auditLogs: DbJsonAuditLog[];
  communications: DbJsonCommunication[];
  notifications: DbJsonNotification[];
  receivables: DbJsonReceivable[];
  clearanceItems: DbJsonClearanceItem[];
  clearances: DbJsonClearance[];
  leave_rules: DbJsonLeaveRule[];
  config: Record<string, unknown>;
}

// Validation Report
export interface ValidationReport {
  isValid: boolean;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: Record<string, { total: number; valid: number; invalid: number }>;
}

export interface ValidationError {
  table: string;
  recordId: string;
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationWarning {
  table: string;
  recordId: string;
  field: string;
  message: string;
}

// Migration Result
export interface MigrationResult {
  success: boolean;
  migratedTables: string[];
  recordCounts: Record<string, { attempted: number; inserted: number; failed: number }>;
  errors: MigrationError[];
  startedAt: string;
  completedAt: string;
  durationMs: number;
}

export interface MigrationError {
  table: string;
  recordId: string;
  error: string;
}

// Verification Result
export interface VerificationResult {
  verified: boolean;
  tableCounts: Record<string, { expected: number; actual: number; match: boolean }>;
  spotChecks: SpotCheckResult[];
  errors: string[];
}

export interface SpotCheckResult {
  table: string;
  recordId: string;
  fieldsChecked: number;
  fieldsMatched: number;
  mismatches: { field: string; expected: unknown; actual: unknown }[];
}
