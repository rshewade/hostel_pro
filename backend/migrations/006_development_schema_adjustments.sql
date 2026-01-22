-- =============================================================================
-- DEVELOPMENT SCHEMA ADJUSTMENTS
-- Makes schema compatible with db.json structure for prototyping
-- Run this BEFORE seed_test_data.sql
-- =============================================================================

-- ============================================
-- 1. MAKE auth_user_id NULLABLE FOR DEVELOPMENT
-- ============================================
-- In production, auth_user_id links to Supabase Auth
-- For development/testing, we allow NULL to seed data without auth setup

ALTER TABLE users ALTER COLUMN auth_user_id DROP NOT NULL;

-- ============================================
-- 2. UPDATE VERTICAL ENUM TO MATCH DB.JSON
-- ============================================
-- db.json uses: BOYS_HOSTEL, GIRLS_ASHRAM, DHARAMSHALA
-- Current schema: BOYS, GIRLS, DHARAMSHALA

-- Add new enum values
ALTER TYPE vertical_type ADD VALUE IF NOT EXISTS 'BOYS_HOSTEL';
ALTER TYPE vertical_type ADD VALUE IF NOT EXISTS 'GIRLS_ASHRAM';

-- ============================================
-- 3. ADD CONVENIENCE COLUMNS FOR DB.JSON COMPATIBILITY
-- ============================================

-- Add is_active column if missing (schema has it)
-- Add metadata column to store extra fields from db.json

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Schema adjustments applied successfully!' as status;

-- Verify auth_user_id is now nullable
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'auth_user_id';

-- Verify enum values
SELECT enumlabel
FROM pg_enum
WHERE enumtypid = 'vertical_type'::regtype
ORDER BY enumsortorder;
