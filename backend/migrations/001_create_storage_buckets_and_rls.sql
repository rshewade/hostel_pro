-- Task 32.1: Configure Supabase Storage Buckets and RLS Policies
-- This migration creates storage buckets and access control policies for document management
-- Depends on: 000_create_database_schema.sql (users table with roles)
-- NOTE: Functions are in PUBLIC schema (storage schema is protected by Supabase)

-- ============================================
-- 1. CREATE STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'applications-documents',
  'applications-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'student-documents',
  'student-documents',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'undertakings',
  'undertakings',
  false,
  10485760,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'system-generated',
  'system-generated',
  false,
  20971520,
  ARRAY['application/pdf', 'application/zip']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- 2. CREATE HELPER FUNCTIONS IN PUBLIC SCHEMA
-- ============================================

CREATE OR REPLACE FUNCTION public.storage_is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_user_id = auth.uid()
    AND role IN ('SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.storage_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_user_id = auth.uid()
    AND role::TEXT = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.storage_has_vertical(required_vertical TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_user_id = auth.uid()
    AND vertical::TEXT = required_vertical
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.storage_get_user_id()
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id
  FROM public.users
  WHERE auth_user_id = auth.uid();
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.storage_is_owner(object_path TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  path_user_id TEXT;
  current_user_id UUID;
BEGIN
  path_user_id := split_part(object_path, '/', 1);
  SELECT id INTO current_user_id
  FROM public.users
  WHERE auth_user_id = auth.uid();
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN path_user_id = current_user_id::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.storage_is_parent_of_student(object_path TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  path_student_id TEXT;
  parent_mobile_val TEXT;
BEGIN
  path_student_id := split_part(object_path, '/', 1);
  SELECT mobile INTO parent_mobile_val
  FROM public.users
  WHERE auth_user_id = auth.uid()
  AND role = 'PARENT';
  IF parent_mobile_val IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id::TEXT = path_student_id
    AND parent_mobile = parent_mobile_val
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.storage_superintendent_can_access(object_path TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  path_student_id TEXT;
  super_vertical TEXT;
BEGIN
  SELECT vertical::TEXT INTO super_vertical
  FROM public.users
  WHERE auth_user_id = auth.uid()
  AND role = 'SUPERINTENDENT';
  IF super_vertical IS NULL THEN
    RETURN FALSE;
  END IF;
  path_student_id := split_part(object_path, '/', 1);
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id::TEXT = path_student_id
    AND vertical::TEXT = super_vertical
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. RLS POLICIES FOR APPLICATIONS-DOCUMENTS
-- ============================================

CREATE POLICY "applications_documents_insert_anon"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'applications-documents');

CREATE POLICY "applications_documents_select_student"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'applications-documents'
  AND public.storage_is_owner(name)
);

CREATE POLICY "applications_documents_select_parent"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'applications-documents'
  AND public.storage_has_role('PARENT')
  AND public.storage_is_parent_of_student(name)
);

CREATE POLICY "applications_documents_select_superintendent"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'applications-documents'
  AND public.storage_has_role('SUPERINTENDENT')
  AND public.storage_superintendent_can_access(name)
);

CREATE POLICY "applications_documents_select_trustee"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'applications-documents'
  AND public.storage_has_role('TRUSTEE')
);

CREATE POLICY "applications_documents_select_accounts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'applications-documents'
  AND public.storage_has_role('ACCOUNTS')
);

-- ============================================
-- 4. RLS POLICIES FOR STUDENT-DOCUMENTS
-- ============================================

CREATE POLICY "student_documents_select_owner"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-documents'
  AND public.storage_is_owner(name)
);

CREATE POLICY "student_documents_insert_owner"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-documents'
  AND public.storage_is_owner(name)
);

CREATE POLICY "student_documents_update_owner"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'student-documents'
  AND public.storage_is_owner(name)
)
WITH CHECK (
  bucket_id = 'student-documents'
  AND public.storage_is_owner(name)
);

CREATE POLICY "student_documents_delete_owner"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'student-documents'
  AND public.storage_is_owner(name)
);

CREATE POLICY "student_documents_select_parent"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-documents'
  AND public.storage_has_role('PARENT')
  AND public.storage_is_parent_of_student(name)
);

CREATE POLICY "student_documents_select_superintendent"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-documents'
  AND public.storage_has_role('SUPERINTENDENT')
  AND public.storage_superintendent_can_access(name)
);

CREATE POLICY "student_documents_select_trustee"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-documents'
  AND public.storage_has_role('TRUSTEE')
);

CREATE POLICY "student_documents_select_accounts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-documents'
  AND public.storage_has_role('ACCOUNTS')
);

-- ============================================
-- 5. RLS POLICIES FOR UNDERTAKINGS
-- ============================================

CREATE POLICY "undertakings_select_owner"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'undertakings'
  AND public.storage_is_owner(name)
);

CREATE POLICY "undertakings_select_parent"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'undertakings'
  AND public.storage_has_role('PARENT')
  AND public.storage_is_parent_of_student(name)
);

CREATE POLICY "undertakings_select_superintendent"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'undertakings'
  AND public.storage_has_role('SUPERINTENDENT')
  AND public.storage_superintendent_can_access(name)
);

CREATE POLICY "undertakings_select_trustee"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'undertakings'
  AND public.storage_has_role('TRUSTEE')
);

CREATE POLICY "undertakings_select_accounts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'undertakings'
  AND public.storage_has_role('ACCOUNTS')
);

CREATE POLICY "undertakings_insert_staff"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'undertakings'
  AND public.storage_is_staff()
);

-- ============================================
-- 6. RLS POLICIES FOR SYSTEM-GENERATED
-- ============================================

CREATE POLICY "system_generated_select_owner"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'system-generated'
  AND public.storage_is_owner(name)
);

CREATE POLICY "system_generated_select_parent"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'system-generated'
  AND public.storage_has_role('PARENT')
  AND public.storage_is_parent_of_student(name)
);

CREATE POLICY "system_generated_select_superintendent"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'system-generated'
  AND public.storage_has_role('SUPERINTENDENT')
  AND public.storage_superintendent_can_access(name)
);

CREATE POLICY "system_generated_select_trustee"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'system-generated'
  AND public.storage_has_role('TRUSTEE')
);

CREATE POLICY "system_generated_select_accounts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'system-generated'
  AND public.storage_has_role('ACCOUNTS')
);

CREATE POLICY "system_generated_insert_staff"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'system-generated'
  AND public.storage_is_staff()
);

-- ============================================
-- 7. SERVICE ROLE FULL ACCESS
-- ============================================

CREATE POLICY "service_role_all_buckets"
ON storage.objects FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
