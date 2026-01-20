# Production Cutover Runbook

## Overview

This runbook documents the process for migrating from the db.json prototype to Supabase production database.

## Pre-requisites

- [ ] Supabase project created and configured
- [ ] All migrations applied to Supabase (see `supabase/migrations/`)
- [ ] Environment variables set in `.env`:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Backup of current db.json created
- [ ] Staging environment tested

## Migration Commands

```bash
# From backend directory
cd backend

# Step 1: Validate data (non-destructive)
npm run migrate:validate

# Step 2: Run migration
npm run migrate:run

# Step 3: Verify migration
npm run migrate:verify

# Or run all steps together
npm run migrate:full
```

## Cutover Timeline

### T-24 Hours: Pre-Cutover Preparation

1. **Freeze db.json writes**
   - Set `MAINTENANCE_MODE=true` in frontend environment
   - Notify users of planned maintenance window

2. **Create backup**
   ```bash
   cp db.json db.json.backup.$(date +%Y%m%d-%H%M%S)
   ```

3. **Run test migration on staging**
   ```bash
   npm run migrate:full -- --input ../db.json
   ```

4. **Run smoke tests on staging**
   - Verify API endpoints return data
   - Test authentication flow
   - Verify RLS policies work correctly

### T-0: Cutover Execution

1. **Enable maintenance mode**
   ```bash
   # Set environment variable
   export MAINTENANCE_MODE=true
   ```

2. **Final db.json backup**
   ```bash
   cp db.json db.json.final.$(date +%Y%m%d-%H%M%S)
   ```

3. **Run production migration**
   ```bash
   npm run migrate:full -- --input ../db.json
   ```

4. **Verify migration success**
   - Check migration report in `migration-reports/`
   - Verify all tables have expected counts
   - Run spot checks manually if needed

5. **Switch frontend to NestJS API**
   ```bash
   # Update frontend environment
   export API_URL=https://your-api.com/api/v1
   export USE_SUPABASE=true
   ```

6. **Deploy updated frontend**

7. **Disable maintenance mode**
   ```bash
   export MAINTENANCE_MODE=false
   ```

8. **Verify production**
   - Test login flow
   - Verify data displays correctly
   - Check audit logs are being created

### T+24 Hours: Post-Cutover Monitoring

1. **Monitor error rates**
   - Check Supabase dashboard for query errors
   - Review application logs

2. **Monitor performance**
   - Database CPU and memory usage
   - API response times
   - Query performance

3. **Verify integrations**
   - Payment gateway connectivity
   - Email/SMS notifications
   - Document uploads

## Rollback Procedure

If critical issues are discovered after cutover:

### Quick Rollback (< 1 hour after cutover)

1. **Switch frontend back to db.json**
   ```bash
   export USE_SUPABASE=false
   export API_URL=http://localhost:3001  # json-server
   ```

2. **Redeploy frontend**

3. **Notify users of extended maintenance**

### Full Rollback (> 1 hour, data may have changed)

1. **Enable maintenance mode**

2. **Export any new data from Supabase**
   ```sql
   -- Export new records created after migration
   SELECT * FROM applications WHERE created_at > '2026-01-20T00:00:00Z';
   ```

3. **Merge new data back to db.json**
   - Manual process, requires careful review

4. **Switch to db.json**

5. **Disable maintenance mode**

## Contact Information

| Role | Contact |
|------|---------|
| Tech Lead | [Name] |
| DBA | [Name] |
| On-call | [Name] |

## Checklist Summary

### Pre-Cutover
- [ ] db.json backup created
- [ ] Staging migration successful
- [ ] Smoke tests passed
- [ ] Team notified

### Cutover
- [ ] Maintenance mode enabled
- [ ] Final backup created
- [ ] Migration completed
- [ ] Verification passed
- [ ] Frontend switched
- [ ] Maintenance mode disabled

### Post-Cutover
- [ ] Production verified
- [ ] Monitoring active
- [ ] Team debriefed
- [ ] Documentation updated

## Troubleshooting

### Migration fails with "duplicate key" error

The migration uses upsert, but if there are conflicting records:
```bash
# Check for duplicates
SELECT id, COUNT(*) FROM users GROUP BY id HAVING COUNT(*) > 1;
```

### Verification shows count mismatch

This may be due to pre-existing data in Supabase:
```bash
# Check actual vs expected
SELECT COUNT(*) FROM users;
```

### Foreign key constraint errors

Ensure migration runs in correct order:
1. users
2. rooms
3. students
4. applications
5. documents
6. allocations
7. leaves
8. payments
9. renewals
10. audit_logs

### Performance issues during migration

Increase batch size for faster migration (risk: memory issues):
```typescript
const BATCH_SIZE = 500;  // In migration.service.ts
```

Or decrease for more stability:
```typescript
const BATCH_SIZE = 50;
```
