# Migration Fix Summary

## Issue
**Error:** `ERROR: 42501: must be owner of table objects`

**Cause:** The original migration tried to:
1. Execute `ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`
2. Create indexes on `storage.objects` table

In Supabase, the `storage` schema and its tables are **system-managed**. Regular users don't have permission to modify these tables. RLS is already enabled by default on `storage.objects`.

---

## What Was Fixed

### 1. **Removed Problematic ALTER TABLE Statement**
```sql
-- REMOVED: This caused the error
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- REPLACED WITH: Note that RLS is enabled by default
-- NOTE: In Supabase, storage.objects RLS is enabled by default
```

### 2. **Removed Index Creation on storage.objects**
```sql
-- REMOVED: These also require elevated permissions
CREATE INDEX IF NOT EXISTS storage_objects_bucket_path_idx
ON storage.objects (bucket_id, path);

CREATE INDEX IF NOT EXISTS storage_objects_bucket_created_idx
ON storage.objects (bucket_id, created_at);
```

### 3. **Moved Helper Functions to Public Schema**
```sql
-- BEFORE: storage schema (requires elevated permissions)
CREATE OR REPLACE FUNCTION storage.is_staff() ...

-- AFTER: public schema (user-accessible)
CREATE OR REPLACE FUNCTION public.is_staff() ...
```

### 4. **Simplified Helper Functions**
Removed dependencies on `storage.objects` table:
- `storage.is_owner()` - Removed (used direct `path LIKE auth.uid()` instead)
- `storage.is_parent_of_student()` - Simplified to not query storage.objects
- `storage.superintendent_can_access()` - Simplified to use joins on public.users only

### 5. **Made Policies Idempotent**
Added `DROP POLICY IF EXISTS` before each `CREATE POLICY`:
```sql
DROP POLICY IF EXISTS "Students can read own documents" ON storage.objects;
CREATE POLICY "Students can read own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'student-documents'
  AND path LIKE auth.uid() || '/%'
);
```

---

## Revised Migration File

**File:** `backend/migrations/001_create_storage_buckets_and_rls.sql`

**What it now does:**
1. ✅ Creates 4 storage buckets
2. ✅ Creates 5 helper functions in `public` schema
3. ✅ Creates 20+ RLS policies (idempotent)
4. ✅ Includes verification queries

**What it no longer tries to do:**
- ❌ ALTER storage.objects table
- ❌ Create indexes on storage.objects

---

## How to Run the Fixed Migration

### Step 1: Go to Supabase SQL Editor
```
https://app.supabase.com/project/fteqtsoifrqigegdvqhx/sql/new
```

### Step 2: Copy the revised SQL
```bash
cat backend/migrations/001_create_storage_buckets_and_rls.sql
```

### Step 3: Paste and Run
- Paste the entire SQL file
- Click "Run" button
- Should complete without errors

### Step 4: Verify
```bash
cd backend
node migrations/verify-storage.mjs
```

Expected output:
```
Storage Buckets: 4/4 configured
RLS Policies: 20+ configured
```

---

## Verification Queries in SQL Editor

After running the migration, these queries at the bottom of the file will verify:

### 1. Storage Buckets
```sql
SELECT * FROM storage.buckets
WHERE id IN ('applications-documents', 'student-documents', 'undertakings', 'system-generated');
```

**Expected:** 4 rows, one for each bucket

### 2. RLS Status
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'objects' AND schemaname = 'storage';
```

**Expected:** `objects | true` (RLS is enabled)

### 3. RLS Policies
```sql
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
```

**Expected:** 20+ policies

### 4. Helper Functions
```sql
SELECT proname as function_name
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
AND proname IN ('is_staff', 'has_role', 'has_vertical', 'is_parent_of_student', 'get_user_vertical');
```

**Expected:** 5 functions

---

## Key Changes Summary

| Aspect | Original | Fixed |
|--------|----------|-------|
| **RLS Enable** | `ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY` | ✅ Removed (already enabled by default) |
| **Indexes** | Create indexes on storage.objects | ✅ Removed (not needed, Supabase manages) |
| **Helper Functions Schema** | `storage.` schema | ✅ Changed to `public.` schema |
| **Helper Functions Complexity** | Queried storage.objects | ✅ Simplified to use auth.uid() and joins only |
| **Policy Creation** | `CREATE POLICY` only | ✅ Added `DROP POLICY IF EXISTS` for idempotency |
| **Permission Requirements** | Requires elevated permissions | ✅ User permissions only |

---

## Technical Notes

### Why RLS is Already Enabled
Supabase Storage automatically enables RLS on the `storage.objects` table when the storage extension is installed. You don't need to (and can't) manually enable it.

### Why Helper Functions in public Schema
The `storage` schema is managed by Supabase. Users can create policies on storage.objects, but cannot create functions in the storage schema. Moving functions to `public` schema makes them accessible from policies.

### Why Simplified Functions
The original functions tried to query `storage.objects` table directly. This is unnecessary and can cause circular dependencies. The revised functions use:
- `auth.uid()` to get current user ID
- Joins on `auth.users` and `public.users` tables
- Direct path comparisons in policies

---

## Next Steps

1. ✅ Run the revised migration in Supabase SQL Editor
2. ✅ Verify buckets and policies are created
3. ✅ Proceed to Task 32.2: Scaffold DocumentsModule and implement upload endpoint

---

**The migration is now fixed and should run without errors!**
