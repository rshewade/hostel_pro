-- Task 33.1: Create Additional Core Tables
-- This migration adds rooms, room_allocations, fees, payments, and leave_requests tables
-- Depends on: 000_create_database_schema.sql

-- ============================================
-- 1. CREATE ADDITIONAL ENUM TYPES
-- ============================================

-- Room status enum
DO $$ BEGIN
  CREATE TYPE room_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Allocation status enum
DO $$ BEGIN
  CREATE TYPE allocation_status AS ENUM ('ACTIVE', 'CHECKED_OUT', 'TRANSFERRED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Fee head enum
DO $$ BEGIN
  CREATE TYPE fee_head AS ENUM (
    'PROCESSING_FEE',
    'SECURITY_DEPOSIT',
    'HOSTEL_FEE',
    'MESS_FEE',
    'MAINTENANCE_FEE',
    'ELECTRICITY_FEE',
    'LAUNDRY_FEE',
    'LATE_FEE',
    'DAMAGE_CHARGE',
    'OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Fee/Payment status enum
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'WAIVED', 'REFUNDED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Payment method enum
DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'DEMAND_DRAFT', 'CARD', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Leave type enum
DO $$ BEGIN
  CREATE TYPE leave_type AS ENUM ('HOME_VISIT', 'SHORT_LEAVE', 'MEDICAL', 'EMERGENCY', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Leave status enum
DO $$ BEGIN
  CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. CREATE ROOMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number TEXT NOT NULL,
  vertical vertical_type NOT NULL,
  block TEXT,
  floor INTEGER DEFAULT 1,
  capacity INTEGER NOT NULL DEFAULT 2,
  occupied_count INTEGER NOT NULL DEFAULT 0,
  status room_status NOT NULL DEFAULT 'AVAILABLE',
  amenities TEXT[] DEFAULT '{}',
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT rooms_room_vertical_unique UNIQUE (room_number, vertical),
  CONSTRAINT rooms_occupancy_check CHECK (occupied_count >= 0 AND occupied_count <= capacity)
);

-- Create indexes for rooms
CREATE INDEX IF NOT EXISTS idx_rooms_vertical ON rooms(vertical);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_room_number ON rooms(room_number);
CREATE INDEX IF NOT EXISTS idx_rooms_block_floor ON rooms(block, floor);

-- ============================================
-- 3. CREATE ROOM_ALLOCATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS room_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  allocated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  vacated_at TIMESTAMPTZ,
  vacated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status allocation_status NOT NULL DEFAULT 'ACTIVE',
  check_in_confirmed BOOLEAN DEFAULT FALSE,
  check_in_confirmed_at TIMESTAMPTZ,
  inventory_acknowledged BOOLEAN DEFAULT FALSE,
  inventory_acknowledged_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT room_allocations_active_unique UNIQUE (student_user_id, status)
    DEFERRABLE INITIALLY DEFERRED
);

-- Create indexes for room_allocations
CREATE INDEX IF NOT EXISTS idx_room_allocations_student ON room_allocations(student_user_id);
CREATE INDEX IF NOT EXISTS idx_room_allocations_room ON room_allocations(room_id);
CREATE INDEX IF NOT EXISTS idx_room_allocations_status ON room_allocations(status);
CREATE INDEX IF NOT EXISTS idx_room_allocations_allocated_at ON room_allocations(allocated_at);

-- ============================================
-- 4. CREATE FEES TABLE (Receivables)
-- ============================================

CREATE TABLE IF NOT EXISTS fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  head fee_head NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  status payment_status NOT NULL DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  receipt_number TEXT UNIQUE,
  waived_amount DECIMAL(12, 2) DEFAULT 0,
  waived_by UUID REFERENCES users(id) ON DELETE SET NULL,
  waived_reason TEXT,
  period_start DATE,
  period_end DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fees_amount_positive CHECK (amount >= 0),
  CONSTRAINT fees_waived_valid CHECK (waived_amount >= 0 AND waived_amount <= amount)
);

-- Create indexes for fees
CREATE INDEX IF NOT EXISTS idx_fees_student ON fees(student_user_id);
CREATE INDEX IF NOT EXISTS idx_fees_application ON fees(application_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(status);
CREATE INDEX IF NOT EXISTS idx_fees_due_date ON fees(due_date);
CREATE INDEX IF NOT EXISTS idx_fees_head ON fees(head);
CREATE INDEX IF NOT EXISTS idx_fees_receipt_number ON fees(receipt_number);

-- ============================================
-- 5. CREATE PAYMENTS TABLE (Transactions)
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fee_id UUID REFERENCES fees(id) ON DELETE SET NULL,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  transaction_id TEXT,
  gateway_reference TEXT,
  status payment_status NOT NULL DEFAULT 'PENDING',
  paid_at TIMESTAMPTZ,
  receipt_url TEXT,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT payments_amount_positive CHECK (amount > 0)
);

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_fee ON payments(fee_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);

-- ============================================
-- 6. CREATE LEAVE_REQUESTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type leave_type NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  destination TEXT,
  emergency_contact TEXT,
  status leave_status NOT NULL DEFAULT 'PENDING',
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  parent_notified BOOLEAN DEFAULT FALSE,
  parent_notified_at TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  check_in_time TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT leave_requests_time_valid CHECK (end_time > start_time)
);

-- Create indexes for leave_requests
CREATE INDEX IF NOT EXISTS idx_leave_requests_student ON leave_requests(student_user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_type ON leave_requests(type);
CREATE INDEX IF NOT EXISTS idx_leave_requests_start_time ON leave_requests(start_time);
CREATE INDEX IF NOT EXISTS idx_leave_requests_end_time ON leave_requests(end_time);

-- ============================================
-- 7. CREATE RENEWALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS renewals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status application_status NOT NULL DEFAULT 'DRAFT',
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  consent_given BOOLEAN DEFAULT FALSE,
  consent_given_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT renewals_period_valid CHECK (period_end > period_start)
);

-- Create indexes for renewals
CREATE INDEX IF NOT EXISTS idx_renewals_student ON renewals(student_user_id);
CREATE INDEX IF NOT EXISTS idx_renewals_application ON renewals(application_id);
CREATE INDEX IF NOT EXISTS idx_renewals_status ON renewals(status);
CREATE INDEX IF NOT EXISTS idx_renewals_period ON renewals(period_start, period_end);

-- ============================================
-- 8. ADD updated_at TRIGGERS FOR NEW TABLES
-- ============================================

-- Trigger for rooms
DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for room_allocations
DROP TRIGGER IF EXISTS update_room_allocations_updated_at ON room_allocations;
CREATE TRIGGER update_room_allocations_updated_at
  BEFORE UPDATE ON room_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for fees
DROP TRIGGER IF EXISTS update_fees_updated_at ON fees;
CREATE TRIGGER update_fees_updated_at
  BEFORE UPDATE ON fees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for payments
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for leave_requests
DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON leave_requests;
CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for renewals
DROP TRIGGER IF EXISTS update_renewals_updated_at ON renewals;
CREATE TRIGGER update_renewals_updated_at
  BEFORE UPDATE ON renewals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. ENABLE RLS ON NEW TABLES
-- ============================================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewals ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. RLS POLICIES FOR ROOMS TABLE
-- ============================================

-- Everyone authenticated can read rooms (public info)
CREATE POLICY "Authenticated users can read rooms"
ON rooms FOR SELECT
TO authenticated
USING (true);

-- Only staff can manage rooms
CREATE POLICY "Staff can manage rooms"
ON rooms FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid()
    AND role IN ('SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth_user_id = auth.uid()
    AND role IN ('SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS')
  )
);

-- Service role full access
CREATE POLICY "Service role full access to rooms"
ON rooms FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 11. RLS POLICIES FOR ROOM_ALLOCATIONS TABLE
-- ============================================

-- Students can read their own allocations
CREATE POLICY "Students can read own allocations"
ON room_allocations FOR SELECT
TO authenticated
USING (student_user_id IN (
  SELECT id FROM users WHERE auth_user_id = auth.uid()
));

-- Parents can read their children's allocations
CREATE POLICY "Parents can read children allocations"
ON room_allocations FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users as parent
  JOIN users as student ON student.parent_mobile = parent.mobile
  WHERE parent.auth_user_id = auth.uid()
  AND parent.role = 'PARENT'
  AND room_allocations.student_user_id = student.id
));

-- Superintendents can manage allocations in their vertical
CREATE POLICY "Superintendents can manage vertical allocations"
ON room_allocations FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users as superintendent
  JOIN rooms ON rooms.id = room_allocations.room_id
  WHERE superintendent.auth_user_id = auth.uid()
  AND superintendent.role = 'SUPERINTENDENT'
  AND superintendent.vertical = rooms.vertical
))
WITH CHECK (EXISTS (
  SELECT 1 FROM users as superintendent
  JOIN rooms ON rooms.id = room_allocations.room_id
  WHERE superintendent.auth_user_id = auth.uid()
  AND superintendent.role = 'SUPERINTENDENT'
  AND superintendent.vertical = rooms.vertical
));

-- Trustees can manage all allocations
CREATE POLICY "Trustees can manage all allocations"
ON room_allocations FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'TRUSTEE'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'TRUSTEE'
));

-- Service role full access
CREATE POLICY "Service role full access to room_allocations"
ON room_allocations FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 12. RLS POLICIES FOR FEES TABLE
-- ============================================

-- Students can read their own fees
CREATE POLICY "Students can read own fees"
ON fees FOR SELECT
TO authenticated
USING (student_user_id IN (
  SELECT id FROM users WHERE auth_user_id = auth.uid()
));

-- Parents can read their children's fees
CREATE POLICY "Parents can read children fees"
ON fees FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users as parent
  JOIN users as student ON student.parent_mobile = parent.mobile
  WHERE parent.auth_user_id = auth.uid()
  AND parent.role = 'PARENT'
  AND fees.student_user_id = student.id
));

-- Accounts can manage all fees
CREATE POLICY "Accounts can manage all fees"
ON fees FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'ACCOUNTS'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'ACCOUNTS'
));

-- Trustees can read all fees
CREATE POLICY "Trustees can read all fees"
ON fees FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'TRUSTEE'
));

-- Service role full access
CREATE POLICY "Service role full access to fees"
ON fees FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 13. RLS POLICIES FOR PAYMENTS TABLE
-- ============================================

-- Students can read their own payments
CREATE POLICY "Students can read own payments"
ON payments FOR SELECT
TO authenticated
USING (student_user_id IN (
  SELECT id FROM users WHERE auth_user_id = auth.uid()
));

-- Parents can read their children's payments
CREATE POLICY "Parents can read children payments"
ON payments FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users as parent
  JOIN users as student ON student.parent_mobile = parent.mobile
  WHERE parent.auth_user_id = auth.uid()
  AND parent.role = 'PARENT'
  AND payments.student_user_id = student.id
));

-- Accounts can manage all payments
CREATE POLICY "Accounts can manage all payments"
ON payments FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'ACCOUNTS'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'ACCOUNTS'
));

-- Trustees can read all payments
CREATE POLICY "Trustees can read all payments"
ON payments FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'TRUSTEE'
));

-- Service role full access
CREATE POLICY "Service role full access to payments"
ON payments FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 14. RLS POLICIES FOR LEAVE_REQUESTS TABLE
-- ============================================

-- Students can manage their own leave requests
CREATE POLICY "Students can manage own leave requests"
ON leave_requests FOR ALL
TO authenticated
USING (student_user_id IN (
  SELECT id FROM users WHERE auth_user_id = auth.uid()
))
WITH CHECK (student_user_id IN (
  SELECT id FROM users WHERE auth_user_id = auth.uid()
));

-- Parents can read their children's leave requests
CREATE POLICY "Parents can read children leave requests"
ON leave_requests FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users as parent
  JOIN users as student ON student.parent_mobile = parent.mobile
  WHERE parent.auth_user_id = auth.uid()
  AND parent.role = 'PARENT'
  AND leave_requests.student_user_id = student.id
));

-- Superintendents can manage leave requests in their vertical
CREATE POLICY "Superintendents can manage vertical leave requests"
ON leave_requests FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users as superintendent
  JOIN users as student ON student.id = leave_requests.student_user_id
  WHERE superintendent.auth_user_id = auth.uid()
  AND superintendent.role = 'SUPERINTENDENT'
  AND superintendent.vertical = student.vertical
))
WITH CHECK (EXISTS (
  SELECT 1 FROM users as superintendent
  JOIN users as student ON student.id = leave_requests.student_user_id
  WHERE superintendent.auth_user_id = auth.uid()
  AND superintendent.role = 'SUPERINTENDENT'
  AND superintendent.vertical = student.vertical
));

-- Trustees can read all leave requests
CREATE POLICY "Trustees can read all leave requests"
ON leave_requests FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'TRUSTEE'
));

-- Service role full access
CREATE POLICY "Service role full access to leave_requests"
ON leave_requests FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 15. RLS POLICIES FOR RENEWALS TABLE
-- ============================================

-- Students can manage their own renewals
CREATE POLICY "Students can manage own renewals"
ON renewals FOR ALL
TO authenticated
USING (student_user_id IN (
  SELECT id FROM users WHERE auth_user_id = auth.uid()
))
WITH CHECK (student_user_id IN (
  SELECT id FROM users WHERE auth_user_id = auth.uid()
));

-- Parents can read their children's renewals
CREATE POLICY "Parents can read children renewals"
ON renewals FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users as parent
  JOIN users as student ON student.parent_mobile = parent.mobile
  WHERE parent.auth_user_id = auth.uid()
  AND parent.role = 'PARENT'
  AND renewals.student_user_id = student.id
));

-- Superintendents can manage renewals in their vertical
CREATE POLICY "Superintendents can manage vertical renewals"
ON renewals FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users as superintendent
  JOIN users as student ON student.id = renewals.student_user_id
  WHERE superintendent.auth_user_id = auth.uid()
  AND superintendent.role = 'SUPERINTENDENT'
  AND superintendent.vertical = student.vertical
))
WITH CHECK (EXISTS (
  SELECT 1 FROM users as superintendent
  JOIN users as student ON student.id = renewals.student_user_id
  WHERE superintendent.auth_user_id = auth.uid()
  AND superintendent.role = 'SUPERINTENDENT'
  AND superintendent.vertical = student.vertical
));

-- Trustees can manage all renewals
CREATE POLICY "Trustees can manage all renewals"
ON renewals FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'TRUSTEE'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM users
  WHERE auth_user_id = auth.uid()
  AND role = 'TRUSTEE'
));

-- Service role full access
CREATE POLICY "Service role full access to renewals"
ON renewals FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 16. VERIFICATION QUERIES
-- ============================================

-- Verify new tables were created
SELECT 'Additional tables created:' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  AND tablename IN ('rooms', 'room_allocations', 'fees', 'payments', 'leave_requests', 'renewals')
  ORDER BY tablename;

-- Verify new enum types were created
SELECT 'Additional enum types created:' as status;
SELECT typname FROM pg_type WHERE typtype = 'e'
  AND typname IN ('room_status', 'allocation_status', 'fee_head', 'payment_status', 'payment_method', 'leave_type', 'leave_status')
  ORDER BY typname;

-- Verify RLS is enabled on new tables
SELECT 'RLS enabled on new tables:' as status;
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'
  AND tablename IN ('rooms', 'room_allocations', 'fees', 'payments', 'leave_requests', 'renewals')
  ORDER BY tablename;

-- Verify triggers were created
SELECT 'updated_at triggers created:' as status;
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'update_%_updated_at'
ORDER BY event_object_table;
