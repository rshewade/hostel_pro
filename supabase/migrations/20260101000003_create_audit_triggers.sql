-- Task 33.6: Wire Audit Logging Triggers to Business Tables
-- This migration creates audit logging triggers for all business tables
-- Depends on: 000_create_database_schema.sql, 002_create_additional_tables.sql

-- ============================================
-- 1. CREATE GENERIC AUDIT LOG FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION log_audit_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
  v_changes JSONB;
  v_actor_id UUID;
  v_actor_role TEXT;
  v_actor_email TEXT;
  v_entity_id UUID;
  v_action TEXT;
BEGIN
  -- Determine the action
  v_action := TG_OP;

  -- Get entity ID
  IF TG_OP = 'DELETE' THEN
    v_entity_id := OLD.id;
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    v_entity_id := NEW.id;
    v_old_data := NULL;
    v_new_data := to_jsonb(NEW);
  ELSE -- UPDATE
    v_entity_id := NEW.id;
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
  END IF;

  -- Calculate changes for UPDATE operations
  IF TG_OP = 'UPDATE' THEN
    -- Build a JSONB object with only changed fields
    SELECT jsonb_object_agg(key, jsonb_build_object('old', v_old_data->key, 'new', value))
    INTO v_changes
    FROM jsonb_each(v_new_data)
    WHERE v_old_data->key IS DISTINCT FROM value
      AND key NOT IN ('updated_at', 'created_at'); -- Exclude timestamp fields
  ELSE
    v_changes := NULL;
  END IF;

  -- Try to get actor information from current user context
  -- This uses Supabase's auth.uid() function
  BEGIN
    v_actor_id := (
      SELECT id FROM users
      WHERE auth_user_id = auth.uid()
      LIMIT 1
    );

    SELECT role::TEXT, email
    INTO v_actor_role, v_actor_email
    FROM users
    WHERE id = v_actor_id;
  EXCEPTION WHEN OTHERS THEN
    -- If we can't get user info (e.g., service role operation), set to NULL
    v_actor_id := NULL;
    v_actor_role := 'SYSTEM';
    v_actor_email := NULL;
  END;

  -- Insert audit log entry
  INSERT INTO audit_logs (
    entity_type,
    entity_id,
    action,
    actor_id,
    actor_role,
    actor_email,
    metadata,
    created_at
  ) VALUES (
    TG_TABLE_NAME,
    v_entity_id,
    v_action,
    v_actor_id,
    v_actor_role,
    v_actor_email,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'changes', COALESCE(v_changes, '{}'::jsonb),
      'old_data', CASE WHEN TG_OP IN ('DELETE', 'UPDATE') THEN v_old_data ELSE NULL END,
      'new_data', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN v_new_data ELSE NULL END
    ),
    NOW()
  );

  -- Return appropriate row
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. LIGHTWEIGHT AUDIT FUNCTION (for high-volume tables)
-- ============================================

-- This version only logs the entity_id and action, not full data
CREATE OR REPLACE FUNCTION log_audit_entry_light()
RETURNS TRIGGER AS $$
DECLARE
  v_actor_id UUID;
  v_entity_id UUID;
BEGIN
  -- Get entity ID
  IF TG_OP = 'DELETE' THEN
    v_entity_id := OLD.id;
  ELSE
    v_entity_id := NEW.id;
  END IF;

  -- Try to get actor ID
  BEGIN
    v_actor_id := (
      SELECT id FROM users
      WHERE auth_user_id = auth.uid()
      LIMIT 1
    );
  EXCEPTION WHEN OTHERS THEN
    v_actor_id := NULL;
  END;

  -- Insert minimal audit log entry
  INSERT INTO audit_logs (
    entity_type,
    entity_id,
    action,
    actor_id,
    created_at
  ) VALUES (
    TG_TABLE_NAME,
    v_entity_id,
    TG_OP,
    v_actor_id,
    NOW()
  );

  -- Return appropriate row
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. CREATE AUDIT TRIGGERS FOR USERS TABLE
-- ============================================

DROP TRIGGER IF EXISTS audit_users_insert ON users;
CREATE TRIGGER audit_users_insert
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_users_update ON users;
CREATE TRIGGER audit_users_update
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_users_delete ON users;
CREATE TRIGGER audit_users_delete
  AFTER DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

-- ============================================
-- 4. CREATE AUDIT TRIGGERS FOR APPLICATIONS TABLE
-- ============================================

DROP TRIGGER IF EXISTS audit_applications_insert ON applications;
CREATE TRIGGER audit_applications_insert
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_applications_update ON applications;
CREATE TRIGGER audit_applications_update
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_applications_delete ON applications;
CREATE TRIGGER audit_applications_delete
  AFTER DELETE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

-- ============================================
-- 5. CREATE AUDIT TRIGGERS FOR DOCUMENTS TABLE
-- ============================================

DROP TRIGGER IF EXISTS audit_documents_insert ON documents;
CREATE TRIGGER audit_documents_insert
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_documents_update ON documents;
CREATE TRIGGER audit_documents_update
  AFTER UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_documents_delete ON documents;
CREATE TRIGGER audit_documents_delete
  AFTER DELETE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

-- ============================================
-- 6. CREATE AUDIT TRIGGERS FOR ROOMS TABLE
-- ============================================

DROP TRIGGER IF EXISTS audit_rooms_insert ON rooms;
CREATE TRIGGER audit_rooms_insert
  AFTER INSERT ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_rooms_update ON rooms;
CREATE TRIGGER audit_rooms_update
  AFTER UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_rooms_delete ON rooms;
CREATE TRIGGER audit_rooms_delete
  AFTER DELETE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

-- ============================================
-- 7. CREATE AUDIT TRIGGERS FOR ROOM_ALLOCATIONS TABLE
-- ============================================

DROP TRIGGER IF EXISTS audit_room_allocations_insert ON room_allocations;
CREATE TRIGGER audit_room_allocations_insert
  AFTER INSERT ON room_allocations
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_room_allocations_update ON room_allocations;
CREATE TRIGGER audit_room_allocations_update
  AFTER UPDATE ON room_allocations
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_room_allocations_delete ON room_allocations;
CREATE TRIGGER audit_room_allocations_delete
  AFTER DELETE ON room_allocations
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

-- ============================================
-- 8. CREATE AUDIT TRIGGERS FOR FEES TABLE
-- ============================================

DROP TRIGGER IF EXISTS audit_fees_insert ON fees;
CREATE TRIGGER audit_fees_insert
  AFTER INSERT ON fees
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_fees_update ON fees;
CREATE TRIGGER audit_fees_update
  AFTER UPDATE ON fees
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_fees_delete ON fees;
CREATE TRIGGER audit_fees_delete
  AFTER DELETE ON fees
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

-- ============================================
-- 9. CREATE AUDIT TRIGGERS FOR PAYMENTS TABLE
-- ============================================

DROP TRIGGER IF EXISTS audit_payments_insert ON payments;
CREATE TRIGGER audit_payments_insert
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_payments_update ON payments;
CREATE TRIGGER audit_payments_update
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_payments_delete ON payments;
CREATE TRIGGER audit_payments_delete
  AFTER DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

-- ============================================
-- 10. CREATE AUDIT TRIGGERS FOR LEAVE_REQUESTS TABLE
-- ============================================

DROP TRIGGER IF EXISTS audit_leave_requests_insert ON leave_requests;
CREATE TRIGGER audit_leave_requests_insert
  AFTER INSERT ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_leave_requests_update ON leave_requests;
CREATE TRIGGER audit_leave_requests_update
  AFTER UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_leave_requests_delete ON leave_requests;
CREATE TRIGGER audit_leave_requests_delete
  AFTER DELETE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

-- ============================================
-- 11. CREATE AUDIT TRIGGERS FOR RENEWALS TABLE
-- ============================================

DROP TRIGGER IF EXISTS audit_renewals_insert ON renewals;
CREATE TRIGGER audit_renewals_insert
  AFTER INSERT ON renewals
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_renewals_update ON renewals;
CREATE TRIGGER audit_renewals_update
  AFTER UPDATE ON renewals
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_renewals_delete ON renewals;
CREATE TRIGGER audit_renewals_delete
  AFTER DELETE ON renewals
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_entry();

-- ============================================
-- 12. PREVENT MODIFICATION OF AUDIT LOGS
-- ============================================

-- Create function to prevent updates/deletes on audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs cannot be modified or deleted. This is an immutable audit trail.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Prevent UPDATE on audit_logs
DROP TRIGGER IF EXISTS prevent_audit_logs_update ON audit_logs;
CREATE TRIGGER prevent_audit_logs_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- Prevent DELETE on audit_logs (except for service role via RLS)
DROP TRIGGER IF EXISTS prevent_audit_logs_delete ON audit_logs;
CREATE TRIGGER prevent_audit_logs_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_log_modification();

-- ============================================
-- 13. ADD ADDITIONAL INDEXES FOR AUDIT PERFORMANCE
-- ============================================

-- Index for querying by entity
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_id
  ON audit_logs(entity_type, entity_id);

-- Index for querying by actor
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created
  ON audit_logs(actor_id, created_at DESC);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_desc
  ON audit_logs(created_at DESC);

-- Partial index for specific actions (useful for compliance queries)
CREATE INDEX IF NOT EXISTS idx_audit_logs_status_changes
  ON audit_logs(entity_type, created_at DESC)
  WHERE action = 'UPDATE';

-- ============================================
-- 14. VERIFICATION QUERIES
-- ============================================

-- Verify audit functions were created
SELECT 'Audit functions created:' as status;
SELECT proname as function_name
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN ('log_audit_entry', 'log_audit_entry_light', 'prevent_audit_log_modification')
ORDER BY proname;

-- Verify audit triggers were created
SELECT 'Audit triggers created:' as status;
SELECT event_object_table as table_name, COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'audit_%'
GROUP BY event_object_table
ORDER BY event_object_table;

-- Verify protection triggers on audit_logs
SELECT 'Audit log protection triggers:' as status;
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'audit_logs'
  AND trigger_name LIKE 'prevent_%'
ORDER BY trigger_name;
