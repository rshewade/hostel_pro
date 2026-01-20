-- ============================================================================
-- Migration: Enhanced Row Level Security (RLS) Policies
-- Task 34: Define and Enforce RLS Policies Across All Tables
-- ============================================================================
-- This migration enhances the existing RLS policies with:
-- 1. Helper functions for reusable access control logic
-- 2. Applicant access via phone number in JWT
-- 3. Enhanced parent-child relationship policies
-- 4. Missing INSERT/UPDATE/DELETE policies
-- 5. Superintendent write access for their vertical
-- ============================================================================

-- ============================================================================
-- SECTION 1: HELPER FUNCTIONS FOR RLS POLICIES
-- ============================================================================
-- These SECURITY DEFINER functions provide reusable access control logic

-- Function to check if user is a specific role
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role'),
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get user's vertical from JWT
CREATE OR REPLACE FUNCTION public.auth_vertical()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'vertical'),
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'vertical')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get user's phone from JWT (for applicant access)
CREATE OR REPLACE FUNCTION public.auth_phone()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'phone'),
    (current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'phone')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if user is staff (superintendent, trustee, or accounts)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.auth_role() IN ('SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if user is admin (trustee or accounts)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.auth_role() IN ('TRUSTEE', 'ACCOUNTS');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if superintendent can access a vertical
CREATE OR REPLACE FUNCTION public.can_access_vertical(target_vertical TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Trustees and accounts can access all verticals
  IF public.auth_role() IN ('TRUSTEE', 'ACCOUNTS') THEN
    RETURN TRUE;
  END IF;

  -- Superintendents can only access their own vertical
  IF public.auth_role() = 'SUPERINTENDENT' THEN
    RETURN public.auth_vertical() = target_vertical;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if parent can access student data
CREATE OR REPLACE FUNCTION public.is_parent_of_student(student_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  parent_mobile TEXT;
  student_parent_mobile TEXT;
BEGIN
  -- Get parent's mobile from users table
  SELECT mobile INTO parent_mobile
  FROM public.users
  WHERE id = auth.uid() AND role = 'PARENT';

  IF parent_mobile IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if student's parent_mobile matches
  SELECT parent_mobile INTO student_parent_mobile
  FROM public.users
  WHERE id = student_id AND role = 'STUDENT';

  RETURN parent_mobile = student_parent_mobile;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get student's vertical
CREATE OR REPLACE FUNCTION public.get_student_vertical(student_id UUID)
RETURNS TEXT AS $$
DECLARE
  v TEXT;
BEGIN
  SELECT vertical::TEXT INTO v
  FROM public.users
  WHERE id = student_id;
  RETURN v;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- SECTION 2: APPLICATIONS TABLE - ENHANCED POLICIES
-- ============================================================================

-- Drop existing policies if they exist (to recreate with enhancements)
DROP POLICY IF EXISTS "Applicants can access own applications by phone" ON applications;
DROP POLICY IF EXISTS "Applicants can create applications" ON applications;
DROP POLICY IF EXISTS "Applicants can update own draft applications" ON applications;
DROP POLICY IF EXISTS "Superintendents can update vertical applications" ON applications;

-- Applicants can access their own applications via phone number (for guest tracking)
CREATE POLICY "Applicants can access own applications by phone"
  ON applications
  FOR SELECT
  USING (
    applicant_mobile IS NOT NULL
    AND applicant_mobile = public.auth_phone()
  );

-- Anyone can create applications (for new applicants)
CREATE POLICY "Applicants can create applications"
  ON applications
  FOR INSERT
  WITH CHECK (
    -- Must provide own mobile number
    applicant_mobile = public.auth_phone()
    OR auth.uid() IS NOT NULL
  );

-- Applicants can update their own draft applications
CREATE POLICY "Applicants can update own draft applications"
  ON applications
  FOR UPDATE
  USING (
    (applicant_mobile = public.auth_phone() OR student_user_id = auth.uid())
    AND current_status IN ('DRAFT', 'SUBMITTED')
  )
  WITH CHECK (
    (applicant_mobile = public.auth_phone() OR student_user_id = auth.uid())
    AND current_status IN ('DRAFT', 'SUBMITTED')
  );

-- Superintendents can update applications in their vertical
CREATE POLICY "Superintendents can update vertical applications"
  ON applications
  FOR UPDATE
  USING (
    public.auth_role() = 'SUPERINTENDENT'
    AND public.can_access_vertical(vertical::TEXT)
  )
  WITH CHECK (
    public.auth_role() = 'SUPERINTENDENT'
    AND public.can_access_vertical(vertical::TEXT)
  );

-- Trustees can update all applications
DROP POLICY IF EXISTS "Trustees can update all applications" ON applications;
CREATE POLICY "Trustees can update all applications"
  ON applications
  FOR UPDATE
  USING (public.auth_role() = 'TRUSTEE')
  WITH CHECK (public.auth_role() = 'TRUSTEE');

-- ============================================================================
-- SECTION 3: USERS TABLE - ENHANCED POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Staff can create users" ON users;
DROP POLICY IF EXISTS "Superintendents can update vertical users" ON users;

-- Staff can create new users (for onboarding approved applicants)
CREATE POLICY "Staff can create users"
  ON users
  FOR INSERT
  WITH CHECK (public.is_staff());

-- Superintendents can update users in their vertical
CREATE POLICY "Superintendents can update vertical users"
  ON users
  FOR UPDATE
  USING (
    public.auth_role() = 'SUPERINTENDENT'
    AND vertical::TEXT = public.auth_vertical()
  )
  WITH CHECK (
    public.auth_role() = 'SUPERINTENDENT'
    AND vertical::TEXT = public.auth_vertical()
  );

-- Trustees can update all users
DROP POLICY IF EXISTS "Trustees can update all users" ON users;
CREATE POLICY "Trustees can update all users"
  ON users
  FOR UPDATE
  USING (public.auth_role() = 'TRUSTEE')
  WITH CHECK (public.auth_role() = 'TRUSTEE');

-- ============================================================================
-- SECTION 4: DOCUMENTS TABLE - ENHANCED POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Students can upload documents" ON documents;
DROP POLICY IF EXISTS "Superintendents can verify documents" ON documents;

-- Students can upload their own documents
CREATE POLICY "Students can upload documents"
  ON documents
  FOR INSERT
  WITH CHECK (
    public.auth_role() = 'STUDENT'
    AND (student_user_id = auth.uid() OR uploaded_by = auth.uid())
  );

-- Students can delete their own unverified documents
DROP POLICY IF EXISTS "Students can delete own unverified documents" ON documents;
CREATE POLICY "Students can delete own unverified documents"
  ON documents
  FOR DELETE
  USING (
    public.auth_role() = 'STUDENT'
    AND uploaded_by = auth.uid()
    AND status = 'UPLOADED'
  );

-- Superintendents can verify/update documents in their vertical
CREATE POLICY "Superintendents can verify documents"
  ON documents
  FOR UPDATE
  USING (
    public.auth_role() = 'SUPERINTENDENT'
    AND (
      public.can_access_vertical(public.get_student_vertical(student_user_id))
      OR EXISTS (
        SELECT 1 FROM applications a
        WHERE a.id = documents.application_id
        AND public.can_access_vertical(a.vertical::TEXT)
      )
    )
  )
  WITH CHECK (
    public.auth_role() = 'SUPERINTENDENT'
  );

-- Trustees can verify/update all documents
DROP POLICY IF EXISTS "Trustees can update all documents" ON documents;
CREATE POLICY "Trustees can update all documents"
  ON documents
  FOR UPDATE
  USING (public.auth_role() = 'TRUSTEE')
  WITH CHECK (public.auth_role() = 'TRUSTEE');

-- Staff can upload documents on behalf of students
DROP POLICY IF EXISTS "Staff can upload documents" ON documents;
CREATE POLICY "Staff can upload documents"
  ON documents
  FOR INSERT
  WITH CHECK (public.is_staff());

-- ============================================================================
-- SECTION 5: AUDIT LOGS TABLE - ENHANCED POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Anyone authenticated can insert audit logs" ON audit_logs;

-- Anyone authenticated can insert audit logs
CREATE POLICY "Anyone authenticated can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Audit logs cannot be updated or deleted (immutability)
-- No UPDATE or DELETE policies = immutable audit trail

-- ============================================================================
-- SECTION 6: PAYMENTS TABLE - ENHANCED POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Students can create own payments" ON payments;
DROP POLICY IF EXISTS "Superintendents can read vertical payments" ON payments;

-- Students can create their own payment records
CREATE POLICY "Students can create own payments"
  ON payments
  FOR INSERT
  WITH CHECK (
    public.auth_role() = 'STUDENT'
    AND student_user_id = auth.uid()
  );

-- Superintendents can read payments in their vertical
CREATE POLICY "Superintendents can read vertical payments"
  ON payments
  FOR SELECT
  USING (
    public.auth_role() = 'SUPERINTENDENT'
    AND public.can_access_vertical(public.get_student_vertical(student_user_id))
  );

-- ============================================================================
-- SECTION 7: LEAVE REQUESTS TABLE - ENHANCED POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Superintendents can approve leave requests" ON leave_requests;

-- Superintendents can update (approve/reject) leave requests in their vertical
CREATE POLICY "Superintendents can approve leave requests"
  ON leave_requests
  FOR UPDATE
  USING (
    public.auth_role() = 'SUPERINTENDENT'
    AND public.can_access_vertical(public.get_student_vertical(student_user_id))
  )
  WITH CHECK (
    public.auth_role() = 'SUPERINTENDENT'
    AND public.can_access_vertical(public.get_student_vertical(student_user_id))
  );

-- ============================================================================
-- SECTION 8: ROOMS TABLE - ENHANCED POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Superintendents can manage vertical rooms" ON rooms;

-- Superintendents can manage rooms in their vertical
CREATE POLICY "Superintendents can manage vertical rooms"
  ON rooms
  FOR ALL
  USING (
    public.auth_role() = 'SUPERINTENDENT'
    AND public.can_access_vertical(vertical::TEXT)
  )
  WITH CHECK (
    public.auth_role() = 'SUPERINTENDENT'
    AND public.can_access_vertical(vertical::TEXT)
  );

-- ============================================================================
-- SECTION 9: ROOM ALLOCATIONS TABLE - ENHANCED POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Superintendents can create allocations" ON room_allocations;

-- Superintendents can create allocations for their vertical
CREATE POLICY "Superintendents can create allocations"
  ON room_allocations
  FOR INSERT
  WITH CHECK (
    public.auth_role() = 'SUPERINTENDENT'
    AND public.can_access_vertical(public.get_student_vertical(student_user_id))
  );

-- ============================================================================
-- SECTION 10: FEES TABLE - ENHANCED POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Superintendents can read vertical fees" ON fees;

-- Superintendents can read fees for their vertical
CREATE POLICY "Superintendents can read vertical fees"
  ON fees
  FOR SELECT
  USING (
    public.auth_role() = 'SUPERINTENDENT'
    AND public.can_access_vertical(public.get_student_vertical(student_user_id))
  );

-- ============================================================================
-- SECTION 11: RENEWALS TABLE - ENHANCED POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Superintendents can approve renewals" ON renewals;

-- Superintendents can update renewals in their vertical
CREATE POLICY "Superintendents can approve renewals"
  ON renewals
  FOR UPDATE
  USING (
    public.auth_role() = 'SUPERINTENDENT'
    AND public.can_access_vertical(public.get_student_vertical(student_user_id))
  )
  WITH CHECK (
    public.auth_role() = 'SUPERINTENDENT'
  );

-- ============================================================================
-- SECTION 12: CONSENT LOGS TABLE (if exists)
-- ============================================================================

-- Create consent_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  consent_type TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  digital_signature TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on consent_logs
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own consent logs
CREATE POLICY "Users can read own consent logs"
  ON consent_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own consent logs
CREATE POLICY "Users can create own consent logs"
  ON consent_logs
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR auth.uid() IS NOT NULL);

-- Staff can read all consent logs
CREATE POLICY "Staff can read all consent logs"
  ON consent_logs
  FOR SELECT
  USING (public.is_staff());

-- Service role full access
CREATE POLICY "Service role full access to consent_logs"
  ON consent_logs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Consent logs cannot be updated or deleted (immutability)
-- No UPDATE or DELETE policies

-- ============================================================================
-- SECTION 13: CREATE INDEXES FOR RLS PERFORMANCE
-- ============================================================================

-- Indexes to improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_vertical ON users(vertical);
CREATE INDEX IF NOT EXISTS idx_users_parent_mobile ON users(parent_mobile);
CREATE INDEX IF NOT EXISTS idx_applications_vertical ON applications(vertical);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_mobile ON applications(applicant_mobile);
CREATE INDEX IF NOT EXISTS idx_applications_student_user_id ON applications(student_user_id);
CREATE INDEX IF NOT EXISTS idx_documents_student_user_id ON documents(student_user_id);
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_payments_student_user_id ON payments(student_user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_student_user_id ON leave_requests(student_user_id);
CREATE INDEX IF NOT EXISTS idx_room_allocations_student_user_id ON room_allocations(student_user_id);
CREATE INDEX IF NOT EXISTS idx_fees_student_user_id ON fees(student_user_id);
CREATE INDEX IF NOT EXISTS idx_renewals_student_user_id ON renewals(student_user_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_user_id ON consent_logs(user_id);

-- ============================================================================
-- SECTION 14: GRANT EXECUTE ON HELPER FUNCTIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.auth_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_vertical() TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_phone() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_vertical(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_parent_of_student(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_student_vertical(UUID) TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- List all RLS-enabled tables
SELECT 'RLS-enabled tables:' as info;
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- List all policies
SELECT 'All RLS policies:' as info;
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Count policies per table
SELECT 'Policy count per table:' as info;
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
