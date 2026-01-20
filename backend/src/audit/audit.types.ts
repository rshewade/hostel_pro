export interface AuditLog {
  id: string;
  entity_type: string; // AUTH, USER, APPLICATION, etc.
  action: string; // OTP_SEND, OTP_VERIFY, LOGIN, LOGOUT, MFA_VERIFY, etc.
  actor_id?: string; // auth.users.id or public.users.id
  actor_type?: string; // STUDENT, SUPERINTENDENT, TRUSTEE, ACCOUNTS, PARENT
  entity_id?: string; // Related entity ID (application_id, student_id, etc.)
  old_value?: string; // For updates
  new_value?: string; // For updates
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface CreateAuditLogDto {
  entity_type: string;
  action: string;
  actor_id?: string;
  actor_type?: string;
  entity_id?: string;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  metadata?: Record<string, any>;
}
