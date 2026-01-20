-- Migration: Compliance Tables
-- Description: Create tables for DPDP compliance - consent, archival, audit reports
-- Date: 2026-01-01

-- ============================================
-- 1. Enhance Consent Logs Table (already exists from RLS migration)
-- ============================================

-- Add missing columns to consent_logs for DPDP compliance
DO $$
BEGIN
    -- Add consent_text_hash column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'consent_logs' AND column_name = 'consent_text_hash') THEN
        ALTER TABLE public.consent_logs ADD COLUMN consent_text_hash VARCHAR(64);
    END IF;

    -- Add device_info column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'consent_logs' AND column_name = 'device_info') THEN
        ALTER TABLE public.consent_logs ADD COLUMN device_info TEXT;
    END IF;

    -- Add expires_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'consent_logs' AND column_name = 'expires_at') THEN
        ALTER TABLE public.consent_logs ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;

    -- Add revoked_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'consent_logs' AND column_name = 'revoked_at') THEN
        ALTER TABLE public.consent_logs ADD COLUMN revoked_at TIMESTAMPTZ;
    END IF;

    -- Add revoked_reason column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'consent_logs' AND column_name = 'revoked_reason') THEN
        ALTER TABLE public.consent_logs ADD COLUMN revoked_reason TEXT;
    END IF;

    -- Add granted_at column (maps to accepted_at conceptually)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'consent_logs' AND column_name = 'granted_at') THEN
        ALTER TABLE public.consent_logs ADD COLUMN granted_at TIMESTAMPTZ DEFAULT NOW();
        -- Copy existing accepted_at values to granted_at
        UPDATE public.consent_logs SET granted_at = accepted_at WHERE granted_at IS NULL AND accepted_at IS NOT NULL;
    END IF;
END $$;

-- Indexes for consent_logs (additional)
CREATE INDEX IF NOT EXISTS idx_consent_logs_user ON consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_type ON consent_logs(consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_logs_expires ON consent_logs(expires_at);
CREATE INDEX IF NOT EXISTS idx_consent_logs_granted ON consent_logs(granted_at);

-- ============================================
-- 2. Applications Archive Table
-- ============================================

CREATE TABLE IF NOT EXISTS applications_archive (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_id UUID NOT NULL,
    tracking_number VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    vertical VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archive_reason VARCHAR(100) NOT NULL,
    summary_data JSONB DEFAULT '{}'::JSONB
);

-- Indexes for applications_archive
CREATE INDEX IF NOT EXISTS idx_applications_archive_original ON applications_archive(original_id);
CREATE INDEX IF NOT EXISTS idx_applications_archive_tracking ON applications_archive(tracking_number);
CREATE INDEX IF NOT EXISTS idx_applications_archive_archived ON applications_archive(archived_at);
CREATE INDEX IF NOT EXISTS idx_applications_archive_vertical ON applications_archive(vertical);

-- ============================================
-- 3. Audit Reports Table
-- ============================================

CREATE TABLE IF NOT EXISTS audit_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_month VARCHAR(7) NOT NULL,  -- YYYY-MM format
    report_url TEXT NOT NULL,
    summary JSONB DEFAULT '{}'::JSONB,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(report_month)
);

-- Indexes for audit_reports
CREATE INDEX IF NOT EXISTS idx_audit_reports_month ON audit_reports(report_month);

-- ============================================
-- 4. Enhance Audit Logs Table (add columns if missing)
-- ============================================

-- Add new columns to audit_logs if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'old_values') THEN
        ALTER TABLE public.audit_logs ADD COLUMN old_values JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'new_values') THEN
        ALTER TABLE public.audit_logs ADD COLUMN new_values JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'ip_address') THEN
        ALTER TABLE public.audit_logs ADD COLUMN ip_address INET;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'user_agent') THEN
        ALTER TABLE public.audit_logs ADD COLUMN user_agent TEXT;
    END IF;
END $$;

-- ============================================
-- 5. Add deleted_at to Users for soft delete (DPDP)
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'deleted_at') THEN
        ALTER TABLE public.users ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- Index for soft deleted users (only create if column exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'deleted_at') THEN
        CREATE INDEX IF NOT EXISTS idx_users_deleted ON public.users(deleted_at) WHERE deleted_at IS NOT NULL;
    END IF;
END $$;

-- ============================================
-- 6. RLS Policies
-- ============================================

-- Consent Logs RLS
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own consents
DROP POLICY IF EXISTS consent_logs_user_select ON consent_logs;
CREATE POLICY consent_logs_user_select ON consent_logs
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR auth_role() IN ('TRUSTEE', 'ACCOUNTS')
    );

-- Users can insert their own consents
DROP POLICY IF EXISTS consent_logs_user_insert ON consent_logs;
CREATE POLICY consent_logs_user_insert ON consent_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Only users can update their own consents (for revocation)
DROP POLICY IF EXISTS consent_logs_user_update ON consent_logs;
CREATE POLICY consent_logs_user_update ON consent_logs
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Service role full access
DROP POLICY IF EXISTS consent_logs_service ON consent_logs;
CREATE POLICY consent_logs_service ON consent_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Applications Archive RLS
ALTER TABLE applications_archive ENABLE ROW LEVEL SECURITY;

-- Only trustees can view archive
DROP POLICY IF EXISTS applications_archive_trustee_select ON applications_archive;
CREATE POLICY applications_archive_trustee_select ON applications_archive
    FOR SELECT
    TO authenticated
    USING (auth_role() = 'TRUSTEE');

-- Service role can manage archive
DROP POLICY IF EXISTS applications_archive_service ON applications_archive;
CREATE POLICY applications_archive_service ON applications_archive
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Audit Reports RLS
ALTER TABLE audit_reports ENABLE ROW LEVEL SECURITY;

-- Only trustees can view reports
DROP POLICY IF EXISTS audit_reports_trustee_select ON audit_reports;
CREATE POLICY audit_reports_trustee_select ON audit_reports
    FOR SELECT
    TO authenticated
    USING (auth_role() = 'TRUSTEE');

-- Service role can manage reports
DROP POLICY IF EXISTS audit_reports_service ON audit_reports;
CREATE POLICY audit_reports_service ON audit_reports
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- 7. Comments
-- ============================================

COMMENT ON TABLE consent_logs IS 'DPDP compliant consent tracking with 6-month renewal cycle';

-- Add column comments safely (only if columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'consent_logs' AND column_name = 'consent_text_hash') THEN
        COMMENT ON COLUMN public.consent_logs.consent_text_hash IS 'SHA-256 hash of the consent text for verification';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'consent_logs' AND column_name = 'expires_at') THEN
        COMMENT ON COLUMN public.consent_logs.expires_at IS 'Consent expiry date (typically 6 months from grant)';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'deleted_at') THEN
        COMMENT ON COLUMN public.users.deleted_at IS 'Soft delete timestamp for DPDP data deletion requests';
    END IF;
END $$;

COMMENT ON TABLE applications_archive IS 'Archived applications with PII stripped per retention policy';
COMMENT ON COLUMN applications_archive.summary_data IS 'Non-PII summary of original application data';

COMMENT ON TABLE audit_reports IS 'Monthly compliance audit reports stored as PDFs';
COMMENT ON COLUMN audit_reports.report_month IS 'Report period in YYYY-MM format';
