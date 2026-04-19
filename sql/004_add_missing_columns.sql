-- Migration 004: Add missing timestamp and reason columns
-- Fixes ISSUE-19: API routes reference columns that don't exist in schema
-- Date: 2026-04-13

-- ============================================================================
-- APPLICATIONS TABLE: Add status transition timestamps and rejection reason
-- ============================================================================

ALTER TABLE applications ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ============================================================================
-- LEAVE_REQUESTS TABLE: Add approval/rejection timestamps and reason
-- ============================================================================

ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
