-- Migration: Configuration Tables
-- Description: Create tables for leave configuration, blackout dates, and notification rules
-- Date: 2026-01-22

-- ============================================
-- 1. CREATE ENUM TYPES FOR CONFIGURATION
-- ============================================

-- Event type enum for notification rules
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_event_type') THEN
        CREATE TYPE notification_event_type AS ENUM (
            'LEAVE_APPLICATION',
            'LEAVE_APPROVAL',
            'LEAVE_REJECTION',
            'EMERGENCY',
            'ARRIVAL',
            'DEPARTURE'
        );
    END IF;
END $$;

-- Notification timing enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_timing') THEN
        CREATE TYPE notification_timing AS ENUM (
            'IMMEDIATE',
            'BEFORE_1H',
            'BEFORE_6H',
            'BEFORE_24H',
            'DAILY'
        );
    END IF;
END $$;

-- ============================================
-- 2. CREATE LEAVE_TYPES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    max_days_per_month INTEGER NOT NULL DEFAULT 0,
    max_days_per_semester INTEGER NOT NULL DEFAULT 0,
    requires_approval BOOLEAN NOT NULL DEFAULT true,
    allowed_verticals TEXT[] NOT NULL DEFAULT ARRAY['BOYS', 'GIRLS', 'DHARAMSHALA'],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for leave_types
CREATE INDEX IF NOT EXISTS idx_leave_types_active ON leave_types(is_active);
CREATE INDEX IF NOT EXISTS idx_leave_types_name ON leave_types(name);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_leave_types_updated_at ON leave_types;
CREATE TRIGGER update_leave_types_updated_at
    BEFORE UPDATE ON leave_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. CREATE BLACKOUT_DATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS blackout_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    verticals TEXT[] NOT NULL DEFAULT ARRAY['BOYS', 'GIRLS', 'DHARAMSHALA'],
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT blackout_dates_date_check CHECK (end_date >= start_date)
);

-- Indexes for blackout_dates
CREATE INDEX IF NOT EXISTS idx_blackout_dates_range ON blackout_dates(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_blackout_dates_verticals ON blackout_dates USING GIN(verticals);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_blackout_dates_updated_at ON blackout_dates;
CREATE TRIGGER update_blackout_dates_updated_at
    BEFORE UPDATE ON blackout_dates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. CREATE NOTIFICATION_RULES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notification_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    timing VARCHAR(50) NOT NULL DEFAULT 'IMMEDIATE',
    channels JSONB NOT NULL DEFAULT '{"sms": true, "whatsapp": true, "email": false}'::JSONB,
    verticals TEXT[] NOT NULL DEFAULT ARRAY['BOYS', 'GIRLS', 'DHARAMSHALA'],
    template TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notification_rules
CREATE INDEX IF NOT EXISTS idx_notification_rules_event_type ON notification_rules(event_type);
CREATE INDEX IF NOT EXISTS idx_notification_rules_active ON notification_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_notification_rules_verticals ON notification_rules USING GIN(verticals);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_notification_rules_updated_at ON notification_rules;
CREATE TRIGGER update_notification_rules_updated_at
    BEFORE UPDATE ON notification_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- Enable RLS on all configuration tables
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE blackout_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;

-- Leave Types RLS: Read for all authenticated, write for superintendents/trustees
DROP POLICY IF EXISTS leave_types_select ON leave_types;
CREATE POLICY leave_types_select ON leave_types
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS leave_types_insert ON leave_types;
CREATE POLICY leave_types_insert ON leave_types
    FOR INSERT
    TO authenticated
    WITH CHECK (auth_role() IN ('SUPERINTENDENT', 'TRUSTEE'));

DROP POLICY IF EXISTS leave_types_update ON leave_types;
CREATE POLICY leave_types_update ON leave_types
    FOR UPDATE
    TO authenticated
    USING (auth_role() IN ('SUPERINTENDENT', 'TRUSTEE'))
    WITH CHECK (auth_role() IN ('SUPERINTENDENT', 'TRUSTEE'));

DROP POLICY IF EXISTS leave_types_delete ON leave_types;
CREATE POLICY leave_types_delete ON leave_types
    FOR DELETE
    TO authenticated
    USING (auth_role() IN ('SUPERINTENDENT', 'TRUSTEE'));

DROP POLICY IF EXISTS leave_types_service ON leave_types;
CREATE POLICY leave_types_service ON leave_types
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Blackout Dates RLS: Same pattern
DROP POLICY IF EXISTS blackout_dates_select ON blackout_dates;
CREATE POLICY blackout_dates_select ON blackout_dates
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS blackout_dates_insert ON blackout_dates;
CREATE POLICY blackout_dates_insert ON blackout_dates
    FOR INSERT
    TO authenticated
    WITH CHECK (auth_role() IN ('SUPERINTENDENT', 'TRUSTEE'));

DROP POLICY IF EXISTS blackout_dates_update ON blackout_dates;
CREATE POLICY blackout_dates_update ON blackout_dates
    FOR UPDATE
    TO authenticated
    USING (auth_role() IN ('SUPERINTENDENT', 'TRUSTEE'))
    WITH CHECK (auth_role() IN ('SUPERINTENDENT', 'TRUSTEE'));

DROP POLICY IF EXISTS blackout_dates_delete ON blackout_dates;
CREATE POLICY blackout_dates_delete ON blackout_dates
    FOR DELETE
    TO authenticated
    USING (auth_role() IN ('SUPERINTENDENT', 'TRUSTEE'));

DROP POLICY IF EXISTS blackout_dates_service ON blackout_dates;
CREATE POLICY blackout_dates_service ON blackout_dates
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Notification Rules RLS: Same pattern
DROP POLICY IF EXISTS notification_rules_select ON notification_rules;
CREATE POLICY notification_rules_select ON notification_rules
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS notification_rules_insert ON notification_rules;
CREATE POLICY notification_rules_insert ON notification_rules
    FOR INSERT
    TO authenticated
    WITH CHECK (auth_role() IN ('SUPERINTENDENT', 'TRUSTEE'));

DROP POLICY IF EXISTS notification_rules_update ON notification_rules;
CREATE POLICY notification_rules_update ON notification_rules
    FOR UPDATE
    TO authenticated
    USING (auth_role() IN ('SUPERINTENDENT', 'TRUSTEE'))
    WITH CHECK (auth_role() IN ('SUPERINTENDENT', 'TRUSTEE'));

DROP POLICY IF EXISTS notification_rules_delete ON notification_rules;
CREATE POLICY notification_rules_delete ON notification_rules
    FOR DELETE
    TO authenticated
    USING (auth_role() IN ('SUPERINTENDENT', 'TRUSTEE'));

DROP POLICY IF EXISTS notification_rules_service ON notification_rules;
CREATE POLICY notification_rules_service ON notification_rules
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- 6. INSERT DEFAULT DATA
-- ============================================

-- Insert default leave types
INSERT INTO leave_types (name, max_days_per_month, max_days_per_semester, requires_approval, allowed_verticals, is_active)
VALUES
    ('Sick Leave', 3, 10, false, ARRAY['BOYS', 'GIRLS', 'DHARAMSHALA'], true),
    ('Casual Leave', 2, 8, true, ARRAY['BOYS', 'GIRLS'], true),
    ('Emergency Leave', 5, 15, true, ARRAY['BOYS', 'GIRLS', 'DHARAMSHALA'], true),
    ('Home Visit', 4, 12, true, ARRAY['BOYS', 'GIRLS'], true)
ON CONFLICT DO NOTHING;

-- Insert default notification rules
INSERT INTO notification_rules (event_type, timing, channels, verticals, template, is_active)
VALUES
    ('LEAVE_APPLICATION', 'IMMEDIATE', '{"sms": true, "whatsapp": true, "email": false}'::JSONB,
     ARRAY['BOYS', 'GIRLS', 'DHARAMSHALA'],
     'Your child {{student_name}} has applied for leave from {{start_date}} to {{end_date}}.', true),
    ('LEAVE_APPROVAL', 'IMMEDIATE', '{"sms": true, "whatsapp": true, "email": true}'::JSONB,
     ARRAY['BOYS', 'GIRLS', 'DHARAMSHALA'],
     'Leave application for {{student_name}} from {{start_date}} to {{end_date}} has been APPROVED.', true),
    ('LEAVE_REJECTION', 'IMMEDIATE', '{"sms": true, "whatsapp": true, "email": true}'::JSONB,
     ARRAY['BOYS', 'GIRLS', 'DHARAMSHALA'],
     'Leave application for {{student_name}} from {{start_date}} to {{end_date}} has been REJECTED. Reason: {{reason}}.', true),
    ('EMERGENCY', 'IMMEDIATE', '{"sms": true, "whatsapp": true, "email": true}'::JSONB,
     ARRAY['BOYS', 'GIRLS', 'DHARAMSHALA'],
     'URGENT: {{student_name}} - {{emergency_type}}. Contact Superintendent immediately.', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. COMMENTS
-- ============================================

COMMENT ON TABLE leave_types IS 'Configuration for different types of leaves with limits and approval rules';
COMMENT ON COLUMN leave_types.allowed_verticals IS 'Array of verticals where this leave type is allowed';
COMMENT ON COLUMN leave_types.max_days_per_month IS 'Maximum number of days allowed per month for this leave type';
COMMENT ON COLUMN leave_types.max_days_per_semester IS 'Maximum number of days allowed per semester (6 months)';

COMMENT ON TABLE blackout_dates IS 'Periods when leaves are not allowed (exams, festivals, etc.)';
COMMENT ON COLUMN blackout_dates.verticals IS 'Array of verticals affected by this blackout period';

COMMENT ON TABLE notification_rules IS 'Rules for parent notifications on various events';
COMMENT ON COLUMN notification_rules.channels IS 'JSON object with sms, whatsapp, email boolean flags';
COMMENT ON COLUMN notification_rules.template IS 'Message template with {{variable}} placeholders';
