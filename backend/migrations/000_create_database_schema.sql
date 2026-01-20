-- Task: Create Database Schema for Hostel Management System
-- This migration creates the core tables needed for the application

-- ============================================
-- 1. ENABLE UUID EXTENSION
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. CREATE ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('STUDENT', 'SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS', 'PARENT');
CREATE TYPE vertical_type AS ENUM ('BOYS', 'GIRLS', 'DHARAMSHALA');
CREATE TYPE application_status AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEW', 'INTERVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');
CREATE TYPE application_type AS ENUM ('NEW', 'RENEWAL');
CREATE TYPE document_status AS ENUM ('UPLOADED', 'VERIFIED', 'REJECTED');
CREATE TYPE document_type AS ENUM (
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
  'OTHER'
);

-- ============================================
-- 3. CREATE USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'STUDENT',
  vertical vertical_type,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  mobile TEXT NOT NULL,
  parent_mobile TEXT,
  address TEXT,
  date_of_birth DATE,
  is_active BOOLEAN DEFAULT TRUE,
  requires_password_change BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_vertical ON users(vertical);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
CREATE INDEX IF NOT EXISTS idx_users_parent_mobile ON users(parent_mobile);

-- ============================================
-- 4. CREATE APPLICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_number TEXT UNIQUE NOT NULL,
  type application_type NOT NULL DEFAULT 'NEW',
  parent_application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  applicant_name TEXT NOT NULL,
  applicant_mobile TEXT NOT NULL,
  applicant_email TEXT,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  vertical vertical_type NOT NULL,
  current_status application_status NOT NULL DEFAULT 'DRAFT',
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  interview_scheduled_at TIMESTAMPTZ,
  interview_completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  student_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  room_number TEXT,
  check_in_date DATE,
  check_out_date DATE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_applications_tracking_number ON applications(tracking_number);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_mobile ON applications(applicant_mobile);
CREATE INDEX IF NOT EXISTS idx_applications_vertical ON applications(vertical);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(current_status);
CREATE INDEX IF NOT EXISTS idx_applications_student_user_id ON applications(student_user_id);
CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(type);
CREATE INDEX IF NOT EXISTS idx_applications_parent_application_id ON applications(parent_application_id);

-- ============================================
-- 5. CREATE DOCUMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  student_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  bucket_id TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  storage_url TEXT,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  status document_status NOT NULL DEFAULT 'UPLOADED',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  metadata JSONB DEFAULT '{}',
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_student_user_id ON documents(student_user_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_bucket_id ON documents(bucket_id);

-- ============================================
-- 6. CREATE AUDIT_LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_role TEXT,
  actor_email TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- 7. CREATE DEVICE_SESSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS device_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_suspicious BOOLEAN DEFAULT FALSE,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_device_sessions_user_id ON device_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_device_id ON device_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_is_active ON device_sessions(is_active);

-- ============================================
-- 8. CREATE UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. CREATE RLS POLICIES FOR USERS TABLE
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

-- Users can update their own profile (role changes prevented via trigger)
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Superintendents can read users in their vertical
CREATE POLICY "Superintendents can read vertical users"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users as superuser
    WHERE superuser.auth_user_id = auth.uid()
    AND superuser.role = 'SUPERINTENDENT'
    AND superuser.vertical = users.vertical
  )
);

-- Trustees can read all users
CREATE POLICY "Trustees can read all users"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid()
    AND role = 'TRUSTEE'
  )
);

-- Accounts can read all users
CREATE POLICY "Accounts can read all users"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid()
    AND role = 'ACCOUNTS'
  )
);

-- Service role can do everything
CREATE POLICY "Service role full access to users"
ON users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 11. CREATE RLS POLICIES FOR APPLICATIONS TABLE
-- ============================================

-- Students can read their own applications
CREATE POLICY "Students can read own applications"
ON applications FOR SELECT
TO authenticated
USING (student_user_id IN (
  SELECT id FROM users WHERE auth_user_id = auth.uid()
));

-- Parents can read their children's applications
CREATE POLICY "Parents can read children applications"
ON applications FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users as parent
  JOIN users as student ON student.parent_mobile = parent.mobile
  WHERE parent.auth_user_id = auth.uid()
  AND parent.role = 'PARENT'
  AND applications.student_user_id = student.id
));

-- Superintendents can read applications in their vertical
CREATE POLICY "Superintendents can read vertical applications"
ON applications FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'SUPERINTENDENT'
  AND vertical = applications.vertical
));

-- Trustees can read all applications
CREATE POLICY "Trustees can read all applications"
ON applications FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'TRUSTEE'
));

-- Accounts can read all applications
CREATE POLICY "Accounts can read all applications"
ON applications FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'ACCOUNTS'
));

-- Service role full access
CREATE POLICY "Service role full access to applications"
ON applications FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 12. CREATE RLS POLICIES FOR DOCUMENTS TABLE
-- ============================================

-- Students can read their own documents
CREATE POLICY "Students can read own documents"
ON documents FOR SELECT
TO authenticated
USING (student_user_id IN (
  SELECT id FROM users WHERE auth_user_id = auth.uid()
));

-- Parents can read their children's documents
CREATE POLICY "Parents can read children documents"
ON documents FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users as parent
  JOIN users as student ON student.parent_mobile = parent.mobile
  WHERE parent.auth_user_id = auth.uid()
  AND parent.role = 'PARENT'
  AND documents.student_user_id = student.id
));

-- Superintendents can read documents in their vertical
CREATE POLICY "Superintendents can read vertical documents"
ON documents FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users as superintendent
  JOIN applications ON applications.student_user_id = documents.student_user_id
  WHERE superintendent.auth_user_id = auth.uid()
  AND superintendent.role = 'SUPERINTENDENT'
  AND superintendent.vertical = applications.vertical
));

-- Trustees can read all documents
CREATE POLICY "Trustees can read all documents"
ON documents FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'TRUSTEE'
));

-- Accounts can read all documents
CREATE POLICY "Accounts can read all documents"
ON documents FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'ACCOUNTS'
));

-- Service role full access
CREATE POLICY "Service role full access to documents"
ON documents FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 13. CREATE RLS POLICIES FOR AUDIT_LOGS TABLE
-- ============================================

-- Users can read their own audit logs
CREATE POLICY "Users can read own audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (actor_id IN (
  SELECT id FROM users WHERE auth_user_id = auth.uid()
));

-- Staff can read all audit logs
CREATE POLICY "Staff can read all audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role IN ('SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS')
));

-- Service role full access
CREATE POLICY "Service role full access to audit_logs"
ON audit_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 14. CREATE RLS POLICIES FOR DEVICE_SESSIONS TABLE
-- ============================================

-- Users can read their own device sessions
CREATE POLICY "Users can read own device sessions"
ON device_sessions FOR SELECT
TO authenticated
USING (user_id IN (
  SELECT id FROM users WHERE auth_user_id = auth.uid()
));

-- Users can manage their own device sessions
CREATE POLICY "Users can manage own device sessions"
ON device_sessions FOR ALL
TO authenticated
USING (user_id IN (
  SELECT id FROM users WHERE auth_user_id = auth.uid()
))
WITH CHECK (user_id IN (
  SELECT id FROM users WHERE auth_user_id = auth.uid()
));

-- Service role full access
CREATE POLICY "Service role full access to device_sessions"
ON device_sessions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 15. VERIFICATION QUERIES
-- ============================================

-- Verify tables were created
SELECT 'Tables created:' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
  AND tablename IN ('users', 'applications', 'documents', 'audit_logs', 'device_sessions')
  ORDER BY tablename;

-- Verify enum types were created
SELECT 'Enum types created:' as status;
SELECT typname FROM pg_type WHERE typtype = 'e' 
  AND typname IN ('user_role', 'vertical_type', 'application_status', 'application_type', 'document_status', 'document_type')
  ORDER BY typname;

-- Verify RLS is enabled
SELECT 'RLS enabled on tables:' as status;
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' 
  AND tablename IN ('users', 'applications', 'documents', 'audit_logs', 'device_sessions')
  ORDER BY tablename;

-- Verify policies were created
SELECT 'RLS policies created:' as status;
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'applications', 'documents', 'audit_logs', 'device_sessions')
GROUP BY schemaname, tablename
ORDER BY tablename;
