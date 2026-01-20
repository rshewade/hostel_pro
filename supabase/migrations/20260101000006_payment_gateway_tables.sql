-- Migration: Payment Gateway Tables
-- Description: Create tables for Razorpay payment gateway integration
-- Date: 2026-01-01

-- ============================================
-- 1. Gateway Payments Table
-- ============================================

CREATE TABLE IF NOT EXISTS gateway_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    fee_id UUID REFERENCES fees(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    fee_breakdown JSONB,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    payment_method VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'INITIATED' CHECK (status IN (
        'INITIATED', 'PENDING', 'SUCCESS', 'FAILED',
        'REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED'
    )),
    gateway_response JSONB,
    idempotency_key VARCHAR(64),
    receipt_url TEXT,
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for gateway_payments
CREATE INDEX IF NOT EXISTS idx_gateway_payments_student ON gateway_payments(student_user_id);
CREATE INDEX IF NOT EXISTS idx_gateway_payments_application ON gateway_payments(application_id);
CREATE INDEX IF NOT EXISTS idx_gateway_payments_fee ON gateway_payments(fee_id);
CREATE INDEX IF NOT EXISTS idx_gateway_payments_order ON gateway_payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_gateway_payments_payment ON gateway_payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_gateway_payments_status ON gateway_payments(status);
CREATE INDEX IF NOT EXISTS idx_gateway_payments_idempotency ON gateway_payments(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_gateway_payments_paid_at ON gateway_payments(paid_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_gateway_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_gateway_payments_updated_at ON gateway_payments;
CREATE TRIGGER trigger_gateway_payments_updated_at
    BEFORE UPDATE ON gateway_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_gateway_payments_updated_at();

-- ============================================
-- 2. Reconciliation Logs Table
-- ============================================

CREATE TABLE IF NOT EXISTS reconciliation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reconciliation_date DATE NOT NULL,
    total_payments INTEGER NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    settlements_matched INTEGER NOT NULL DEFAULT 0,
    discrepancies_count INTEGER NOT NULL DEFAULT 0,
    discrepancies JSONB DEFAULT '[]'::JSONB,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'PARTIAL', 'FAILED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for reconciliation_logs
CREATE INDEX IF NOT EXISTS idx_reconciliation_logs_date ON reconciliation_logs(reconciliation_date);
CREATE INDEX IF NOT EXISTS idx_reconciliation_logs_status ON reconciliation_logs(status);

-- ============================================
-- 3. RLS Policies for Gateway Payments
-- ============================================

ALTER TABLE gateway_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_logs ENABLE ROW LEVEL SECURITY;

-- Students can view their own gateway payments
CREATE POLICY gateway_payments_student_select ON gateway_payments
    FOR SELECT
    TO authenticated
    USING (
        student_user_id = auth.uid()
        OR auth_role() IN ('ACCOUNTS', 'TRUSTEE', 'SUPERINTENDENT')
    );

-- Students can insert their own payments (initiating)
CREATE POLICY gateway_payments_student_insert ON gateway_payments
    FOR INSERT
    TO authenticated
    WITH CHECK (student_user_id = auth.uid());

-- Only system/staff can update payments
CREATE POLICY gateway_payments_staff_update ON gateway_payments
    FOR UPDATE
    TO authenticated
    USING (auth_role() IN ('ACCOUNTS', 'TRUSTEE'))
    WITH CHECK (auth_role() IN ('ACCOUNTS', 'TRUSTEE'));

-- Service role can do anything (for webhooks)
CREATE POLICY gateway_payments_service ON gateway_payments
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Only accounts/trustee can view reconciliation logs
CREATE POLICY reconciliation_logs_staff_select ON reconciliation_logs
    FOR SELECT
    TO authenticated
    USING (auth_role() IN ('ACCOUNTS', 'TRUSTEE'));

-- Service role can manage reconciliation logs
CREATE POLICY reconciliation_logs_service ON reconciliation_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================
-- 4. Receipts Storage Bucket (if not exists)
-- ============================================

-- Note: This SQL may not work directly in Supabase migrations
-- You may need to create the bucket via Supabase dashboard or API
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('documents', 'documents', false)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. Comments
-- ============================================

COMMENT ON TABLE gateway_payments IS 'Stores all payment transactions processed through Razorpay gateway';
COMMENT ON COLUMN gateway_payments.razorpay_order_id IS 'Razorpay order ID (order_xxxxx)';
COMMENT ON COLUMN gateway_payments.razorpay_payment_id IS 'Razorpay payment ID (pay_xxxxx)';
COMMENT ON COLUMN gateway_payments.idempotency_key IS 'Unique key to prevent duplicate payments';
COMMENT ON COLUMN gateway_payments.fee_breakdown IS 'JSON array of fee components with descriptions and amounts';

COMMENT ON TABLE reconciliation_logs IS 'Daily reconciliation results between DB and Razorpay';
COMMENT ON COLUMN reconciliation_logs.discrepancies IS 'JSON array of discrepancy details';
