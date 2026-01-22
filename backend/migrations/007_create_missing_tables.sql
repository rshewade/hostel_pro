-- =============================================================================
-- CREATE MISSING TABLES
-- Tables that existed in db.json but were not in Supabase schema
-- =============================================================================

-- ============================================
-- 1. INTERVIEWS TABLE
-- Tracks interview scheduling and results for applications
-- ============================================
CREATE TYPE interview_mode AS ENUM ('ONLINE', 'IN_PERSON', 'PHONE');
CREATE TYPE interview_status AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED');

CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

    -- Schedule
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    schedule_datetime TIMESTAMPTZ NOT NULL,
    mode interview_mode NOT NULL DEFAULT 'IN_PERSON',
    meeting_link TEXT,
    location TEXT,

    -- Participants
    superintendent_id UUID REFERENCES users(id),
    trustee_id UUID REFERENCES users(id),

    -- Status & Results
    status interview_status NOT NULL DEFAULT 'SCHEDULED',
    final_score INTEGER CHECK (final_score >= 0 AND final_score <= 100),
    notes TEXT,
    internal_remarks TEXT,

    -- Timestamps
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interviews_application ON interviews(application_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_date, scheduled_time);

-- ============================================
-- 2. NOTIFICATIONS TABLE
-- System notifications for users
-- ============================================
CREATE TYPE notification_type AS ENUM (
    'FEE_REMINDER',
    'FEE_OVERDUE',
    'LEAVE_APPROVED',
    'LEAVE_REJECTED',
    'LEAVE_PENDING',
    'RENEWAL_REMINDER',
    'APPLICATION_UPDATE',
    'INTERVIEW_SCHEDULED',
    'ROOM_ALLOCATION',
    'ANNOUNCEMENT',
    'SYSTEM',
    'OTHER'
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,

    -- Read status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    -- Related entity (optional)
    related_entity_type TEXT,
    related_entity_id UUID,

    -- Action URL (optional)
    action_url TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- 3. COMMUNICATIONS TABLE
-- Tracks all outbound communications (SMS, Email, WhatsApp)
-- ============================================
CREATE TYPE communication_type AS ENUM ('SMS', 'EMAIL', 'WHATSAPP', 'PUSH');
CREATE TYPE communication_status AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED');

CREATE TABLE IF NOT EXISTS communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Type & Template
    type communication_type NOT NULL,
    template TEXT,

    -- Recipient
    recipient_id UUID REFERENCES users(id),
    recipient_name TEXT,
    recipient_mobile TEXT,
    recipient_email TEXT,

    -- Content
    subject TEXT,
    message TEXT NOT NULL,

    -- Status & Tracking
    status communication_status NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,

    -- Provider tracking
    provider TEXT,
    provider_message_id TEXT,

    -- Related entity
    related_entity_type TEXT,
    related_entity_id UUID,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_communications_recipient ON communications(recipient_id);
CREATE INDEX idx_communications_type ON communications(type);
CREATE INDEX idx_communications_status ON communications(status);
CREATE INDEX idx_communications_created ON communications(created_at DESC);

-- ============================================
-- 4. EXIT REQUESTS TABLE
-- Tracks student exit/checkout requests
-- ============================================
CREATE TYPE exit_request_status AS ENUM (
    'PENDING',
    'APPROVED',
    'CLEARANCE_PENDING',
    'CLEARANCE_COMPLETE',
    'DEPOSIT_REFUND_PENDING',
    'COMPLETED',
    'CANCELLED'
);

CREATE TABLE IF NOT EXISTS exit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_user_id UUID NOT NULL REFERENCES users(id),

    -- Request details
    reason TEXT NOT NULL,
    expected_exit_date DATE NOT NULL,
    requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
    actual_exit_date DATE,

    -- Forwarding address for deposit refund
    forwarding_address TEXT,

    -- Bank details for deposit refund
    bank_account_holder TEXT,
    bank_account_number TEXT,
    bank_ifsc_code TEXT,
    bank_name TEXT,

    -- Status
    status exit_request_status NOT NULL DEFAULT 'PENDING',

    -- Approvals
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,

    -- Notes
    notes TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_exit_requests_student ON exit_requests(student_user_id);
CREATE INDEX idx_exit_requests_status ON exit_requests(status);
CREATE INDEX idx_exit_requests_date ON exit_requests(expected_exit_date);

-- ============================================
-- 5. CLEARANCES TABLE
-- Tracks clearance status for exit requests
-- ============================================
CREATE TYPE clearance_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');
CREATE TYPE clearance_item_status AS ENUM ('PENDING', 'CLEARED', 'BLOCKED', 'NOT_APPLICABLE');

CREATE TABLE IF NOT EXISTS clearances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exit_request_id UUID NOT NULL REFERENCES exit_requests(id) ON DELETE CASCADE,
    student_user_id UUID NOT NULL REFERENCES users(id),

    -- Overall status
    status clearance_status NOT NULL DEFAULT 'NOT_STARTED',
    initiated_date TIMESTAMPTZ DEFAULT NOW(),
    expected_completion DATE,
    completed_at TIMESTAMPTZ,

    -- Department clearances
    room_cleared clearance_item_status DEFAULT 'PENDING',
    room_cleared_by UUID REFERENCES users(id),
    room_cleared_at TIMESTAMPTZ,
    room_remarks TEXT,

    library_cleared clearance_item_status DEFAULT 'PENDING',
    library_cleared_by UUID REFERENCES users(id),
    library_cleared_at TIMESTAMPTZ,
    library_remarks TEXT,

    mess_cleared clearance_item_status DEFAULT 'PENDING',
    mess_cleared_by UUID REFERENCES users(id),
    mess_cleared_at TIMESTAMPTZ,
    mess_remarks TEXT,

    accounts_cleared clearance_item_status DEFAULT 'PENDING',
    accounts_cleared_by UUID REFERENCES users(id),
    accounts_cleared_at TIMESTAMPTZ,
    accounts_remarks TEXT,

    -- General remarks
    remarks TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clearances_exit_request ON clearances(exit_request_id);
CREATE INDEX idx_clearances_student ON clearances(student_user_id);
CREATE INDEX idx_clearances_status ON clearances(status);

-- ============================================
-- 6. CLEARANCE ITEMS TABLE (Optional detailed tracking)
-- For custom clearance items beyond the standard ones
-- ============================================
CREATE TABLE IF NOT EXISTS clearance_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clearance_id UUID NOT NULL REFERENCES clearances(id) ON DELETE CASCADE,

    -- Item details
    department TEXT NOT NULL,
    item_name TEXT NOT NULL,
    description TEXT,

    -- Status
    status clearance_item_status NOT NULL DEFAULT 'PENDING',
    cleared_by UUID REFERENCES users(id),
    cleared_at TIMESTAMPTZ,
    remarks TEXT,

    -- Amount (if applicable, e.g., pending dues)
    amount_due DECIMAL(10,2) DEFAULT 0,
    amount_paid DECIMAL(10,2) DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clearance_items_clearance ON clearance_items(clearance_id);
CREATE INDEX idx_clearance_items_status ON clearance_items(status);

-- ============================================
-- 7. RECEIVABLES VIEW (Derived from fees)
-- This is a view, not a table - aggregates outstanding fees
-- ============================================
CREATE OR REPLACE VIEW receivables AS
SELECT
    u.id AS student_id,
    u.full_name AS student_name,
    u.vertical,
    u.mobile AS contact_phone,
    u.email AS contact_email,
    r.room_number AS room,
    COALESCE(SUM(CASE WHEN f.status IN ('PENDING', 'OVERDUE') THEN f.amount ELSE 0 END), 0) AS total_due,
    COALESCE(SUM(CASE WHEN f.status = 'OVERDUE' THEN f.amount ELSE 0 END), 0) AS overdue_amount,
    MAX(CASE WHEN f.status = 'PAID' THEN f.paid_at END) AS last_payment_date,
    COUNT(CASE WHEN f.status IN ('PENDING', 'OVERDUE') THEN 1 END) AS pending_fees_count,
    MIN(CASE WHEN f.status IN ('PENDING', 'OVERDUE') THEN f.due_date END) AS next_due_date
FROM users u
LEFT JOIN fees f ON f.student_user_id = u.id
LEFT JOIN room_allocations ra ON ra.student_user_id = u.id AND ra.status = 'ACTIVE'
LEFT JOIN rooms r ON r.id = ra.room_id
WHERE u.role = 'STUDENT' AND u.is_active = TRUE
GROUP BY u.id, u.full_name, u.vertical, u.mobile, u.email, r.room_number
HAVING COALESCE(SUM(CASE WHEN f.status IN ('PENDING', 'OVERDUE') THEN f.amount ELSE 0 END), 0) > 0;

-- ============================================
-- 8. INTERVIEW SLOTS TABLE (Optional - for scheduling)
-- Pre-defined available interview slots
-- ============================================
CREATE TABLE IF NOT EXISTS interview_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Slot details
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    mode interview_mode NOT NULL DEFAULT 'IN_PERSON',

    -- Capacity
    max_interviews INTEGER DEFAULT 1,
    booked_count INTEGER DEFAULT 0,

    -- Availability
    is_available BOOLEAN DEFAULT TRUE,

    -- Assigned interviewers
    superintendent_id UUID REFERENCES users(id),
    trustee_id UUID REFERENCES users(id),

    -- Location/Link
    location TEXT,
    meeting_link TEXT,

    -- Vertical (optional - for vertical-specific slots)
    vertical vertical_type,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_interview_slots_date ON interview_slots(slot_date);
CREATE INDEX idx_interview_slots_available ON interview_slots(is_available, slot_date) WHERE is_available = TRUE;

-- ============================================
-- UPDATE TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exit_requests_updated_at BEFORE UPDATE ON exit_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clearances_updated_at BEFORE UPDATE ON clearances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clearance_items_updated_at BEFORE UPDATE ON clearance_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_slots_updated_at BEFORE UPDATE ON interview_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Missing tables created successfully!' as status;
