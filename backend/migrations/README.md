# Supabase Migrations

This directory contains SQL migration scripts for the Supabase database and storage configuration.

## Available Migrations

### 001_create_storage_buckets_and_rls.sql

**Purpose:** Configure Supabase Storage buckets and Row Level Security (RLS) policies for document management.

**What it does:**
- Creates 4 storage buckets:
  - `applications-documents` - Applicant submissions (10MB limit)
  - `student-documents` - Student personal documents (10MB limit)
  - `undertakings` - Legal undertaking PDFs (10MB limit)
  - `system-generated` - Receipts, reports, merged files (20MB limit)

- Enables RLS on `storage.objects` table

- Creates helper functions for access control:
  - `storage.is_staff()` - Check if user has staff role
  - `storage.has_role(role)` - Check if user has specific role
  - `storage.has_vertical(vertical)` - Check if user has specific vertical
  - `storage.is_owner()` - Check if path belongs to user
  - `storage.is_parent_of_student()` - Check if parent can access child's docs
  - `storage.superintendent_can_access()` - Check superintendent access to vertical

- Creates RLS policies for each bucket based on user roles

## How to Run Migrations

### Option 1: Manual Execution (Recommended)

1. Open Supabase SQL Editor:
   - Go to: https://app.supabase.com/project/fteqtsoifrqigegdvqhx/sql/new
   - Or: Dashboard → SQL Editor → New Query

2. Copy the entire content of the migration file:
   ```bash
   cat migrations/001_create_storage_buckets_and_rls.sql
   ```

3. Paste into SQL Editor and click "Run"

4. Verify the results:
   - Check "Storage" tab in Supabase Dashboard to see created buckets
   - Run verification queries at the bottom of the SQL file

### Option 2: Using Migration Script (Experimental)

The migration script (`run-migration.mjs`) is available but currently requires a Supabase Management API token, which is different from the database service role key.

To use this script:
1. Obtain a Supabase Management API token from: https://app.supabase.com/account/tokens
2. Set environment variable: `export SUPABASE_MANAGEMENT_TOKEN=your_token_here`
3. Run: `node migrations/run-migration.mjs migrations/001_create_storage_buckets_and_rls.sql`

## Verification

After running the migration, verify the configuration:

### Check Storage Buckets
```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('applications-documents', 'student-documents', 'undertakings', 'system-generated')
ORDER BY id;
```

### Check RLS Policies
```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  array_to_string(roles, ', ') as roles,
  cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
```

### Check RLS is Enabled
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'objects' AND schemaname = 'storage';
```

## Access Control Matrix

### applications-documents
| Role | Read | Write |
|------|------|-------|
| Public (Anon) | ❌ | ✅ (during app) |
| Student | ✅ (own) | ❌ |
| Parent | ✅ (child's) | ❌ |
| Superintendent | ✅ (vertical) | ❌ |
| Trustee | ✅ (all) | ❌ |
| Accounts | ✅ (all) | ❌ |

### student-documents
| Role | Read | Write |
|------|------|-------|
| Public (Anon) | ❌ | ❌ |
| Student | ✅ (own) | ✅ (own) |
| Parent | ✅ (child's) | ❌ |
| Superintendent | ✅ (vertical) | ❌ |
| Trustee | ✅ (all) | ❌ |
| Accounts | ✅ (all) | ❌ |

### undertakings
| Role | Read | Write |
|------|------|-------|
| Public (Anon) | ❌ | ❌ |
| Student | ✅ (own) | ❌ |
| Parent | ✅ (child's) | ❌ |
| Superintendent | ✅ (vertical) | ❌ |
| Trustee | ✅ (all) | ❌ |
| Accounts | ✅ (all) | ❌ |

### system-generated
| Role | Read | Write |
|------|------|-------|
| Public (Anon) | ❌ | ❌ |
| Student | ✅ (own) | ❌ |
| Parent | ✅ (child's) | ❌ |
| Superintendent | ✅ (vertical) | ❌ |
| Trustee | ✅ (all) | ❌ |
| Accounts | ✅ (all) | ✅ |

## Troubleshooting

### Migration Fails with "bucket already exists"
This is expected if buckets were previously created. The migration uses `ON CONFLICT DO NOTHING` for buckets.

### RLS Policies Not Working
- Check that RLS is enabled on `storage.objects` table
- Verify the helper functions exist: `SELECT * FROM pg_proc WHERE pronamespace = 'storage'::regnamespace`
- Check policy names don't conflict with existing policies

### Access Denied Errors
- Verify the user's role in `public.users` table
- Check the user's `auth_user_id` matches the storage path
- Verify vertical assignment for superintendents
- Check parent-child relationships for parent access

## Next Steps

After running this migration, proceed to:
- **Task 32.2**: Scaffold DocumentsModule and implement upload endpoint
- **Task 32.3**: Implement signed URL generation with access control

## References

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Policies Guide](https://supabase.com/docs/guides/storage/security/access-control)
