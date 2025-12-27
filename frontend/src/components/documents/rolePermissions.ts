/**
 * Task 11.6: Cross-Role Visibility Rules and Legal/Compliance Review Loop
 * 
 * Define comprehensive permission matrix for all roles, DPDP consent visibility,
 * legal/compliance workflows, blocked action signaling, and role management.
 */

// ============================================================================
// ROLE ENUMERATION
// ============================================================================

export type UserRole = 
  | 'applicant'              // Guest applying for admission (no account until approved)
  | 'student'               // Resident with approved account
  | 'parent'                // View-only access for ward (OTP-based login)
  | 'local_guardian'         // View-only access for local guardian
  | 'superintendent'        // Manages assigned to vertical (Boys/Girls/Dharamshala)
  | 'trustee'               // Approves final admission and conducts interviews
  | 'verifier'              // Verifies documents and undertakings
  | 'accounts'               // Manages finances and receipts
  | 'legal_compliance'       // Legal/compliance officer reviews documents
  | 'admin'                 // System administrator
  | 'system'                // Automated processes and background jobs;

// ============================================================================
// DOCUMENT PERMISSIONS BY ROLE
// ============================================================================

/**
 * Core permission types for document access control
 */
export type DocumentPermission = 
  // Read permissions
  | 'view_basic'             // View basic metadata (title, type, required flag)
  | 'view_details'           // View full metadata including upload/verify details
  | 'view_audit_trail'      // View complete audit trail
  | 'view_file_content'       // View actual file content/download
  | 'view_dpdp_logs'         // View DPDP consent logs

  // Write/Action permissions
  | 'upload'                // Upload new document or replace existing
  | 'delete'                // Soft delete document (admin only)
  | 'verify'                // Verify or reject document (verifier only)
  | 'reject'                // Reject document (admin only)
  | 'unverify'              // Undo verification (admin only)
  | 'download'             // Download file
 | 'export'               // Export audit logs (admin/legal only)
  | 'request_reupload'    // Request re-upload (applicant only)
 | 'comment'              // Add comment to document (admin/verifier)

/**
 * Undertaking permission types
 */
export type UndertakingPermission = 
  // Read permissions
  | 'view_basic'             // View basic metadata (title, type, due date, status)
  | 'view_details'           // View full metadata including consent history
  | 'view_acknowledgement'  // View acknowledgement details
 | 'view_audit_trail'      // View complete audit trail
 | 'view_dpdp_logs'         // View DPDP consent logs
   // Action permissions
  | 'acknowledge'           // Acknowledge undertaking (student/parent)
   | 'withdraw'              // Withdraw consent (student/parent)

// ============================================================================
// PERMISSION MATRICES
// ============================================================================

/**
 * Defines all permissions for each role and entity type
 * Roles: applicant, student, parent, local_guardian, superintendent, trustee, verifier, accounts, legal_compliance, admin, system
 */
export const ROLE_PERMISSIONS: Record<UserRole, DocumentPermission | UndertakingPermission> = {
  applicant: {
    // Document permissions
    documents: [
      'view_basic',
      'view_details',
      'view_audit_trail',
      'view_file_content',
      'request_reupload'
    ],
    undertakings: [
      'view_basic',
      'view_details',
      'view_acknowledgement',
      'view_audit_trail',
      'view_dpdp_logs'
    ]
  },

  student: {
    // Document permissions
    documents: [
      'view_basic',
      'view_details',
      'view_audit_trail',
      'view_file_content',
      'download'
    ],
    undertakings: [
      'view_basic',
      'view_details',
      'view_acknowledgement',
      'view_audit_trail',
      'view_dpdp_logs',
      // Action permissions
      'acknowledge'
    ]
  },

  parent: {
    // Document permissions (read-only, no write)
    documents: [
      'view_basic',
      'view_details',
      'view_audit_trail',
      'view_file_content'
    ],
    undertakings: [
      'view_basic',
      'view_details',
      'view_acknowledgement',
      'view_audit_trail',
      'view_dpdp_logs'
    ]
  },

  local_guardian: {
    // Document permissions (read-only, limited to ward)
    documents: [
      'view_basic',
      'view_details',
      'view_audit_trail',
      'view_file_content',
      'download'
    ]
    undertakings: [
      'view_basic',
      'view_details',
      'view_acknowledgement',
      'view_audit_trail',
      'view_dpdp_logs'
    ]
  },

  superintendent: {
    // Document permissions (can manage vertical-specific documents)
    documents: [
      'view_basic',
      'view_details',
      'view_audit_trail',
      'view_file_content',
      'download',
      'upload',
      'verify',
      'reject',
      'unverify',
      'comment'
    ]
    undertakings: [
      'view_basic',
      'view_details',
      'view_acknowledgement',
      'view_audit_trail',
      'view_dpdp_logs'
    ]
  },

  trustee: {
    // Document permissions (review and final decisions)
    documents: [
      'view_basic',
      'view_details',
      'view_audit_trail',
      'view_file_content',
      'download'
    ]
    undertakings: [
      'view_basic',
      'view_details',
      'view_acknowledgement',
      'view_audit_trail',
      'view_dpdp_logs'
    ]
  },

  verifier: {
    // Document permissions (verify/reject only, no create)
    documents: [
      'view_basic',
      'view_details',
      'view_audit_trail',
      'view_file_content',
      'download',
      'verify',
      'reject',
      'comment'
    ]
  },

  accounts: {
    // Document permissions (view/download only, receipts and audit logs)
    documents: [
      'view_basic',
      'view_details',
      'view_audit_trail',
      'download',
      'export'
    ]
  },

  legal_compliance: {
    // Document permissions (compliance review only)
    documents: [
      'view_basic',
      'view_details',
      'view_audit_trail',
      'view_file_content',
      'download',
      'export'
    ]
  },

  admin: {
    // All permissions
    documents: ['*'],
    undertakings: ['*']
  },

  system: {
    // Background processes (read-only)
    documents: ['*'],
    undertakings: ['*']
  }
};

// ============================================================================
// ELEMENT-LEVEL PERMISSIONS
// ============================================================================

/**
 * Element-level permissions for fine-grained control
 * Examples: Can view fileName but not fileSize, can view status but not change it
 */
export type ElementPermission = 
  // Document element permissions
  | 'view_title'             // View document title
   | 'view_type'              // View document type
   | 'view_status'            // View status (pending, uploaded, verified, rejected)
   | 'view_required'           // View required flag
   | 'view_due_date'         // View due date
   | 'view_upload_details'    // View upload metadata
   | 'view_verification'       // View verification details
   | 'view_rejection_reason'   // View rejection reason (admin only)
   | 'view_dpdp_consent'     // View DPDP consent status
   
  // Metadata element permissions
   | 'view_upload_device_context'  // View upload device context
   | 'view_verify_device_context' // View verification device context
   | 'view_signature'         // View digital signature
   | 'view_audit_entry'       // View individual audit entry
   | 'view_version_history'   // View version history

   // Undertaking element permissions
   | 'view_title'             // View undertaking title
   | 'view_type'              // View undertaking type
   | 'view_status'            // View status
   | 'view_due_date'         // View due date
   | 'view_acknowledgement'    // View acknowledgement details
   | 'view_consent_text'       // View consent text content
   | 'view_digital_signature'  // View digital signature
   | 'view_audit_entry'       // View individual audit entry
   | 'view_consent_history'    // View consent history
   | 'view_version_history'   // View version history

// ============================================================================
// DPDP CONSENT LOGS VISIBILITY
// ============================================================================

/**
 * Which roles can see which consent logs and related data
 */
export type DPDPConsentVisibility = 
  | 'full'                // Full details: consent text, timestamp, user, device, policy version
   | 'basic'               // Basic info: consent type, status, granted date, expiry
   | 'timestamp_only'          // Just timestamp (no user info)
   | 'user_only'           // Just user info (no device/context)
   | 'admin_full'            // All fields including device context and IP

export const DPDP_CONSENT_VISIBILITY: Record<UserRole, DPDPConsentVisibility> = {
  applicant: {
    // Applicant cannot see consent logs (no account until approved)
    full: false,
    basic: false,
    timestamp_only: false,
    user_only: false,
    admin_full: false
  },

  student: {
    // Student sees their own consents
    full: true,
    basic: true,
    timestamp_only: false,
    user_only: false,
    admin_full: false
  },

  parent: {
    // Parent sees their ward's consents (read-only)
    full: true,
    basic: true,
    timestamp_only: false,
    user_only: false,
    admin_full: false
  },

  local_guardian: {
    // Local guardian sees associated consents (read-only)
    full: true,
    basic: true,
    timestamp_only: false,
    user_only: false,
    admin_full: false
  },

  superintendent: {
    // Superintendent can see consents for vertical
    full: true,
    basic: true,
    timestamp_only: false,
    user_only: false,
    admin_full: false
  },

  trustee: {
    // Trustee can see consents (for review purposes)
    full: true,
    basic: true,
    timestamp_only: false,
    user_only: false,
    admin_full: false
  },

  verifier: {
    // Verifier cannot see consent logs (not relevant to their role)
    full: false,
    basic: false,
    timestamp_only: false,
    user_only: false,
    admin_full: false
  },

  accounts: {
    // Accounts can see consents (for financial audit)
    full: true,
    basic: true,
    timestamp_only: false,
    user_only: false,
    admin_full: false
  },

  legal_compliance: {
    // Legal/compliance sees all consent logs
    full: true,
    basic: true,
    timestamp_only: false,
    user_only: true,  // Only user, not device/context
    admin_full: true
  },

  admin: {
    // Admin can see everything
    full: true,
    basic: true,
    timestamp_only: false,
    user_only: false,
    admin_full: true
  },

  system: {
    // System processes (read-only)
    full: true,
    basic: true,
    timestamp_only: false,
    user_only: true,  // Only "system" identity
    admin_full: true
  }
};

// ============================================================================
// AUDIT TRAIL VISIBILITY
// ============================================================================

/**
 * Which audit trail elements are visible to which roles
 */
export type AuditVisibility = 
  | 'none'                // No audit visibility
   | 'basic'               // Can see basic audit (timestamp, actor, action)
   | 'detailed'            // Full audit trail with all details
   | 'ip_address'          // Can see IP addresses
   | 'device_info'         // Can see device fingerprint
   | 'user_agent'          // Can see user agent
   | 'session_id'          // Can see session ID
   | 'error_details'        // Can see error stack traces

export const AUDIT_TRAIL_VISIBILITY: Record<UserRole, AuditVisibility> = {
  applicant: {
    none: true,
    basic: false,
    detailed: false,
    ip_address: false,
    device_info: false,
    user_agent: false,
    session_id: false,
    error_details: false
  },

  student: {
    none: false,
    basic: true,
    detailed: false,
    ip_address: false,
    device_info: false,
    user_agent: false,
    session_id: false,
    error_details: false
  },

  parent: {
    none: true,
    basic: true,
    detailed: false,
    ip_address: false,
    device_info: false,
    user_agent: false,
    session_id: false,
    error_details: false
  },

  superintendent: {
    none: false,
    basic: true,
    detailed: true,
    ip_address: true, // Superintendents need IP for investigations
    device_info: true,
    user_agent: true,  // Need user agent attribution
    session_id: true,  // Need session tracking
    error_details: true   // Need error logging
  },

  trustee: {
    none: false,
    basic: true,
    detailed: true,
    ip_address: true,
    device_info: true,
    user_agent: true,
    session_id: true,
    error_details: true
  },

  verifier: {
    none: true,
    basic: true,
    detailed: true,
    ip_address: true,
    device_info: true,
    user_agent: true,
    session_id: true,
    error_details: true
  },

  accounts: {
    none: false,
    basic: true,
    detailed: true,
    ip_address: true,
    device_info: true,
    user_agent: true,
    session_id: true,
    error_details: true
  },

  legal_compliance: {
    none: false,
    basic: true,
    detailed: true,
    ip_address: true,
    device_info: true,
    user_agent: true,
    session_id: true,
    error_details: true
  },

  admin: {
    none: false,
    basic: true,
    detailed: true,
    ip_address: true,
    device_info: true,
    user_agent: true,
    session_id: true,
    error_details: true
  },

  system: {
    none: false,
    basic: true,
    detailed: true,
    ip_address: false,
    device_info: false,
    user_agent: false,
    session_id: false,
    error_details: false
  }
};

// ============================================================================
// PERMISSION CHECK FUNCTIONS
// ============================================================================

/**
 * Check if a role has a specific permission on an entity
 */
export function hasDocumentPermission(
  role: UserRole,
  permission: DocumentPermission,
  entityType: 'document' | 'undertaking'
): boolean {
  const permissions = ROLE_PERMISSIONS[role][entityType];
  return permissions?.includes(permission) || false;
}

export function hasUndertakingPermission(
  role: UserRole,
  permission: UndertakingPermission
): boolean {
  const permissions = ROLE_PERMISSIONS[role]?.undertakings || [];
  return permissions?.includes(permission) || false;
}

/**
 * Check if role can see specific audit trail element
 */
export function canViewAuditElement(
  role: UserRole,
  element: AuditVisibility
): boolean {
  const visibility = AUDIT_TRAIL_VISIBILITY[role]?.[element] || AUDIT_TRAIL_VISIBILITY[role].none || false;
  return visibility;
}

/**
 * Check DPDP consent visibility for role
 */
export function getDPDPConsentVisibility(
  role: UserRole,
  visibilityLevel: DPDPConsentVisibility
): DPDPConsentVisibility {
    const roleVisibility = DPDP_CONSENT_VISIBILITY[role] || { full: false, basic: false, timestamp_only: false, user_only: false, admin_full: false };
    
    return {
      canSee: roleVisibility[visibilityLevel] || false,
      visibilityLevel: roleVisibility[visibilityLevel] || 'none'
    };
  }

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: UserRole): DocumentPermission[] {
  return ROLE_PERMISSIONS[role]?.documents || [];
}

/**
 * Get all undertaking permissions for a role
 */
export function getUndertakingPermissionsForRole(role: UserRole): UndertakingPermission[] {
  return ROLE_PERMISSIONS[role]?.undertakings || [];
}

// ============================================================================
// BLOCKED ACTION SIGNALING
// ============================================================================

/**
 * Define when actions are blocked and how to signal this in UI
 */
export type BlockedActionReason =
  | 'blocking_undertaking'    // Cannot proceed until undertaking completed
  | 'missing_required_document' // Document required but not uploaded
   | 'expired_consent'          // Consent period expired
   | 'no_dpdp_consent'     // DPDP consent not given
   | 'pending_payment'       // Payment overdue blocks feature
   | 'account_suspended'       // Account suspended
   | 'role_missing'           // Role missing for action
   | 'feature_flag_disabled'   // Feature flag disabled
   | 'maintenance_mode'     // System in maintenance mode

export interface BlockedAction {
  action: string;           // Action being attempted
  reason: BlockedActionReason;  // Why it's blocked
  canUnblockBy?: string[];     // Which roles can unblock
  allowedBy?: string[];        // Which roles can always unblock
}

/**
 * Check if an action is blocked for a role
 */
export function isActionBlockedForRole(
  role: UserRole,
  blockedAction: BlockedAction
): boolean {
  if (!blockedAction.canUnblockBy?.includes(role)) {
    return true;
  }
  return false;
}

// ============================================================================
// ROLE MANAGEMENT
// ============================================================================

/**
 * User role management and feature flags
 */
export type FeatureFlag =
  | 'undertaking_blocking_enabled'    // Blocking undertakings prevents other actions
   | 'document_upload_required'     // Documents required for proceeding
   | 'payment_overdue_blocking' // Overdue payment blocks features
   | 'maintenance_mode'           // System maintenance mode active
   | 'legal_compliance_mode'   // Legal/compliance review mode

export interface RoleConfig {
  roleId: string;
  roleName: string;
  description: string;
  canManage: {
    documents?: boolean;
    undertakings?: boolean;
    auditLogs?: boolean;
    dpdpConsents?: boolean;
    roleManagement?: boolean;
    systemConfig?: boolean;
  };
  featureFlags?: FeatureFlag[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  applicant: {
    roleId: 'applicant',
    roleName: 'Applicant (Guest)',
    description: 'Guest applying for admission without account',
    canManage: {
      documents: false,
      undertakings: false,
      auditLogs: false,
      dpdpConsents: false,
      roleManagement: false,
      systemConfig: false
    },
    featureFlags: []
  },

  student: {
    roleId: 'student',
    roleName: 'Student (Resident)',
    description: 'Resident with approved account',
    canManage: {
      documents: true,
      undertakings: true,
      auditLogs: false,
      dpdpConsents: true,
      roleManagement: false
    },
    featureFlags: []
  },

  parent: {
    roleId: 'parent',
    roleName: 'Parent (View-only)',
    description: 'Parent viewing their ward info',
    canManage: {
      documents: true,  // Read-only, no write
      undertakings: true,
      auditLogs: false,
      dpdpConsents: true,
      roleManagement: false
    },
    featureFlags: [
      'parent_child_view_only',  // Parent can only see their child's data, not other students
      'parent_student_search_only'  // Parent can only search their ward, not other students
    ]
  },

  local_guardian: {
    roleId: 'local_guardian',
    roleName: 'Local Guardian (View-only)',
    description: 'Local guardian viewing ward info',
    canManage: {
      documents: true,
      undertakings: true,
      auditLogs: false,
      dpdpConsents: true,
      roleManagement: false
    },
    featureFlags: [
      'local_guardian_child_view_only'  // Can only see their child's data
    ]
  },

  superintendent: {
    roleId: 'superintendent',
    roleName: 'Superintendent',
    description: 'Superintendent managing vertical',
    canManage: {
      documents: true,
      undertakings: true,
      auditLogs: true,
      dpdpConsents: true,
      roleManagement: false
    },
    featureFlags: [
      'vertical_management'  // Can manage vertical-specific settings
    ]
  },

  trustee: {
    roleId: 'trustee',
    roleName: 'Trustee',
    description: 'Trustee approving applications',
    canManage: {
      documents: true,
      undertakings: true,
      auditLogs: true,
      dpdpConsents: true,
      roleManagement: false
    },
    featureFlags: []
  },

  verifier: {
    roleId: 'verifier',
    roleName: 'Verifier',
    description: 'Verifier checking documents',
    canManage: {
      documents: false,  // Can verify/reject only
      undertakings: false,
      auditLogs: true,
      dpdpConsents: false,
      roleManagement: false
    },
    featureFlags: []
  },

  accounts: {
    roleId: 'accounts',
    roleName: 'Accounts Team',
    description: 'Accounts managing finances',
    canManage: {
      documents: true,
      undertakings: false,
      auditLogs: true,
      dpdpConsents: true,
      roleManagement: false
    },
    featureFlags: []
  },

  legal_compliance: {
    roleId: 'legal_compliance',
    roleName: 'Legal Compliance',
    description: 'Legal/compliance officer reviewing documents',
    canManage: {
      documents: true,
      undertakings: true,
      auditLogs: true,
      dpdpConsents: true,
      roleManagement: false
    },
    featureFlags: [
      'can_approve_any_document',  // Can approve any document regardless
      'can_request_any_revision',  // Can request revision to any document
      'legal_review_mode'  // Legal compliance review mode active
    ]
  },

  admin: {
    roleId: 'admin',
    roleName: 'Administrator',
    description: 'System administrator',
    canManage: {
      documents: ['*'],
      undertakings: ['*'],
      auditLogs: true,
      dpdpConsents: true,
      roleManagement: true
    },
    featureFlags: [
      'can_access_any_document',
      'can_access_any_audit_log',
      'can_access_any_consent_log',
      'can_modify_feature_flags',  // Can enable/disable features
      'can_access_all_dpdp_consents',
      'can_access_all_audit_trail',  // Full audit trail
      'can_modify_role_configs'    // Can manage role configurations
    ]
  },

  system: {
    roleId: 'system',
    roleName: 'System Processes',
    description: 'Automated background processes',
    canManage: {
      documents: ['*'],
      undertakings: ['*'],
      auditLogs: true,
      dpdpConsents: false,  // System doesn't have access to user data
      roleManagement: false
    },
    featureFlags: [
      'background_processing_jobs'  // Async jobs (virus scan, PDF generation)
    ]
  }
};

/**
 * Get role config by role ID
 */
export function getRoleConfig(roleId: string): RoleConfig {
  return ROLE_CONFIGS[roleId as keyof typeof ROLE_CONFIGS || 'admin'];
}

/**
 * Get all role IDs
 */
export function getAllRoleIds(): string[] {
  return Object.keys(ROLE_CONFIGS);
}

/**
 * Get all active feature flags across all roles
 */
export function getAllFeatureFlags(): FeatureFlag[] {
  const flags: FeatureFlag[] = [];
  
  Object.values(ROLE_CONFIGS).forEach(roleConfig => {
    roleConfig.featureFlags?.forEach(flag => {
      if (!flags.includes(flag)) {
        flags.push(flag);
      }
    });
  });
  
  return flags;
}

// ============================================================================
// LEGAL/COMPLIANCE WORKFLOWS
// ============================================================================

/**
 * Legal/compliance review workflows for documents and undertakings
 */
export type LegalReviewWorkflow =
  | 'pending_review'          // Documents/undertakings awaiting review
  | 'under_review'            // Documents/undertakings in review
   | 'compliance_check'        // Compliance and DPDP checks
   | 'legal_approval'          // Legal officer approval required
   | 'revision_request'        // Request to revise document language
   | 'template_update'        // Update document template
   | 'versioning_rollback'    // Rollback to previous version

export interface LegalReviewWorkflowConfig {
  workflowType: LegalReviewWorkflow;
  description: string;
  steps: string[];
  allowedRoles: UserRole[];
  autoApproveAfter?: UserRole; // Role that auto-approves without manual review
  requiresApprovalFrom: UserRole[];    // Roles requiring sign-off
  actionTimeoutHours: number;   // Auto-approve if no decision within X hours
}

export const LEGAL_REVIEW_WORKFLOWS: Record<LegalReviewWorkflow, LegalReviewWorkflowConfig> = {
  pending_review: {
    workflowType: 'pending_review',
    description: 'Documents and undertakings awaiting legal/compliance review',
    steps: [
      'Auto-submit to legal/compliance review',
      'Manual compliance checks by legal officer',
      'Review by trustee (optional)',
      'Legal officer approval'
    ],
    allowedRoles: ['trustee', 'legal_compliance'],
    autoApproveAfter: 'legal_compliance',
    actionTimeoutHours: 48
  },

  under_review: {
    workflowType: 'under_review',
    description: 'Documents/undertakings in review',
    steps: [
      'Check completeness',
      'Verify DPDP consent status',
      'Review policy compliance',
      'Add review remarks',
      'Request legal officer approval'
    ],
    allowedRoles: ['trustee', 'legal_compliance'],
    autoApproveAfter: 'legal_compliance',
    actionTimeoutHours: 72
  },

  compliance_check: {
    workflowType: 'compliance_check',
    description: 'Compliance and DPDP verification',
    steps: [
      'Verify document types and DPDP consent language',
      'Check policy version against current law',
      'Flag compliance issues'
    ],
    allowedRoles: ['legal_compliance'],
    autoApproveAfter: 'legal_compliance',
    actionTimeoutHours: 24
  },

  legal_approval: {
    workflowType: 'legal_approval',
    description: 'Legal officer sign-off required',
    steps: [
      'Review document and undertaking content',
      'Verify signature authenticity',
      'Grant approval'
    ],
    allowedRoles: ['trustee', 'legal_compliance'],
    autoApproveAfter: 'legal_compliance',
    actionTimeoutHours: 24
  },

  revision_request: {
    workflowType: 'revision_request',
    description: 'Request update to document/undertaking language',
    steps: [
      'Identify sections needing revision',
      'Proposed changes with justification',
      'Upload revision document',
      'Request trustee approval'
    ],
    allowedRoles: ['trustee', 'legal_compliance', 'superintendent'],
    autoApproveAfter: 'legal_compliance',
    actionTimeoutHours: 48
  },

  template_update: {
    workflowType: 'template_update',
    description: 'Update document template',
    steps: [
      'Propose template changes',
      'Review with stakeholders',
      'Upload new template version',
      'Request trustee approval'
    ],
    allowedRoles: ['trustee', 'legal_compliance'],
    autoApproveAfter: 'legal_compliance',
    actionTimeoutHours: 48
  },

  versioning_rollback: {
    workflowType: 'versioning_rollback',
    description: 'Rollback to previous version',
    steps: [
      'Select target version',
      'Verify impact on current state',
      'Execute rollback',
      'Log versioning event'
    ],
    allowedRoles: ['trustee', 'legal_compliance', 'admin'],
    autoApproveAfter: 'legal_compliance',
    actionTimeoutHours: 72
  }
};

/**
 * Get workflow config by type
 */
export function getLegalReviewWorkflow(
  workflowType: LegalReviewWorkflow
): LegalReviewWorkflowConfig {
  return LEGAL_REVIEW_WORKFLOWS[workflowType];
}

// ============================================================================
// BLOCKED ACTION MESSAGES
// ============================================================================

/**
 * UI messages for different blocked action scenarios
 */
export const BLOCKED_ACTION_MESSAGES: Record<BlockedAction, string> = {
  blocking_undertaking: {
    message: 'This undertaking is blocking access to other features. Please complete this undertaking to proceed.',
    action: 'Complete Undertaking',
    unblockText: 'Complete Undertaking'
  },
  missing_required_document: {
    message: 'A required document must be uploaded before proceeding. Upload the missing document to continue.',
    action: 'Upload Document',
    unblockText: 'Upload Required Document'
  },
  expired_consent: {
    message: 'The consent period for this undertaking has expired. Please provide updated consent to continue.',
    action: 'Update Consent',
    unblockText: 'Renew Consent'
  },
  no_dpdp_consent: {
    message: 'DPDP consent not provided. Please review and acknowledge the data usage policy.',
    action: 'Acknowledge Consent',
    unblockText: 'Acknowledge DPDP'
  },
  pending_payment: {
    message: 'Outstanding payment must be cleared before accessing other features.',
    action: 'Pay Outstanding',
    unblockText: 'Clear Payment'
  },
  account_suspended: {
    message: 'Your account has been suspended. Contact administrator to restore access.',
    action: 'Contact Admin',
    unblockText: 'Resolve Suspension'
  },
  role_missing: {
    message: 'Your role does not have permission to perform this action. Contact administrator.',
    action: 'Contact Admin',
    unblockText: 'Contact Administrator'
  },
  feature_flag_disabled: {
    message: 'This feature is currently disabled. Contact administrator.',
    action: 'Enable Feature'
    unblockText: 'Enable Feature'
  },
  maintenance_mode: {
    message: 'System is in maintenance mode. Try again later.',
    action: 'Contact Admin',
    unblockText: 'Check Status'
  }
};

/**
 * Get blocked message for role and action
 */
export function getBlockedMessage(
  role: UserRole,
  action: string
): string {
  const actionKey = `${action}` as keyof typeof BLOCKED_ACTION_MESSAGES;
  const blockedAction = BLOCKED_ACTION_MESSAGES[actionKey];
  
  const hasPermission = hasDocumentPermission(role, 'document', action) ||
                      hasDocumentPermission(role, 'undertaking', action);
  
  if (!hasPermission) {
    return blockedAction.message;
  }
  
  return null; // No blocking message if permitted
}

// ============================================================================
// FEATURE FLAG MANAGEMENT
// ============================================================================

/**
 * Feature flags that can be toggled by admins
 */
export interface FeatureFlagState {
  flagId: FeatureFlag;
  enabled: boolean;
  reason?: string;
  enabledAt?: string;
  enabledBy?: string;
  canDisable?: string[];
}

/**
 * Check if a role can manage a feature flag
 */
export function canManageFeatureFlag(
  role: UserRole,
  flagId: FeatureFlag
): boolean {
  const roleConfig = ROLE_CONFIGS[role];
  
  if (roleConfig.featureFlags?.includes(flagId)) {
    if (roleConfig.canDisable?.includes(flagId)) {
      return false; // Cannot disable if role in canDisable
    }
    }
  
  return true; // Can enable or disable
}

/**
 * Get all enabled features for a role
 */
export function getEnabledFeatureFlagsForRole(role: UserRole): FeatureFlag[] {
  const roleConfig = ROLE_CONFIGS[role];
  return roleConfig.featureFlags?.filter(f => f => f.enabled === true) || false;
}

/**
 * Toggle feature flag
 */
export function toggleFeatureFlag(
  flagId: FeatureFlag,
  enabled: boolean,
  reason?: string,
  enabledBy?: string
): FeatureFlagState {
  const existingFlag = getAllFeatureFlags().find(f => f.flagId === flagId);
  
  if (!existingFlag) {
    return {
      flagId,
      enabled,
      enabledAt: new Date().toISOString(),
      reason,
      enabledBy: enabledBy || 'admin'
    };
  }
  
  // Update existing flag state
  return { ...existingFlag, ... };
}

/**
 * Enable all features
 */
export function enableAllFeatureFlags(enabledBy: string): void {
  getAllFeatureFlags().forEach(flag => {
    toggleFeatureFlag(flag, true, 'Enabled globally by admin', enabledBy);
  });
}

/**
 * Disable all features
 */
export function disableAllFeatureFlags(enabledBy: string): void {
  getAllFeatureFlags().forEach(flag => {
    toggleFeatureFlag(flag, false, 'Disabled globally by admin', enabledBy);
  });
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/**
 * Default feature flag states
 */
export const DEFAULT_FEATURE_FLAGS: Record<FeatureFlag, boolean> = {
  undertaking_blocking_enabled: {
    flagId: 'undertaking_blocking_enabled',
    enabled: false,
    reason: 'Undertaking blocking disabled by default',
    enabledBy: 'admin'
  },
  document_upload_required: {
    flagId: 'document_upload_required',
    enabled: false,
    reason: 'Document upload required disabled by default',
    enabledBy: 'admin'
  },
  payment_overdue_blocking: {
    flagId: 'payment_overdue_blocking',
    enabled: false,
    reason: 'Payment overdue blocking disabled by default',
    enabledBy: 'admin'
  },
  maintenance_mode: {
    flagId: 'maintenance_mode',
    enabled: false,
    reason: 'Maintenance mode disabled by default',
    enabledBy: 'admin'
  },
  legal_review_mode: {
    flagId: 'legal_review_mode',
    enabled: true,
    reason: 'Legal compliance review mode active by default',
    enabledBy: 'admin'
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export * All exports organized by category
 */
export const ROLE_PERMISSIONS_EXPORT = {
  // Document permissions
  documents: ROLE_PERMISSIONS,
  // Undertaking permissions
  undertakings: ROLE_PERMISSIONS
};

export const DPDP_CONSENT_VISIBILITY_EXPORT = DPDP_CONSENT_VISIBILITY;

export const AUDIT_TRAIL_VISIBILITY_EXPORT = AUDIT_TRAIL_VISIBILITY;

export const BLOCKED_ACTION_MESSAGES_EXPORT = BLOCKED_ACTION_MESSAGES;

export const ROLE_CONFIGS_EXPORT = ROLE_CONFIGS;

export const LEGAL_REVIEW_WORKFLOWS_EXPORT = LEGAL_REVIEW_WORKFLOWS;

export const FEATURE_FLAGS_EXPORT = getAllFeatureFlags();

export {
  ROLE_PERMISSIONS_EXPORT,
  DPDP_CONSENT_VISIBILITY_EXPORT,
  AUDIT_TRAIL_VISIBILITY_EXPORT,
  BLOCKED_ACTION_MESSAGES_EXPORT,
  ROLE_CONFIGS_EXPORT,
  LEGAL_REVIEW_WORKFLOWS_EXPORT,
  FEATURE_FLAGS_EXPORT
};
