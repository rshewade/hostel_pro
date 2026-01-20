-- Task 33.4 & 33.5: Create Business Logic Triggers
-- This migration adds status transition validation and room occupancy management triggers
-- Depends on: 000_create_database_schema.sql, 002_create_additional_tables.sql

-- ============================================
-- 1. APPLICATION STATUS TRANSITION TRIGGER
-- ============================================

-- Define allowed status transitions
-- DRAFT → SUBMITTED
-- SUBMITTED → REVIEW, REJECTED
-- REVIEW → INTERVIEW, APPROVED, REJECTED
-- INTERVIEW → APPROVED, REJECTED
-- APPROVED → ARCHIVED
-- REJECTED → ARCHIVED

CREATE OR REPLACE FUNCTION validate_application_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  allowed_transitions JSONB := '{
    "DRAFT": ["SUBMITTED"],
    "SUBMITTED": ["REVIEW", "REJECTED"],
    "REVIEW": ["INTERVIEW", "APPROVED", "REJECTED"],
    "INTERVIEW": ["APPROVED", "REJECTED"],
    "APPROVED": ["ARCHIVED"],
    "REJECTED": ["ARCHIVED"]
  }'::jsonb;
  from_status TEXT;
  to_status TEXT;
  allowed_list JSONB;
BEGIN
  -- Get old and new status values
  from_status := OLD.current_status::TEXT;
  to_status := NEW.current_status::TEXT;

  -- If status hasn't changed, allow the update
  IF from_status = to_status THEN
    RETURN NEW;
  END IF;

  -- Get allowed transitions for the current status
  allowed_list := allowed_transitions -> from_status;

  -- If no transitions are defined from this status, reject
  IF allowed_list IS NULL THEN
    RAISE EXCEPTION 'No transitions allowed from status: %', from_status;
  END IF;

  -- Check if the new status is in the allowed list
  IF NOT (to_status = ANY (SELECT jsonb_array_elements_text(allowed_list))) THEN
    RAISE EXCEPTION 'Invalid status transition from % to %. Allowed transitions: %',
      from_status, to_status, allowed_list;
  END IF;

  -- Set timestamp fields based on the new status
  CASE to_status
    WHEN 'SUBMITTED' THEN
      NEW.submitted_at := COALESCE(NEW.submitted_at, NOW());
    WHEN 'REVIEW' THEN
      NEW.reviewed_at := COALESCE(NEW.reviewed_at, NOW());
    WHEN 'INTERVIEW' THEN
      NEW.interview_scheduled_at := COALESCE(NEW.interview_scheduled_at, NOW());
    WHEN 'APPROVED' THEN
      NEW.approved_at := COALESCE(NEW.approved_at, NOW());
    WHEN 'REJECTED' THEN
      NEW.rejected_at := COALESCE(NEW.rejected_at, NOW());
    ELSE
      -- No special timestamp handling
      NULL;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on applications table
DROP TRIGGER IF EXISTS applications_status_transition_guard ON applications;
CREATE TRIGGER applications_status_transition_guard
  BEFORE UPDATE ON applications
  FOR EACH ROW
  WHEN (OLD.current_status IS DISTINCT FROM NEW.current_status)
  EXECUTE FUNCTION validate_application_status_transition();

-- ============================================
-- 2. ROOM OCCUPANCY MANAGEMENT TRIGGER
-- ============================================

-- This trigger automatically updates rooms.occupied_count and status
-- when room_allocations are inserted, updated, or deleted

CREATE OR REPLACE FUNCTION update_room_occupancy()
RETURNS TRIGGER AS $$
DECLARE
  v_room_id UUID;
  v_new_count INTEGER;
  v_capacity INTEGER;
BEGIN
  -- Determine which room to update
  IF TG_OP = 'DELETE' THEN
    v_room_id := OLD.room_id;
  ELSE
    v_room_id := NEW.room_id;
  END IF;

  -- Handle INSERT: New allocation created
  IF TG_OP = 'INSERT' THEN
    -- Only count if allocation is ACTIVE
    IF NEW.status = 'ACTIVE' THEN
      UPDATE rooms
      SET
        occupied_count = occupied_count + 1,
        status = CASE
          WHEN occupied_count + 1 >= capacity THEN 'OCCUPIED'::room_status
          ELSE status
        END,
        updated_at = NOW()
      WHERE id = NEW.room_id;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE: Allocation status changed
  IF TG_OP = 'UPDATE' THEN
    -- Check if status changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      -- If transitioning TO ACTIVE
      IF NEW.status = 'ACTIVE' AND OLD.status != 'ACTIVE' THEN
        UPDATE rooms
        SET
          occupied_count = occupied_count + 1,
          status = CASE
            WHEN occupied_count + 1 >= capacity THEN 'OCCUPIED'::room_status
            ELSE status
          END,
          updated_at = NOW()
        WHERE id = NEW.room_id;

      -- If transitioning FROM ACTIVE (checked out, transferred, cancelled)
      ELSIF OLD.status = 'ACTIVE' AND NEW.status != 'ACTIVE' THEN
        UPDATE rooms
        SET
          occupied_count = GREATEST(0, occupied_count - 1),
          status = CASE
            WHEN occupied_count - 1 <= 0 THEN 'AVAILABLE'::room_status
            WHEN occupied_count - 1 < capacity THEN 'AVAILABLE'::room_status
            ELSE status
          END,
          updated_at = NOW()
        WHERE id = OLD.room_id;
      END IF;
    END IF;

    -- Handle room transfer (room_id changed while ACTIVE)
    IF OLD.room_id IS DISTINCT FROM NEW.room_id AND NEW.status = 'ACTIVE' THEN
      -- Decrement old room
      UPDATE rooms
      SET
        occupied_count = GREATEST(0, occupied_count - 1),
        status = CASE
          WHEN occupied_count - 1 <= 0 THEN 'AVAILABLE'::room_status
          WHEN occupied_count - 1 < capacity THEN 'AVAILABLE'::room_status
          ELSE status
        END,
        updated_at = NOW()
      WHERE id = OLD.room_id;

      -- Increment new room
      UPDATE rooms
      SET
        occupied_count = occupied_count + 1,
        status = CASE
          WHEN occupied_count + 1 >= capacity THEN 'OCCUPIED'::room_status
          ELSE status
        END,
        updated_at = NOW()
      WHERE id = NEW.room_id;
    END IF;

    RETURN NEW;
  END IF;

  -- Handle DELETE: Allocation removed
  IF TG_OP = 'DELETE' THEN
    -- Only decrement if allocation was ACTIVE
    IF OLD.status = 'ACTIVE' THEN
      UPDATE rooms
      SET
        occupied_count = GREATEST(0, occupied_count - 1),
        status = CASE
          WHEN occupied_count - 1 <= 0 THEN 'AVAILABLE'::room_status
          WHEN occupied_count - 1 < capacity THEN 'AVAILABLE'::room_status
          ELSE status
        END,
        updated_at = NOW()
      WHERE id = OLD.room_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger on room_allocations table
DROP TRIGGER IF EXISTS room_allocations_occupancy_trigger ON room_allocations;
CREATE TRIGGER room_allocations_occupancy_trigger
  AFTER INSERT OR UPDATE OR DELETE ON room_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_room_occupancy();

-- ============================================
-- 3. LEAVE REQUEST STATUS TRANSITION TRIGGER
-- ============================================

-- Define allowed status transitions for leave requests
-- PENDING → APPROVED, REJECTED, CANCELLED
-- APPROVED → COMPLETED, CANCELLED
-- REJECTED → (terminal)
-- CANCELLED → (terminal)
-- COMPLETED → (terminal)

CREATE OR REPLACE FUNCTION validate_leave_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  allowed_transitions JSONB := '{
    "PENDING": ["APPROVED", "REJECTED", "CANCELLED"],
    "APPROVED": ["COMPLETED", "CANCELLED"],
    "REJECTED": [],
    "CANCELLED": [],
    "COMPLETED": []
  }'::jsonb;
  from_status TEXT;
  to_status TEXT;
  allowed_list JSONB;
BEGIN
  from_status := OLD.status::TEXT;
  to_status := NEW.status::TEXT;

  -- If status hasn't changed, allow the update
  IF from_status = to_status THEN
    RETURN NEW;
  END IF;

  -- Get allowed transitions
  allowed_list := allowed_transitions -> from_status;

  -- Check if the transition is allowed
  IF allowed_list IS NULL OR jsonb_array_length(allowed_list) = 0 THEN
    RAISE EXCEPTION 'No transitions allowed from leave status: %', from_status;
  END IF;

  IF NOT (to_status = ANY (SELECT jsonb_array_elements_text(allowed_list))) THEN
    RAISE EXCEPTION 'Invalid leave status transition from % to %. Allowed: %',
      from_status, to_status, allowed_list;
  END IF;

  -- Set timestamp fields based on the new status
  CASE to_status
    WHEN 'APPROVED' THEN
      NEW.approved_at := COALESCE(NEW.approved_at, NOW());
    WHEN 'REJECTED' THEN
      NEW.rejected_at := COALESCE(NEW.rejected_at, NOW());
    ELSE
      NULL;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on leave_requests table
DROP TRIGGER IF EXISTS leave_requests_status_transition_guard ON leave_requests;
CREATE TRIGGER leave_requests_status_transition_guard
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION validate_leave_status_transition();

-- ============================================
-- 4. FEE STATUS UPDATE TRIGGER
-- ============================================

-- When a payment is marked as PAID, update the associated fee status

CREATE OR REPLACE FUNCTION update_fee_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if payment status changed to PAID
  IF NEW.status = 'PAID' AND (OLD.status IS NULL OR OLD.status != 'PAID') THEN
    -- Update the associated fee if exists
    IF NEW.fee_id IS NOT NULL THEN
      UPDATE fees
      SET
        status = 'PAID',
        paid_at = COALESCE(NEW.paid_at, NOW()),
        updated_at = NOW()
      WHERE id = NEW.fee_id
        AND status != 'PAID'; -- Only update if not already paid
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on payments table
DROP TRIGGER IF EXISTS payments_update_fee_trigger ON payments;
CREATE TRIGGER payments_update_fee_trigger
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_fee_on_payment();

-- ============================================
-- 5. AUTO-GENERATE TRACKING NUMBER TRIGGER
-- ============================================

-- Generate tracking number for new applications
-- Format: {VERTICAL_PREFIX}-{YEAR}-{SEQUENCE}
-- Example: BH-2026-000001, GA-2026-000001, DH-2026-000001

CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TRIGGER AS $$
DECLARE
  v_prefix TEXT;
  v_year TEXT;
  v_sequence INTEGER;
  v_tracking_number TEXT;
BEGIN
  -- Only generate if tracking_number is not provided
  IF NEW.tracking_number IS NOT NULL AND NEW.tracking_number != '' THEN
    RETURN NEW;
  END IF;

  -- Determine prefix based on vertical
  v_prefix := CASE NEW.vertical
    WHEN 'BOYS' THEN 'BH'
    WHEN 'GIRLS' THEN 'GA'
    WHEN 'DHARAMSHALA' THEN 'DH'
    ELSE 'XX'
  END;

  -- Get current year
  v_year := TO_CHAR(NOW(), 'YYYY');

  -- Get next sequence number for this vertical and year
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(tracking_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO v_sequence
  FROM applications
  WHERE tracking_number LIKE v_prefix || '-' || v_year || '-%';

  -- Generate tracking number
  v_tracking_number := v_prefix || '-' || v_year || '-' || LPAD(v_sequence::TEXT, 6, '0');

  NEW.tracking_number := v_tracking_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on applications table
DROP TRIGGER IF EXISTS applications_generate_tracking_number ON applications;
CREATE TRIGGER applications_generate_tracking_number
  BEFORE INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION generate_tracking_number();

-- ============================================
-- 6. PREVENT USER ROLE CHANGE TRIGGER
-- ============================================

-- Users cannot change their own role (only service_role can)
CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'Role changes are not allowed. Contact administrator.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on users table
DROP TRIGGER IF EXISTS users_prevent_role_change ON users;
CREATE TRIGGER users_prevent_role_change
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_change();

-- ============================================
-- 7. VERIFICATION QUERIES
-- ============================================

-- Verify trigger functions were created
SELECT 'Trigger functions created:' as status;
SELECT proname as function_name
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN (
    'validate_application_status_transition',
    'update_room_occupancy',
    'validate_leave_status_transition',
    'update_fee_on_payment',
    'generate_tracking_number'
  )
ORDER BY proname;

-- Verify triggers were created
SELECT 'Business logic triggers created:' as status;
SELECT trigger_name, event_object_table, event_manipulation, action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN (
    'applications_status_transition_guard',
    'room_allocations_occupancy_trigger',
    'leave_requests_status_transition_guard',
    'payments_update_fee_trigger',
    'applications_generate_tracking_number'
  )
ORDER BY event_object_table, trigger_name;
